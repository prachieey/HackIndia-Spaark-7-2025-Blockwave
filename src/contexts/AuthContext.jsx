import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { api } from '../utils/api';

// Helper function to check if a JWT token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // If we can't decode the token, consider it expired
  }
};

// Create auth context
export const AuthContext = createContext(null);

// Export the context for direct usage when needed
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for user and loading
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track if we're currently refreshing the token to prevent multiple refresh attempts
  const isRefreshing = useRef(false);
  
  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    try {
      // Clear user state and local storage
      setUser(null);
      setError(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear any pending API requests if the API client supports it
      if (api && typeof api.clearPendingRequests === 'function') {
        api.clearPendingRequests();
      }
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [navigate]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh-token', {}, {
        withCredentials: true
      });
      
      if (response && response.data && response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.token;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }, []);

  // Check authentication status on mount and route change
  useEffect(() => {
    const checkAuth = async () => {
      if (isInitialized) return;
      
      try {
        setLoading(true);
        
        // Check for token in localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          setIsInitialized(true);
          return;
        }
        
        // Check if token is expired
        if (isTokenExpired(token)) {
          console.log('Token expired, attempting to refresh...');
          const newToken = await refreshToken();
          if (!newToken) {
            console.log('Failed to refresh token, logging out...');
            logout();
            return;
          }
          // Continue with the new token
        }
        
        // Verify the token with the server
        try {
          const response = await api.get('/auth/verify', {
            withCredentials: true
          });
          
          if (response && response.valid) {
            const userData = response.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            console.log('Token verification failed, logging out...');
            logout();
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          // If verification fails, try to refresh the token one more time
          if (error.status === 401) {
            const newToken = await refreshToken();
            if (!newToken) {
              logout();
              return;
            }
            // If we got a new token, verify it
            try {
              const retryResponse = await api.get('/auth/verify', {
                withCredentials: true
              });
              
              if (retryResponse && retryResponse.valid) {
                const userData = retryResponse.user;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return;
              }
            } catch (retryError) {
              console.error('Error during token verification retry:', retryError);
            }
          }
          logout();
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        logout();
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };
    
    checkAuth();
  }, [location, logout, isInitialized, refreshToken]);

  // Login function
  const login = useCallback(
    async (emailOrCredentials, password, options = {}) => {
      // Handle different parameter patterns
      let loginEmail, loginPassword, rememberMe, isFirebaseUser = false;
      
      // Handle null/undefined input
      if (emailOrCredentials === null || emailOrCredentials === undefined) {
        console.log('No credentials provided, treating as logout');
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return { success: true, user: null };
      }
      
      if (typeof emailOrCredentials === 'object') {
        // Handle case where first argument is an object
        const credentials = emailOrCredentials;
        
        // Check if this is a Firebase user object
        if (credentials.uid && credentials.providerData) {
          isFirebaseUser = true;
          loginEmail = credentials.email || '';
          loginPassword = ''; // No password for Firebase auth
          rememberMe = true; // Firebase handles persistence
        } else {
          // Regular credentials object
          loginEmail = credentials.email || '';
          loginPassword = credentials.password || '';
          rememberMe = credentials.rememberMe || false;
        }
      } else {
        // Handle case where email and password are separate parameters
        loginEmail = emailOrCredentials || '';
        loginPassword = password || '';
        rememberMe = options.rememberMe || false;
      }
      
      // Validate inputs
      if (!isFirebaseUser) {
        if (!loginEmail.trim()) {
          throw new Error('Email is required');
        }
        if (!loginPassword) {
          throw new Error('Password is required');
        }
      } else if (!loginEmail.trim()) {
        // For Firebase users, we still need at least an email
        console.error('Firebase user is missing email');
        throw new Error('Authentication failed: Invalid user data');
      }
      
      setLoading(true);
      setError(null);
      
      console.log('Starting login process...');
      console.log('Email:', loginEmail);
      console.log('Remember me:', rememberMe);

      try {
        // Handle Firebase users differently (no API call needed)
        if (isFirebaseUser) {
          console.log('Handling Firebase user login...');
          
          // Create a user object that matches your application's expected format
          const firebaseUser = emailOrCredentials;
          const userData = {
            _id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            role: 'user', // Default role, adjust as needed
            ...firebaseUser.providerData[0],
            emailVerified: firebaseUser.emailVerified,
            photoURL: firebaseUser.photoURL,
            providerId: firebaseUser.providerId,
            uid: firebaseUser.uid
          };
          
          console.log('Firebase user data:', userData);
          
          // Update user state and localStorage
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Show success message
          toast.success('Logged in successfully!');
          
          // Redirect to the intended URL or home
          const from = location.state?.from?.pathname || '/';
          console.log('Redirecting after Firebase login to:', from);
          navigate(from, { replace: true });
          
          return { success: true, user: userData };
        }
        
        // Handle regular email/password login
        console.log('Calling auth.login with credentials...', { 
          email: loginEmail, 
          hasPassword: !!loginPassword,
          rememberMe 
        });
        
        // Add a timeout to prevent hanging
        const loginPromise = api.auth.login({
          email: loginEmail,
          password: loginPassword,
          rememberMe
        });
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Login request timed out after 30 seconds')), 30000)
        );
        
        const response = await Promise.race([loginPromise, timeoutPromise]);
        console.log('Auth login response:', response);

        // Check if we have a valid response with user data
        if (response && (response.user || response.data?.user || response.data)) {
          // Handle different response formats
          const userData = response.user || response.data?.user || response.data;
          const token = response.token || response.data?.token || localStorage.getItem('token');
          
          console.log('Login successful, user data:', {
            id: userData._id,
            email: userData.email,
            role: userData.role,
            hasToken: !!token
          });
          
          // Store the token in localStorage if available
          if (token) {
            localStorage.setItem('token', token);
            console.log('Token stored in localStorage');
          } else {
            console.warn('No token received in login response');
          }
          
          // Update user state and localStorage
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Show success message
          toast.success('Logged in successfully!');
          
          // Redirect to the intended URL or home
          const from = location.state?.from?.pathname || '/';
          console.log('Redirecting after login to:', from);
          navigate(from, { replace: true });
          
          return { success: true, user: userData };
        } else {
          const errorMsg = response?.message || 'Login failed: Invalid response from server';
          console.error('Login failed - Invalid response:', {
            response,
            hasUserData: !!(response?.user || response?.data?.user || response?.data),
            hasToken: !!(response?.token || response?.data?.token)
          });
          throw new Error(errorMsg);
        }
      } catch (error) {
        // Enhanced error logging
        const errorDetails = {
          name: error.name,
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            withCredentials: error.config?.withCredentials,
            headers: error.config?.headers
          },
          response: error.response?.data || 'No response data',
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
        
        console.error('Login error details:', JSON.stringify(errorDetails, null, 2));
        
        // Log to server if available
        if (window.trackJs) {
          window.trackJs.track(error);
        }
        
        // Extract user-friendly error message
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const { status, data } = error.response;
          
          if (status === 401) {
            errorMessage = data?.message || 'Invalid email or password. Please try again.';
          } else if (status === 403) {
            errorMessage = data?.message || 'Access denied. Please verify your account or contact support.';
          } else if (status === 429) {
            errorMessage = 'Too many login attempts. Please try again later.';
          } else if (status >= 500) {
            errorMessage = 'Server error. Please try again later or contact support if the problem persists.';
          } else if (data?.message) {
            errorMessage = data.message;
          }
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.message) {
          // Something happened in setting up the request that triggered an Error
          errorMessage = error.message;
        }
        
        // Update error state and show toast
        setError(errorMessage);
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        
        // Clear any partial auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        
        return { 
          success: false, 
          error: errorMessage,
          status: error.response?.status,
          data: error.response?.data
        };
      } finally {
        setLoading(false);
      }
    },
    [navigate, location.state]
  );

  // Signup function
  const signup = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error('Please provide all required fields');
      }
      
      // Use the auth.register function from the API service
      const result = await auth.register({
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password,
        passwordConfirm: userData.passwordConfirm || userData.password
      });
      
      console.log('Signup result:', result);
      
      if (result && (result.user || result.data?.user)) {
        const user = result.user || result.data.user;
        setUser(user);
        
        // Store the token if available
        if (result.token) {
          localStorage.setItem('token', result.token);
        }
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        
        // Show success message
        toast.success('Registration successful! You are now logged in.');
        
        // Redirect to home or intended URL
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
        
        return { success: true, user };
      }
      
      throw new Error('Registration failed. Please try again.');
    } catch (error) {
      console.error('Signup error:', error);
      const errorMsg = error.message || 'An error occurred during signup. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [navigate, location.state]);

  // Check if the current user is an admin
  const isAdmin = useMemo(() => {
    return user?.role === 'admin';
  }, [user]);

  // Value to be provided by the context
  const contextValue = useMemo(() => ({
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin,
    isInitialized,
  }), [user, loading, error, login, logout, isAdmin, isInitialized]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

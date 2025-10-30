import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import http from '../services/httpService';

// Helper functions
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

const safeJsonParse = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Create auth context
export const NewAuthContext = createContext(null);

export const useNewAuth = () => {
  const context = useContext(NewAuthContext);
  if (!context) {
    throw new Error('useNewAuth must be used within a NewAuthProvider');
  }
  return context;
};

export const NewAuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [user, setUser] = useState(() => safeJsonParse('scantyx_user'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const tokenRef = useRef(localStorage.getItem('scantyx_token'));
  const refreshTokenRef = useRef(localStorage.getItem('scantyx_refresh_token'));

  // API base URL
  const API_BASE_URL = 'http://localhost:5002/api/v1';

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    const token = tokenRef.current || localStorage.getItem('scantyx_token');
    return !!token && !isTokenExpired(token);
  }, []);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user?.role === 'admin' || user?.role === 'superadmin';
  }, [user]);

  // Persist auth data to localStorage
  const persistAuthData = useCallback(({ user, token, refreshToken }) => {
    if (user) {
      localStorage.setItem('scantyx_user', JSON.stringify(user));
      setUser(user);
    }
    if (token) {
      localStorage.setItem('scantyx_token', token);
      tokenRef.current = token;
      http.setAuthToken(token);
    }
    if (refreshToken) {
      localStorage.setItem('scantyx_refresh_token', refreshToken);
      refreshTokenRef.current = refreshToken;
    }
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await http.post(`${API_BASE_URL}/auth/login`, { email, password });
      
      if (response.data && response.data.token) {
        const { token, refreshToken, user: userData } = response.data;
        persistAuthData({ user: userData, token, refreshToken });
        
        // Redirect to the intended page or home
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
        
        return { success: true, user: userData };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [navigate, location, persistAuthData]);

  // Logout function
  const logout = useCallback(() => {
    // Clear all auth data
    localStorage.removeItem('scantyx_user');
    localStorage.removeItem('scantyx_token');
    localStorage.removeItem('scantyx_refresh_token');
    
    // Reset state
    setUser(null);
    tokenRef.current = null;
    refreshTokenRef.current = null;
    
    // Clear HTTP auth header
    http.setAuthToken(null);
    
    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = tokenRef.current || localStorage.getItem('scantyx_token');
        
        if (token && !isTokenExpired(token)) {
          // Token is valid, fetch user data
          try {
            const response = await http.get(`${API_BASE_URL}/auth/me`);
            if (response.data) {
              setUser(response.data);
              localStorage.setItem('scantyx_user', JSON.stringify(response.data));
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            // If there's an error, log the user out
            logout();
          }
        } else if (token && refreshTokenRef.current) {
          // Try to refresh the token
          try {
            const response = await http.post(`${API_BASE_URL}/auth/refresh-token`, {
              refreshToken: refreshTokenRef.current
            });
            
            if (response.data && response.data.token) {
              const { token, refreshToken, user: userData } = response.data;
              persistAuthData({ user: userData, token, refreshToken });
              return;
            }
          } catch (error) {
            console.error('Error refreshing token:', error);
          }
          
          // If we get here, token refresh failed - log out
          logout();
        } else {
          // No valid token or refresh token
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    checkAuthStatus();

    return () => {
      isMounted.current = false;
    };
  }, [logout, persistAuthData]);

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    login,
    logout,
    setError
  };

  return (
    <NewAuthContext.Provider value={value}>
      {!loading && children}
    </NewAuthContext.Provider>
  );
};

export default NewAuthContext;

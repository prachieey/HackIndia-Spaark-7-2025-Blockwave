import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Helper function to clean URL parameters
const cleanUrl = () => {
  if (window.location.search) {
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialRender = useRef(true);
  const formRef = useRef(null);

  // Handle session expiration message
  useEffect(() => {
    cleanUrl();
    
    const searchParams = new URLSearchParams(location.search);
    const errorType = searchParams.get('error');
    
    if (errorType === 'session_expired') {
      setError('Your session has expired. Please log in again.');
    }
  }, [location]);

  // Handle redirection after authentication
  useEffect(() => {
    // Skip the initial render
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    // If we're authenticated and still on the login page, redirect to home
    if (isAuthenticated && window.location.pathname === '/login') {
      console.log('User authenticated, redirecting to home...');
      // Clear any URL parameters before redirecting
      cleanUrl();
      // Use window.location.href to force a full page reload
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  const validateForm = () => {
    // Reset previous errors
    setError('');
    
    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!password) {
      setError('Please enter your password');
      return false;
    }
    
    if (!isLogin && !name.trim()) {
      setError('Please enter your name');
      return false;
    }
    
    // Password strength validation for signup
    if (!isLogin && password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prevent multiple submissions
    if (loading) return;
    
    setLoading(true);
    setError(''); // Clear previous errors
    
    try {
      console.log(`Attempting ${isLogin ? 'login' : 'signup'} with email:`, email);
      
      // Clear any existing auth data
      const authKeys = [
        'token', 'scantyx_token', 'auth_token', 'refreshToken',
        'scantyx_user', 'user', 'authState', 'session'
      ];
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Clear cookies that might be related to auth
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name && ['token', 'auth_token', 'session', 'connect.sid'].includes(name)) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        }
      });
      
      try {
        // Call the appropriate auth function
        let result;
        if (isLogin) {
          result = await login(email, password);
        } else {
          result = await signup(name, email, password);
        }
        
        console.log('Auth result:', result);
        
        if (result?.success) {
          // The AuthContext will handle the redirect via the isAuthenticated change
          console.log('Authentication successful, redirecting...');
          return;
        } else {
          // Handle specific error messages from the API
          const errorMsg = result?.error || 
            `Failed to ${isLogin ? 'log in' : 'sign up'}. Please check your credentials and try again.`;
          throw new Error(errorMsg);
        }
      } catch (authError) {
        console.error('Authentication error:', authError);
        throw authError; // Re-throw to be caught by the outer catch
      }
      
    } catch (error) {
      console.error('Auth error:', error);
      
      // Handle specific error cases with more user-friendly messages
      let errorMsg = 'An unexpected error occurred. Please try again.';
      
      if (error?.response) {
        // Server responded with an error status code (4xx, 5xx)
        errorMsg = error.response.data?.message || 
                 error.response.data?.error || 
                 `Server error: ${error.response.status}`;
      } else if (error?.request) {
        // Request was made but no response received
        errorMsg = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error?.message) {
        // Error from our code or the API
        errorMsg = error.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        {/* Logo and Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Scams, Just Scans
          </h1>
          <p className="text-gray-500 text-lg">
            {isLogin ? 'Sign In' : 'Create Account'}
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Auth Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit} ref={formRef}>
          <div className="space-y-4">
            {/* Name Field (only for signup) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                {isLogin && (
                  <Link 
                    to="/forgot-password" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150"
                  placeholder={isLogin ? '••••••••' : 'At least 8 characters'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">
                  Use at least 8 characters with a mix of letters, numbers & symbols
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </div>
          
          {/* Toggle between Login/Signup */}
          <div className="text-center text-sm pt-2">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  // Reset form when toggling
                  formRef.current?.reset();
                  setError('');
                  setEmail('');
                  setPassword('');
                  setName('');
                  setIsLogin(!isLogin);
                }}
                className="ml-1.5 font-medium text-blue-600 hover:text-blue-500 focus:outline-none transition-colors"
                disabled={loading}
              >
                {isLogin ? ' Sign Up' : ' Sign In'}
              </button>
            </p>
            
            {/* Demo credentials - only show on login */}
            {isLogin ? (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Demo Account:</span> demo@example.com / demo123
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Admin Account:</span> admin@scantyx.com / Admin@123!
                </p>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

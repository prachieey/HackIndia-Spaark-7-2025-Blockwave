import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  signInWithGoogle, 
  signInWithFacebook, 
  signInWithApple 
} from '../config/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    facebook: false,
    apple: false
  });
  const formRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, signup, isAuthenticated, user } = useAuth();
  
  const initialRender = useRef(true);

  // Handle session expiration message and mode from URL
  useEffect(() => {
    cleanUrl();
    
    const searchParams = new URLSearchParams(location.search);
    const errorType = searchParams.get('error');
    const modeParam = searchParams.get('mode');
    
    if (modeParam === 'signup') {
      setIsLogin(false);
    } else if (modeParam === 'login') {
      setIsLogin(true);
    }
    
    if (errorType === 'session_expired') {
      setError('Your session has expired. Please log in again.');
    }
  }, [location]);

  // Handle redirection after authentication
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    if (isAuthenticated && window.location.pathname === '/login') {
      console.log('User authenticated, redirecting to home...');
      // Clear any URL parameters before redirecting
      cleanUrl();
      // Use window.location.href to force a full page reload
      window.location.href = '/';
    }
  }, [isAuthenticated]);


  const toggleAuthMode = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setIsLogin(!isLogin);
  };

  const validateForm = () => {
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
        console.log('Calling auth function with:', { email, password });
        
        // Call the appropriate auth function
        let result;
        if (isLogin) {
          result = await login(email, password);
        } else {
          result = await signup(name, email, password);
        }
        
        console.log('Auth result:', result);
        
        if (result?.success) {
          // The AuthContext's login function will handle setting the user state
          // and redirecting to the intended URL or home
          console.log('Authentication successful, redirecting...');
          
          // Show success message
          const userData = result.user || result.data?.user;
          if (userData) {
            toast.success(`Welcome back, ${userData.name || userData.email}!`);
          } else {
            toast.success('Login successful!');
          }
          
          // The AuthContext should handle the redirect, but just in case:
          const from = location.state?.from?.pathname || '/';
          console.log('Redirecting to:', from);
          navigate(from, { replace: true });
        } else {
          // Handle specific error messages from the API
          const errorMsg = result?.error || result?.message || 
            `Failed to ${isLogin ? 'log in' : 'sign up'}. Please check your credentials and try again.`;
          throw new Error(errorMsg);
        }
      } catch (authError) {
        console.error('Authentication error:', {
          name: authError.name,
          message: authError.message,
          stack: authError.stack,
          response: authError.response?.data || 'No response data'
        });
        
        // Handle specific error cases
        let errorMessage = authError.message;
        
        if (authError.response) {
          // Server responded with an error status code (4xx, 5xx)
          const { status, data } = authError.response;
          
          if (status === 401) {
            errorMessage = 'Invalid email or password';
          } else if (status === 400) {
            errorMessage = data?.message || 'Invalid request. Please check your input.';
          } else if (status === 403) {
            errorMessage = 'Your account is not authorized to access this resource.';
          } else if (status === 429) {
            errorMessage = 'Too many login attempts. Please try again later.';
          } else if (status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        } else if (authError.request) {
          // The request was made but no response was received
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-600 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.1, 1],
            x: ['-25%', '-20%', '-25%'],
            y: ['25%', '20%', '25%']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
        <motion.div 
          className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.1, 1],
            x: ['25%', '30%', '25%'],
            y: ['-25%', '-30%', '-25%']
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: 2
          }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-lg bg-white/5 rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </motion.h1>
              <motion.p 
                className="text-gray-300 mt-3 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isLogin ? 'Sign in to continue to your account' : 'Get started with your account today'}
              </motion.p>
            </div>
            
            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                </div>
              
              </motion.div>
            )}
            
            {/* Auth Form */}
            <form className="space-y-6" onSubmit={handleSubmit} ref={formRef}>
              {/* Name Field (only for signup) */}
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name" className="text-sm font-medium text-gray-200">Full Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="John Doe"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-sm"></div>
                  </div>
                </motion.div>
              )}
              
              {/* Email Field */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: !isLogin ? 0.3 : 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-sm font-medium text-gray-200">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="you@example.com"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-sm"></div>
                </div>
              </motion.div>
              
              {/* Password Field */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: !isLogin ? 0.4 : 0.3 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-200">Password</Label>
                  {isLogin && (
                    <Link to="/forgot-password" className="text-xs text-purple-300 hover:text-white transition-colors">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-sm"></div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: !isLogin ? 0.5 : 0.4 }}
                className="pt-4"
              >
                <Button 
                  type="submit" 
                  className={cn(
                    "w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group",
                    "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700",
                    "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:shadow-purple-500/30",
                    "focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none",
                    loading && "opacity-90 cursor-not-allowed"
                  )}
                  disabled={loading}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 mr-2 -ml-1 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : isLogin ? (
                      'Sign In'
                    ) : (
                      'Create Account'
                    )}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: !isLogin ? 0.6 : 0.5 }}
                className="text-center text-sm text-gray-400 mt-4"
              >
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    formRef.current?.reset();
                    setError('');
                    setEmail('');
                    setPassword('');
                    setName('');
                    navigate(isLogin ? '/login?mode=signup' : '/login', { replace: true });
                  }}
                  className="font-medium text-purple-300 hover:text-white focus:outline-none transition-colors"
                  disabled={loading}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </motion.div>
            </form>
            
            {/* Social Login Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6 border-t border-white/10"
            >
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#0f172a] text-gray-400">Or continue with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* Google Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      setSocialLoading(prev => ({ ...prev, google: true }));
                      setError('');
                      try {
                        // This will redirect to Google for authentication
                        await signInWithGoogle();
                        // The actual sign-in will complete after the redirect
                      } catch (err) {
                        console.error('Google sign in error:', err);
                        setError('Failed to sign in with Google. Please try again.');
                        setSocialLoading(prev => ({ ...prev, google: false }));
                      }
                    }}
                    disabled={socialLoading.google || loading}
                    className={`flex items-center justify-center w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors ${
                      socialLoading.google ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {socialLoading.google ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                  </button>
                  
                  {/* Apple Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      setSocialLoading(prev => ({ ...prev, apple: true }));
                      setError('');
                      try {
                        const { user, error } = await signInWithApple();
                        if (error) throw new Error(error);
                        // Redirect or handle successful login
                        navigate(from, { replace: true });
                      } catch (err) {
                        console.error('Apple sign in error:', err);
                        setError('Failed to sign in with Apple. Please try again.');
                      } finally {
                        setSocialLoading(prev => ({ ...prev, apple: false }));
                      }
                    }}
                    disabled={socialLoading.apple || loading}
                    className={`flex items-center justify-center w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors ${
                      socialLoading.apple ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {socialLoading.apple ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    )}
                  </button>
                  
                  {/* Meta (Facebook) Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      setSocialLoading(prev => ({ ...prev, facebook: true }));
                      setError('');
                      try {
                        const { user, error } = await signInWithFacebook();
                        if (error) throw new Error(error);
                        // Redirect or handle successful login
                        navigate(from, { replace: true });
                      } catch (err) {
                        console.error('Facebook sign in error:', err);
                        setError('Failed to sign in with Facebook. Please try again.');
                      } finally {
                        setSocialLoading(prev => ({ ...prev, facebook: false }));
                      }
                    }}
                    disabled={socialLoading.facebook || loading}
                    className={`flex items-center justify-center w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors ${
                      socialLoading.facebook ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {socialLoading.facebook ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.797v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
            
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 pt-6 text-center border-t border-white/10"
              >
                <p className="text-xs text-gray-400">
                  By creating an account, you agree to our{' '}
                  <a href="/terms" className="text-purple-300 hover:text-white transition-colors">Terms of Service</a> and{' '}
                  <a href="/privacy" className="text-purple-300 hover:text-white transition-colors">Privacy Policy</a>
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;

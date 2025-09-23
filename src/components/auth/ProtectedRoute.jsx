import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for token in all possible locations
  const getToken = () => {
    const tokenKeys = ['token', 'scantyx_token', 'auth_token'];
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token) return token;
    }
    return null;
  };

  const token = getToken();
  
  // Set initialized to true after first render and auth check
  useEffect(() => {
    // Add a small delay to ensure all auth checks are complete
    const timer = setTimeout(() => {
      setInitialized(true);
      setIsCheckingAuth(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading state while auth is being checked
  if (loading || !initialized || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If we have a token but auth is still not complete, wait a bit more
  if (token && !isAuthenticated && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Only redirect to login if we're sure the user is not authenticated
  if (!isAuthenticated && !token) {
    // Don't redirect if we're already on the login page
    if (location.pathname === '/login') {
      return children;
    }
    
    console.log('Redirecting to login');
    
    return (
      <Navigate
        to="/login"
        state={{ message: 'Please log in to access this page' }}
        replace
      />
    );
  }

  // If authenticated but user data is still loading
  if (isAuthenticated && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If authenticated and user data is loaded, render the protected content
  return children;
};

export default ProtectedRoute;

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, isPublic = false }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);
  
  // Set initialized after first render
  useEffect(() => {
    setInitialized(true);
  }, []);

  // 1. If it's a public route, render immediately
  if (isPublic) {
    return children;
  }

  // 2. For protected routes, wait for auth initialization
  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // 3. If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ 
          message: 'Please log in to access this page', 
          from: location.pathname 
        }}
        replace
      />
    );
  }

  // 4. If we get here, user is authenticated - render the protected content
  return children;
};

export default ProtectedRoute;

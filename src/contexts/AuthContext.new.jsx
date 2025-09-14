import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(() => ({
    user: JSON.parse(localStorage.getItem('scantyx_user') || 'null'),
    loading: false,
    error: null,
  }));

  // Memoize admin credentials to prevent recreation
  const ADMIN_CREDENTIALS = useMemo(() => ({
    email: 'admin@scantyx.com',
    password: 'admin123',
  }), []);

  // Update state with callback support
  const updateAuthState = useCallback((newState) => {
    setState(prev => ({
      ...prev,
      ...(typeof newState === 'function' ? newState(prev) : newState)
    }));
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    updateAuthState({ loading: true, error: null });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Admin login check
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const adminUser = {
          id: 'admin',
          name: 'Admin',
          email: ADMIN_CREDENTIALS.email,
          role: 'admin',
          createdAt: new Date().toISOString(),
        };

        updateAuthState({
          user: adminUser,
          loading: false,
        });

        localStorage.setItem('scantyx_user', JSON.stringify(adminUser));
        return { success: true };
      }

      // Regular user login
      const mockUser = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        name: email.split('@')[0],
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      updateAuthState({
        user: mockUser,
        loading: false,
      });

      localStorage.setItem('scantyx_user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Failed to login';
      updateAuthState({ 
        loading: false, 
        error: errorMessage 
      });
      return { success: false, error: errorMessage };
    }
  }, [ADMIN_CREDENTIALS, updateAuthState]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear local storage
      localStorage.removeItem('scantyx_user');
      localStorage.removeItem('auth_token');
      
      // Clear state
      updateAuthState({
        user: null,
        loading: false,
        error: null,
      });

      // Clear cookies
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }, [updateAuthState]);

  // Memoize the context value
  const contextValue = useMemo(() => ({
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
    login,
    logout,
  }), [state.user, state.loading, state.error, login, logout]);

  // Debug effect
  useEffect(() => {
    console.log('Auth state updated:', {
      user: state.user,
      isAuthenticated: !!state.user,
      isAdmin: state.user?.role === 'admin',
      loading: state.loading,
    });
  }, [state.user, state.loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

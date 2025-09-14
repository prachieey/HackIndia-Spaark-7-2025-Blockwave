import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const storedUser = localStorage.getItem('scantyx_user');
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      loading: false,
      error: null
    };
  });

  // Admin credentials - use useMemo to prevent recreation
  const ADMIN_CREDENTIALS = useMemo(() => ({
    email: 'admin@scantyx.com',
    password: 'admin123' // Using the password we set in createAdmin.js
  }), []);

  // Wrap state updates in useCallback to maintain referential equality
  const setAuthState = useCallback((newState) => {
    setState(prev => ({
      ...prev,
      ...(typeof newState === 'function' ? newState(prev) : newState)
    }));
  }, []);

  const login = useCallback(async (email, password) => {
    console.log('Login attempt with:', { email });
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if admin login
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const adminUser = {
          id: 'admin',
          name: 'Admin',
          email: ADMIN_CREDENTIALS.email,
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        
        setState({ 
          user: adminUser,
          loading: false,
          error: null
        });
        
        localStorage.setItem('scantyx_user', JSON.stringify(adminUser));
        return { success: true };
      }

      // Regular user login
      const mockUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email,
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      setState(prev => ({
        ...prev,
        user: mockUser,
        loading: false
      }));
      localStorage.setItem('scantyx_user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to login'
      }));
      return { success: false, error: error.message || 'Failed to login' };
    }
  }, [ADMIN_CREDENTIALS, setState]);

  const signup = async (name, email, password) => {
    try {
      // Prevent signup with admin email
      if (email === ADMIN_EMAIL) {
        return { success: false, error: 'This email is reserved' };
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        name,
        email,
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      setUser(mockUser);
      localStorage.setItem('scantyx_user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      console.error('Error during signup:', error);
      return { success: false, error: error.message || 'Failed to sign up' };
    }
  };

  const logout = async () => {
    console.log('[AuthContext] Logout initiated');
    try {
      // Try to disconnect wallet if Web3 is available
      if (window.ethereum) {
        console.log('[AuthContext] Disconnecting wallet');
        try {
          // Try to use Web3Context first
          const { disconnectWallet } = await import('./blockchain/Web3Context');
          if (typeof disconnectWallet === 'function') {
            await disconnectWallet();
            console.log('[AuthContext] Wallet disconnected via Web3Context');
          }
        } catch (error) {
          console.warn('[AuthContext] Error using Web3Context, using direct ethereum API', error);
          // Fallback to direct ethereum API
          if (window.ethereum.removeListener) {
            window.ethereum.removeAllListeners();
          }
          if (window.ethereum._state) {
            window.ethereum._state.accounts = [];
          }
          if (window.ethereum.selectedAddress) {
            window.ethereum.selectedAddress = null;
          }
        }
      }
      
      // Call the logout API
      try {
        console.log('[AuthContext] Calling logout API');
        await authAPI.logout();
        console.log('[AuthContext] Logout API call successful');
      } catch (error) {
        console.warn('[AuthContext] Logout API call failed, but continuing with local logout', error);
      }
      
      // Clear all local data
      console.log('[AuthContext] Clearing local storage and state');
      setUser(null);
      localStorage.removeItem('scantyx_user');
      localStorage.removeItem('auth_token');
      sessionStorage.clear();
      
      // Clear any remaining cookies by setting an expired cookie
      console.log('[AuthContext] Clearing cookies');
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      console.log('[AuthContext] Logout completed successfully');
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Error during logout:', error);
      // Ensure we still clear local data even if there's an error
      setUser(null);
      localStorage.removeItem('scantyx_user');
      localStorage.removeItem('auth_token');
      sessionStorage.clear();
      return { success: false, error: error.message || 'Failed to logout' };
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user: state.user,
    loading: state.loading,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
    login,
    signup,
    logout,
    setAuthState
  }), [state.user, state.loading, login, signup, logout, setAuthState]);

  // Debug: Log when auth state changes
  useEffect(() => {
    console.log('Auth state updated:', {
      user: state.user,
      isAuthenticated: !!state.user,
      isAdmin: state.user?.role === 'admin',
      loading: state.loading
    });
  }, [state.user, state.loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
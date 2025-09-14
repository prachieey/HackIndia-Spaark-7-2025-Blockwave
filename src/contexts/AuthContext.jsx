import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin credentials
  const ADMIN_EMAIL = 'admin@scantyx.com';
  const ADMIN_PASSWORD = 'Admin@123!'; // In production, this should be properly secured

  useEffect(() => {
    const storedUser = localStorage.getItem('scantyx_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('Login attempt with:', { email });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if admin login
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser = {
          id: 'admin',
          name: 'Admin',
          email: ADMIN_EMAIL,
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        console.log('Admin login successful, setting user:', adminUser);
        setUser(adminUser);
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
      
      setUser(mockUser);
      localStorage.setItem('scantyx_user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to login' };
    }
  };

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
    console.log('Logout initiated');
    try {
      // Clear any active web3 connections
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
      
      // Clear user data
      console.log('Clearing user data');
      setUser(null);
      localStorage.removeItem('scantyx_user');
      
      // Clear any additional auth tokens or session data
      localStorage.removeItem('auth_token');
      sessionStorage.clear();
      
      console.log('Logout successful');
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  // Debug: Log when auth state changes
  useEffect(() => {
    console.log('Auth state updated:', {
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      loading
    });
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
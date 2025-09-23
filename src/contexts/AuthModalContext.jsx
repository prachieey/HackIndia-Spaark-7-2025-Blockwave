import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthModalContext = createContext();

export const AuthModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' or 'signup'

  const openAuthModal = useCallback((modalMode = 'login') => {
    setMode(modalMode);
    setIsOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = 'unset'; // Re-enable scrolling
  }, []);

  const value = {
    isOpen,
    mode,
    openAuthModal,
    closeAuthModal,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};

export default AuthModalContext;

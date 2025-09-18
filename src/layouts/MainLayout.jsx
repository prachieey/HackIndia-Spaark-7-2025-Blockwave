import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthModal from '../components/auth/AuthModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../contexts/ThemeContext';

const MainLayout = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('signin');
  const location = useLocation();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateCursorPosition = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateCursorPosition);
    return () => window.removeEventListener('mousemove', updateCursorPosition);
  }, []);

  const openAuthModal = (type) => {
    setAuthType(type);
    setAuthModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Custom cursor effect
  const cursorVariants = {
    default: {
      x: cursorPosition.x - 16,
      y: cursorPosition.y - 16,
      scale: 1,
      opacity: 0.5,
      transition: {
        type: 'spring',
        mass: 0.1,
        damping: 15,
        stiffness: 300,
      },
    },
    hover: {
      scale: 2,
      opacity: 0.2,
      transition: {
        type: 'spring',
        mass: 0.1,
        damping: 15,
        stiffness: 300,
      },
    },
  };

  return (
    <ThemeProvider>
      <div 
        className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 text-gray-200 overflow-x-hidden relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black_90%)]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/10 via-transparent to-primary-900/10" />
          </div>
          
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-primary-500/20"
                style={{
                  width: Math.random() * 200 + 50,
                  height: Math.random() * 200 + 50,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  filter: 'blur(40px)',
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, (Math.random() - 0.5) * 100],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>

        {/* Custom cursor */}
        <motion.div
          className="fixed w-8 h-8 rounded-full bg-primary-500 pointer-events-none z-50 mix-blend-difference"
          variants={cursorVariants}
          animate={isHovering ? 'hover' : 'default'}
        />

        <Navbar openAuthModal={openAuthModal} />
        
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="flex-grow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <Outlet context={{ openAuthModal }} />
          </motion.main>
        </AnimatePresence>
        
        <Footer />
        
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={closeAuthModal}
          authType={authType}
          setAuthType={setAuthType}
        />

        {/* Toast Notifications */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'rgba(17, 24, 39, 0.95)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#111827',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#111827',
              },
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;
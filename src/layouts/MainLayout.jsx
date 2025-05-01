import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthModal from '../components/auth/AuthModal';
import { motion } from 'framer-motion';

const MainLayout = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState('signin'); // 'signin' or 'signup'

  const openAuthModal = (type) => {
    setAuthType(type);
    setAuthModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-space-black">
      <Navbar openAuthModal={openAuthModal} />
      
      <motion.main 
        className="flex-grow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet context={{ openAuthModal }} />
      </motion.main>
      
      <Footer />
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        authType={authType}
        setAuthType={setAuthType}
      />
    </div>
  );
};

export default MainLayout;
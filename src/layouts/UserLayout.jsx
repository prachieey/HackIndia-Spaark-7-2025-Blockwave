import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import UserSidebar from '../components/user/UserSidebar.jsx';
import UserHeader from '../components/user/UserHeader.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const UserLayout = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
    } else if (isAdmin) {
      // If admin is trying to access user routes, redirect to admin
      navigate('/admin');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated || isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-space-black">
      <UserSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <UserHeader />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-space-black">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-6 py-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
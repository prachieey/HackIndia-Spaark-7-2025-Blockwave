import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AdminSidebar from '../components/admin/AdminSidebar.jsx';
import AdminHeader from '../components/admin/AdminHeader.jsx';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, isAdmin, loading });
    
    if (loading) return;
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login', { 
        state: { from: window.location.pathname },
        replace: true 
      });
    } else if (!isAdmin) {
      console.log('Not an admin, redirecting to home');
      toast.error('You do not have permission to access the admin dashboard');
      navigate('/', { replace: true });
    } else {
      console.log('User is authenticated and is admin');
    }
    
    setIsCheckingAuth(false);
  }, [isAuthenticated, isAdmin, loading, navigate]);

  if (loading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-space-black">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        
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

export default AdminLayout;
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-9xl font-bold text-deep-purple mb-6">404</div>
          
          <h1 className="text-4xl font-bold text-holographic-white mb-4">Page Not Found</h1>
          
          <p className="text-holographic-white/70 text-lg mb-8">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/" className="btn btn-primary flex items-center justify-center">
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            <Link to="/explore" className="btn btn-secondary flex items-center justify-center">
              <Search className="h-5 w-5 mr-2" />
              Explore Events
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
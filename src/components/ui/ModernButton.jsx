import React from 'react';
import { motion } from 'framer-motion';

const ModernButton = ({ 
  children, 
  onClick, 
  className = '',
  variant = 'primary',
  size = 'md',
  ...props 
}) => {
  const baseStyles = 'relative font-medium rounded-lg overflow-hidden transition-all duration-300';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30',
    secondary: 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700',
    outline: 'bg-transparent text-indigo-400 border-2 border-indigo-600 hover:bg-indigo-600/10',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ 
        scale: 1.05,
        boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
      }}
      whileTap={{ 
        scale: 0.98 
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 17 
      }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
    </motion.button>
  );
};

export default ModernButton;

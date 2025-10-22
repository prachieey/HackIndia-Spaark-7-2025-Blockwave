import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '',
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          delay: delay * 0.1,
          duration: 0.6 
        } 
      }}
      viewport={{ once: true }}
      className={`backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;

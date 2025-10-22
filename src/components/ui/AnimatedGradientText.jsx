import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedGradientText = ({ children, className = '' }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={{
        background: hovered 
          ? 'linear-gradient(90deg, #4F46E5 0%, #8B5CF6 50%, #EC4899 100%)' 
          : 'linear-gradient(90deg, #4F46E5 0%, #8B5CF6 100%)',
        backgroundSize: hovered ? '200% auto' : '100% auto',
      }}
      transition={{ 
        duration: 0.5,
        ease: 'easeInOut'
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        display: 'inline-block',
      }}
    >
      {children}
    </motion.span>
  );
};

export default AnimatedGradientText;

import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          delay: delay * 0.15,
          duration: 0.6 
        } 
      }}
      viewport={{ once: true }}
      className="group relative p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
      
      <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-indigo-500/10 rounded-full filter blur-xl group-hover:blur-2xl transition-all duration-500"></div>
    </motion.div>
  );
};

export default FeatureCard;

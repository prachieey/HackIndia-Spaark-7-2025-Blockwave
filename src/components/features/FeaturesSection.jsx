import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, QrCode, Repeat, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  {
    id: 'secure',
    title: 'Secure & Verifiable Tickets',
    icon: <Shield className="w-8 h-8 text-tech-blue" />,
    description: 'Each ticket is secured with blockchain technology, ensuring authenticity and preventing counterfeiting.',
    details: [
      'Immutable ownership records on blockchain',
      'Real-time verification system',
      'Tamper-proof ticket history',
      'Secure transfer of ownership'
    ]
  },
  {
    id: 'dynamic-qr',
    title: 'Dynamic QR Technology',
    icon: <QrCode className="w-8 h-8 text-tech-blue" />,
    description: 'Our dynamic QR codes update periodically, preventing screenshot fraud and unauthorized transfers.',
    details: [
      'Auto-refreshing QR codes',
      'Single-use validation',
      'Time-based security',
      'Geolocation verification'
    ]
  },
  {
    id: 'how-it-works',
    title: 'How It Works',
    icon: <Repeat className="w-8 h-8 text-tech-blue" />,
    description: 'A simple three-step process to buy, sell, and transfer tickets with complete peace of mind.',
    steps: [
      '1. Purchase your ticket securely',
      '2. Receive a unique, verifiable NFT ticket',
      '3. Scan at the event for instant validation'
    ]
  }
];

const FeatureCard = ({ feature, isActive, onClick }) => (
  <motion.div
    className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
      isActive 
        ? 'bg-gradient-to-br from-space-black to-deep-purple/20 border-2 border-tech-blue/50 shadow-lg shadow-tech-blue/20' 
        : 'bg-space-black/50 border border-holographic-white/10 hover:border-tech-blue/30 hover:bg-space-black/70'
    }`}
    onClick={onClick}
    whileHover={{ y: -5 }}
    layout
  >
    <div className="flex items-start space-x-4">
      <div className="p-2 bg-deep-purple/20 rounded-lg">
        {feature.icon}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-holographic-white mb-2">{feature.title}</h3>
        <p className="text-holographic-white/80 text-sm">{feature.description}</p>
      </div>
      <motion.div
        animate={{ rotate: isActive ? 90 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ArrowRight className="w-5 h-5 text-holographic-white/50" />
      </motion.div>
    </div>
    
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 pt-4 border-t border-holographic-white/10 overflow-hidden"
        >
          <ul className="space-y-2">
            {(feature.details || feature.steps || []).map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-tech-blue flex-shrink-0" />
                <span className="text-sm text-holographic-white/80">{item}</span>
              </li>
            ))}
          </ul>
          
          {feature.id === 'how-it-works' && (
            <motion.div 
              className="mt-4 pt-4 border-t border-holographic-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button className="w-full bg-gradient-to-r from-tech-blue to-deep-purple text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity">
                Learn More About Our Process
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState('secure');

  return (
    <section className="py-16 bg-gradient-to-b from-space-black to-deep-purple/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-holographic-white mb-4">
            Next-Gen Ticketing <span className="text-tech-blue">Features</span>
          </h2>
          <p className="text-holographic-white/70 max-w-2xl mx-auto">
            Experience the future of event ticketing with our cutting-edge technology and security features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              isActive={activeFeature === feature.id}
              onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
            />
          ))}
        </div>

        {/* Visual indicator */}
        <motion.div 
          className="hidden md:flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-tech-blue/10 animate-ping"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-tech-blue to-deep-purple flex items-center justify-center">
              <QrCode className="w-10 h-10 text-white" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;

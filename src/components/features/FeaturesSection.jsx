import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Shield, 
  Repeat, 
  CreditCard,
  ArrowRight,
  Check,
  Lock,
  RefreshCw,
  TrendingUp,
  IndianRupee
} from 'lucide-react';

const features = [
  {
    id: 'dynamic-qr',
    title: 'Dynamic QR Codes',
    icon: <QrCode className="w-6 h-6" />,
    description: 'Unique, encrypted QR codes that change periodically to prevent screenshot sharing.',
    benefits: [
      'Auto-refreshing security codes',
      'Screenshot protection',
      'Real-time validation',
      'Enhanced fraud prevention'
    ]
  },
  {
    id: 'blockchain',
    title: 'Blockchain Security',
    icon: <Lock className="w-6 h-6" />,
    description: 'Immutable record of ticket ownership and transfers, eliminating counterfeits.',
    benefits: [
      'Tamper-proof records',
      'Transparent ownership history',
      'Secure transfers',
      'Fraud prevention'
    ]
  },
  {
    id: 'reselling',
    title: 'Secure Reselling',
    icon: <RefreshCw className="w-6 h-6" />,
    description: 'Safely resell tickets with price caps to prevent scalping and ensure fair access.',
    benefits: [
      'Price ceiling protection',
      'Secure peer-to-peer transfers',
      'Verified resale only',
      'No hidden fees'
    ]
  },
  {
    id: 'inr-payments',
    title: 'INR Payments',
    icon: <IndianRupee className="w-6 h-6" />,
    description: 'Seamless transactions in Indian Rupees with transparent pricing and no hidden fees.',
    benefits: [
      'Zero currency conversion',
      'Instant settlements',
      'Multiple payment options',
      'Transparent pricing'
    ]
  }
];

const FeatureCard = ({ feature, isActive, onClick }) => (
  <motion.div
    className={`relative p-8 rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer group ${
      isActive 
        ? 'bg-gradient-to-br from-space-black to-deep-purple/30 border-2 border-tech-blue/60 shadow-2xl shadow-tech-blue/30 scale-[1.02]' 
        : 'bg-gradient-to-br from-space-black/80 to-space-black/30 border border-holographic-white/5 hover:border-tech-blue/40 hover:bg-space-black/60 backdrop-blur-sm'
    }`}
    onClick={onClick}
    whileHover={{ 
      y: -8,
      boxShadow: '0 25px 50px -12px rgba(0, 170, 255, 0.15)'
    }}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, type: 'spring', stiffness: 100, damping: 12 }}
  >
    {isActive && (
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-tech-blue/10 to-transparent opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
    )}
    <div className="relative z-10 h-full flex flex-col">
      <div className="flex items-start space-x-4 mb-6">
        <motion.div 
          className={`p-3.5 rounded-xl shadow-lg ${
            isActive 
              ? 'bg-gradient-to-br from-tech-blue to-deep-purple text-white shadow-tech-blue/30' 
              : 'bg-gradient-to-br from-space-black/80 to-space-black/50 text-tech-blue group-hover:bg-tech-blue/10 group-hover:text-tech-blue transition-colors'
          }`}
          whileHover={{ 
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.5 }
          }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {React.cloneElement(feature.icon, { className: 'w-6 h-6' })}
        </motion.div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-holographic-white">{feature.title}</h3>
            <motion.div
              animate={{ rotate: isActive ? 90 : 0 }}
              className="text-holographic-white/50"
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </div>
          
          <p className={`text-base leading-relaxed ${
            isActive ? 'text-holographic-white/90' : 'text-holographic-white/70 group-hover:text-holographic-white/80'
          } transition-colors`}>
            {feature.description}
          </p>
          {isActive && (
            <motion.div 
              className="mt-6 pt-6 border-t border-holographic-white/5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-sm font-semibold text-tech-blue/90 mb-3 uppercase tracking-wider">Key Benefits</h4>
              <ul className="space-y-3">
                {feature.benefits.map((benefit, i) => (
                  <motion.li 
                    key={i} 
                    className="flex items-center text-base text-holographic-white/80 group-hover:text-holographic-white transition-colors"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 0.2 + (i * 0.07),
                      type: 'spring',
                      stiffness: 300
                    }}
                  >
                    <motion.span 
                      className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full bg-tech-blue/10 text-tech-blue"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </motion.span>
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState('dynamic-qr');
  const activeFeatureData = features.find(f => f.id === activeFeature);

  return (
    <section className="relative py-28 bg-gradient-to-b from-space-black to-deep-purple/10 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -right-40 -top-40 w-96 h-96 bg-tech-blue/5 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute -left-40 -bottom-40 w-[32rem] h-[32rem] bg-deep-purple/5 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-tech-blue/5 via-transparent to-transparent opacity-30" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-20 relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span 
            className="inline-block text-tech-blue text-sm font-medium mb-4 px-4 py-1.5 bg-tech-blue/10 rounded-full border border-tech-blue/20 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Why Choose Scantyx?
          </motion.span>
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-holographic-white mb-5 bg-clip-text text-transparent bg-gradient-to-r from-holographic-white via-holographic-white/90 to-tech-blue/90"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Secure & Convenient Ticketing
          </motion.h2>
          <motion.p 
            className="text-xl text-holographic-white/80 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Our platform offers unparalleled security and convenience for event organizers and attendees.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                delay: 0.1 * index,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <FeatureCard
                feature={feature}
                isActive={activeFeature === feature.id}
                onClick={() => setActiveFeature(feature.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div 
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {[
            { value: '100%', label: 'Secure Transactions' },
            { value: '0%', label: 'Fraud Cases' },
            { value: '1M+', label: 'Tickets Sold' },
            { value: '24/7', label: 'Support' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              className="text-center p-6 bg-gradient-to-br from-space-black/50 to-space-black/30 rounded-xl border border-holographic-white/5 hover:border-tech-blue/40 transition-all duration-300 hover:shadow-2xl hover:shadow-tech-blue/10 backdrop-blur-sm"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + (i * 0.1) }}
            >
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tech-blue to-holographic-white/90 mb-3">
                {stat.value}
              </div>
              <div className="text-holographic-white/80 text-sm font-medium tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;

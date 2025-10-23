import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { FaTicketAlt, FaShieldAlt, FaChartLine, FaUsers, FaHandshake, FaCogs, FaDiscord, FaTwitter, FaGithub, FaTimes } from 'react-icons/fa';
import { Shield, Ticket, Zap, Users, ArrowRight, Sparkles, Globe, Code, Lock, Gift, Award, Coins, Star, Calendar, Clock, User, Mail, Phone, MessageSquare, Building } from 'lucide-react';
import NFTTicket3D from '@/components/NFTTicket3D';
import { NFTTicketPreview } from '@/components/NFTTicket3D';
import { useInView } from 'react-intersection-observer';

// Floating Particles Background Component
const Particles = ({ count = 50 }) => {
  const particles = Array.from({ length: count });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => {
        const size = Math.random() * 6 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 3 + Math.random() * 5;
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${posX}%`,
              top: `${posY}%`,
              boxShadow: '0 0 10px 2px rgba(192, 132, 252, 0.5)'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: [0, 0.5, 0],
              y: [0, -100],
              x: [0, Math.random() * 100 - 50]
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'linear'
            }}
          />
        );
      })}
    </div>
  );
};

// Animated Feature Card
const FeatureCard = ({ icon, title, description, index }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      whileHover={{ y: -10, scale: 1.02 }}
      className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-lg border border-white/10 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
    >
      <div className="text-4xl mb-6 text-purple-400">{icon}</div>
      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  );
};

// Animated Section Title
const SectionTitle = ({ subtitle, title, description }) => (
  <div className="text-center mb-16">
    <motion.span 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="inline-block px-4 py-1 mb-3 text-sm font-medium text-purple-300 bg-purple-900/30 rounded-full"
    >
      {subtitle}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-300 bg-clip-text text-transparent"
    >
      {title}
    </motion.h2>
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="max-w-2xl mx-auto text-lg text-gray-400"
    >
      {description}
    </motion.p>
  </div>
);

// Full Futuristic Scantyx About Page
export default function About() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setIsSubmitting(true);
    
    try {
      console.log('Sending request to server...');
      const response = await fetch('/api/demo-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        console.log('Form submitted successfully');
        setIsSubmitted(true);
        // Reset form after 3 seconds
        setTimeout(() => {
          setShowDemoModal(false);
          setIsSubmitted(false);
          setFormData({
            name: '',
            email: '',
            company: '',
            message: ''
          });
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      alert(`Error: ${error.message || 'An unknown error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowDemoModal(false);
    setFormData({
      name: '',
      email: '',
      company: '',
      message: ''
    });
  };

  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        closeModal();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const { scrollY } = useScroll();
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = React.useState(0); // 0 for organizers, 1 for attendees
  
  // Parallax effects
  const glowY = useTransform(scrollY, [0, 800], [0, 200]);
  const y1 = useTransform(scrollY, [0, 1000], [0, -100]);
  const rotateX = useTransform(scrollY, [0, 1000], [0, 10]);
  
  // Features data
  const features = [
    {
      icon: <Ticket className="w-10 h-10" />,
      title: "NFT-Powered Tickets",
      description: "Secure, verifiable, and collectible tickets on the blockchain that can't be duplicated or faked."
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Anti-Scalping",
      description: "Smart contracts prevent ticket scalping and ensure fair pricing for all attendees."
    },
    {
      icon: <Zap className="w-10 h-10" />,
      title: "Instant Transfers",
      description: "Transfer tickets instantly to friends or resell them on our secure marketplace."
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Community First",
      description: "Join a community of event creators and attendees who value transparency and fairness."
    },
    {
      icon: <Gift className="w-10 h-10" />,
      title: "Exclusive Perks",
      description: "Unlock special rewards, backstage passes, and VIP experiences with your NFT tickets."
    },
    {
      icon: <Award className="w-10 h-10" />,
      title: "Proven Track Record",
      description: "Trusted by top artists, festivals, and event organizers worldwide."
    }
  ];
  
  // Team members
  const team = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      social: {
        twitter: "#",
        github: "#",
        discord: "#"
      }
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      social: {
        twitter: "#",
        github: "#",
        discord: "#"
      }
    },
    {
      name: "Marcus Lee",
      role: "Head of Design",
      image: "https://randomuser.me/api/portraits/men/75.jpg",
      social: {
        twitter: "#",
        github: "#",
        discord: "#"
      }
    },
    {
      name: "Elena Rodriguez",
      role: "Community Manager",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      social: {
        twitter: "#",
        github: "#",
        discord: "#"
      }
    }
  ];

  // Steps for Organizers
  const organizerSteps = [
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>,
      title: "1. Create Your Event",
      description: "Set up your event details, dates, and ticket types in minutes with our intuitive dashboard.",
      features: [
        "Custom event pages",
        "Multiple ticket tiers",
        "Early bird pricing",
        "RSVP management"
      ]
    },
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>,
      title: "2. Configure Payments",
      description: "Set your pricing, payment methods, and revenue distribution with transparent fee structures.",
      features: [
        "Multiple payment options",
        "Automatic payouts",
        "Revenue sharing",
        "Tax calculations"
      ]
    },
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>,
      title: "3. Manage Attendees",
      description: "Track ticket sales, manage guest lists, and communicate with your attendees all in one place.",
      features: [
        "Real-time analytics",
        "Email marketing",
        "Check-in tools",
        "Customer support"
      ]
    }
  ];

  // Steps for Attendees
  const attendeeSteps = [
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>,
      title: "1. Discover Events",
      description: "Browse through exciting events, filter by category, and find your perfect experience.",
      features: [
        "Personalized recommendations",
        "Save favorites",
        "Get event alerts",
        "See what friends are attending"
      ]
    },
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>,
      title: "2. Secure Your Ticket",
      description: "Purchase tickets with confidence using our secure checkout process.",
      features: [
        "Multiple payment methods",
        "Secure encryption",
        "Instant confirmation",
        "Mobile tickets"
      ]
    },
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>,
      title: "3. Enjoy the Event",
      description: "Access your tickets, get event updates, and enjoy a seamless experience.",
      features: [
        "Mobile check-in",
        "Event reminders",
        "Digital collectibles",
        "Exclusive content"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0518] via-[#0f0a24] to-[#1a1038] text-white font-sans overflow-x-hidden" ref={containerRef}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <Particles count={30} />
        
        {/* Animated gradient blobs */}
        <motion.div 
          className="absolute -left-40 -top-40 w-96 h-96 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
        <motion.div 
          className="absolute -right-40 -bottom-40 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-600/20 to-cyan-500/20 blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: 5
          }}
        />
      </div>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center max-w-4xl mx-auto"
          >
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-purple-300 bg-purple-900/30 rounded-full border border-purple-500/20"
            >
              The Future of Event Ticketing
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-300"
            >
              Experience Events <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Like Never Before</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10"
            >
              Scantyx revolutionizes event ticketing with blockchain technology, ensuring security, transparency, and unforgettable experiences for both organizers and attendees.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 group">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 hover:border-white/20 backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 group">
                <span>Watch Demo</span>
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 5L19 12L5 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
          
          {/* 3D Ticket Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 50, rotateX: 15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 max-w-4xl mx-auto relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-3xl blur-2xl -z-10"></div>
            <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-2xl p-1 border border-white/10 shadow-2xl">
              <NFTTicket3D className="w-full h-[500px]" />
            </div>
            
            {/* Floating elements */}
            <motion.div 
              className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-xl"
              animate={{
                y: [0, -15, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }}
            />
            <motion.div 
              className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 blur-xl"
              animate={{
                y: [0, 15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: 2
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* HERO */}
      <header className="relative z-10 py-24 px-6 md:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400"
            >
              Scantyx — The Future of Secure Event Ticketing
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mt-6 text-gray-300 max-w-2xl text-lg"
            >
              Protect events from scalpers and fraud with NFT-backed tickets that are verifiable, transferable (if you allow), and collectible — built for fans and creators.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <button 
  onClick={() => setShowDemoModal(true)}
  className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 font-semibold shadow-lg hover:from-pink-600 hover:to-indigo-600 transition-colors"
>
  Schedule a Demo
</button>
              <a href="#solutions" className="inline-flex items-center px-6 py-3 rounded-full border border-white/10 text-white/90">Explore Solutions</a>
            </motion.div>

            <motion.div className="mt-8 text-sm text-gray-400">
              <span className="inline-flex items-center mr-4">✅ Audited contracts</span>
              <span className="inline-flex items-center mr-4">✅ Enterprise integrations</span>
              <span className="inline-flex items-center">✅ 24/7 support</span>
            </motion.div>
          </div>

          <div className="w-full">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="bg-gradient-to-b from-white/3 to-transparent rounded-3xl p-6 shadow-2xl border border-white/6">
                {/* 3D Canvas area */}
                <NFTTicket3D className="w-full h-[420px] rounded-2xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* SOLUTIONS / PILLARS */}
      <section id="solutions" className="py-20 px-6 md:px-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-pink-900/5"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 mb-3 text-sm font-medium text-purple-300 bg-purple-900/30 rounded-full"
            >
              Our Solutions
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-300 bg-clip-text text-transparent"
            >
              Comprehensive Event Solutions
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-400 max-w-3xl mx-auto"
            >
              End-to-end platform for creating, managing, and scaling unforgettable events with blockchain technology
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <FaCogs className="w-6 h-6" />,
                title: "Event Creation",
                description: "Intuitive tools to design, customize, and launch your event in minutes.",
                gradient: "from-indigo-500 to-purple-600"
              },
              {
                icon: <FaTicketAlt className="w-6 h-6" />,
                title: "Smart Ticketing",
                description: "NFT-based tickets with dynamic pricing and resale controls.",
                gradient: "from-pink-500 to-rose-600"
              },
              {
                icon: <FaShieldAlt className="w-6 h-6" />,
                title: "Security First",
                description: "Blockchain-verified authenticity and fraud prevention.",
                gradient: "from-cyan-500 to-blue-600"
              },
              {
                icon: <FaChartLine className="w-6 h-6" />,
                title: "Real-time Analytics",
                description: "Powerful insights into ticket sales and attendee behavior.",
                gradient: "from-amber-500 to-orange-600"
              },
              {
                icon: <FaUsers className="w-6 h-6" />,
                title: "Engagement Tools",
                description: "Build lasting relationships with your audience.",
                gradient: "from-emerald-500 to-teal-600"
              },
              {
                icon: <FaHandshake className="w-6 h-6" />,
                title: "Seamless Integration",
                description: "Connect with your existing tools and workflows.",
                gradient: "from-violet-500 to-fuchsia-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 backdrop-blur-sm p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  '--tw-gradient-from': `rgb(99 102 241 / 0.1)`,  // indigo-500/10
                  '--tw-gradient-to': `rgb(168 85 247 / 0.1)`,    // purple-500/10
                  '--tw-gradient-stops': `var(--tw-gradient-from), var(--tw-gradient-to)`
                }}></div>
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${feature.gradient} text-white`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                  
                  <div className="mt-4 flex items-center text-sm font-medium text-purple-300 group-hover:text-white transition-colors">
                    Learn more
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <button 
              onClick={() => {
                document.getElementById('all-features').scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-full shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 flex items-center mx-auto group"
            >
              Explore All Features
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>
      </section>

{/* METRICS & CLIENTS */}
      <section className="py-20 px-6 md:px-20">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h3 className="text-3xl font-bold">Built for scale</h3>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">Trusted infrastructure and integrations for promoters, venues, and creators of all sizes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-2xl bg-white/4">
            <div className="text-4xl font-bold text-purple-400">10 min</div>
            <div className="text-gray-300 mt-2">Average event setup time</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/4">
            <div className="text-4xl font-bold text-pink-400">100M+</div>
            <div className="text-gray-300 mt-2">Potential fans reached via partners</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/4">
            <div className="text-4xl font-bold text-cyan-400">80%</div>
            <div className="text-gray-300 mt-2">Faster entry processing</div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-6 gap-6 items-center opacity-80">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 bg-white/3 rounded flex items-center justify-center">Partner {i + 1}</div>
          ))}
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="py-28 px-6 md:px-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-pink-900/5"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 mb-3 text-sm font-medium text-purple-300 bg-purple-900/30 rounded-full"
            >
              Testimonials
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-300 bg-clip-text text-transparent"
            >
              Success Stories
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-400 max-w-3xl mx-auto"
            >
              Hear from event organizers and venues who transformed their ticketing with Scantyx
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Using Scantyx saved us days of setup—and we finally eliminated unauthorized resales.",
                author: "Box Office Manager",
                role: "Major Music Arena",
                icon: <FaTicketAlt className="w-5 h-5" />
              },
              {
                quote: "Our fans loved owning their tickets as NFTs, and many came back for future events.",
                author: "Event Promoter",
                role: "International Festival",
                icon: <FaUsers className="w-5 h-5" />
              },
              {
                quote: "Scantyx helped us run a secure VIP launch with seamless entry and collectible ticket drops.",
                author: "Operations Lead",
                role: "Premier Venue",
                icon: <FaShieldAlt className="w-5 h-5" />
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 backdrop-blur-sm p-8 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl"></div>
                
                <div className="relative z-10">
                  <div className="text-4xl text-gray-500 mb-6">"</div>
                  <p className="text-gray-200 text-lg leading-relaxed mb-6">{testimonial.quote}</p>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white mr-4">
                      {testimonial.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{testimonial.author}</h4>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="flex justify-center space-x-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-gray-400">Rated 5/5 by event organizers worldwide</p>
          </motion.div>
        </div>
      </section>

      {/* Parallax Divider Line */}
      <div className="relative h-[2px] w-3/4 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent my-20"></div>

      {/* NFT Ticket Preview Section */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-4"
          >
            Your Ticket, Reimagined
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            Experience the next generation of event ticketing with our NFT-based solution that ensures authenticity and exclusive access.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <NFTTicketPreview 
            imageUrl="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            title="Scantyx VIP Pass"
            owner="scantyx.eth"
            price="0.1 ETH"
          />
        </motion.div>
      </section>

      {/* Divider */}
      <div className="relative h-[2px] w-3/4 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent my-20"></div>

      {/* Features Section */}
      <section id="features" className="py-28 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <SectionTitle 
            subtitle="Why Choose Scantyx"
            title="Powerful Features for Everyone"
            description="Experience the next generation of event ticketing with our innovative platform"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '500K+', label: 'Tickets Sold' },
              { number: '95%', label: 'Event Success Rate' },
              { number: '10K+', label: 'Happy Users' },
              { number: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section id="how-it-works" className="relative py-28 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <SectionTitle 
            subtitle="Simple & Secure"
            title="How It Works"
            description="Experience seamless event management with our blockchain-powered platform"
          />
          
          {/* Interactive Tabs */}
          <div className="mb-16">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {['For Event Organizers', 'For Attendees'].map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-3 rounded-full font-medium text-sm transition-all ${activeTab === index ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* Steps with 3D Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {(activeTab === 0 ? organizerSteps : attendeeSteps).map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full bg-gradient-to-br from-white/5 to-white/2 rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                        {step.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-300 mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.features.map((feature, i) => (
                          <li key={i} className="flex items-center text-sm text-gray-400">
                            <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Security & Compliance Section */}
          <div className="mt-24 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 md:p-12 border border-white/10 backdrop-blur-lg">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-6">
                Security & Compliance
              </h3>
              <p className="text-gray-300 text-lg mb-8">
                Scantyx integrates audited smart contracts, tiered KYC flows, and configurable royalties to keep your events compliant and low-risk.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                {[
                  { name: 'Audited Contracts', icon: '🔒' },
                  { name: 'Enterprise SLA', icon: '⚡' },
                  { name: 'Custom KYC', icon: '🛡️' },
                  { name: 'Data Portability', icon: '📊' }
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-sm font-medium">{item.name}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2">
                  Request Demo
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </button>
                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                  Developer Docs
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Meet the Team
          </h2>
          <p className="text-gray-400 mt-3">The innovators behind Scantyx</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            { name: "Nikhil Sehgal", role: "Full Stack Developer", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nikhil" },
            { name: "Prachi", role: "Frontend Designer", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prachi" },
            { name: "Pranav", role: "Blockchain Developer", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pranav" },
          ].map((person, i) => (
            <motion.div
              key={i}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 25px rgba(255,255,255,0.15)",
              }}
              className="flex flex-col items-center bg-white/10 border border-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-lg"
            >
              <img
                src={person.img}
                alt={person.name}
                className="w-24 h-24 rounded-full border-2 border-pink-400 mb-4 hover:scale-110 transition"
              />
              <h3 className="text-lg font-semibold">{person.name}</h3>
              <p className="text-gray-400 text-sm">{person.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative text-center py-28 px-6">
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent"
        >
          Join the Future of Ticketing 🚀
        </motion.h3>
        <p className="text-gray-400 max-w-lg mx-auto mb-8">
          Transparent, secure, and powered by blockchain — redefine how you attend events.
        </p>
        <motion.a
          whileHover={{ scale: 1.1 }}
          href="/contact"
          className="inline-block px-10 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full text-white font-semibold shadow-lg hover:shadow-pink-500/30 transition"
        >
          Get Started
        </motion.a>

        {/* Bottom Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-pink-500/10 via-indigo-500/10 to-transparent rounded-full blur-[150px]" />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Scantyx. All rights reserved.
      </footer>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl"
          >
            <button 
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                Schedule a Demo
              </h3>
              <p className="text-gray-400 text-sm">Let's show you how Scantyx can transform your events</p>
            </div>

            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Request Received!</h3>
                <p className="text-gray-400 mb-6">We've received your demo request. Our team will contact you within 24 hours.</p>
                <button
                  type="button"
                  onClick={() => setShowDemoModal(false)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your email"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Company name"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute top-3 left-3 text-gray-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tell us about your event needs"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                  isSubmitting 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 opacity-75 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                } text-white`}
              >
                {isSubmitting ? 'Sending...' : 'Request Demo'}
              </button>
            </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}


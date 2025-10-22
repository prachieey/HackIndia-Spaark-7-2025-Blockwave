import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { QrCode, Shield, Repeat, CreditCard, ChevronRight, Star, Send, Lock, Calendar, MapPin, Instagram } from 'lucide-react';
import { useEvents } from '../contexts/EventsContext';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import EventCard from '../components/events/EventCard';
import QRTicket from '../components/tickets/QRTicket';
import SocialMediaSection from '../components/social/SocialMediaSection';
import TestimonialsSection from '../components/testimonials/TestimonialsSection';
import FeaturesSection from '../components/features/FeaturesSection';
import NewsletterSignup from '../components/engagement/NewsletterSignup';

const HomePage = () => {
  const { openAuthModal } = useAuthModal();
  const { events } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const [showResellModal, setShowResellModal] = useState(false);
  const navigate = useNavigate();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [resalePrice, setResalePrice] = useState('');
  const [resaleMessage, setResaleMessage] = useState({ type: '', text: '' });
  
  // Debug: Log auth state changes
  useEffect(() => {
    console.log('HomePage - Auth state changed:', { 
      isAuthenticated, 
      user: user ? { id: user.id, email: user.email } : null,
      timestamp: new Date().toISOString()
    });
    
    // Check localStorage for debugging
    const storedUser = localStorage.getItem('scantyx_user');
    console.log('Stored user in localStorage:', storedUser ? JSON.parse(storedUser) : null);
  }, [isAuthenticated, user]);

  // Mock events data in case the API doesn't return any events
  const mockEvents = [
    {
      id: 'mock-1',
      name: 'Blockchain Hackathon 2025',
      description: 'Join us for a 48-hour hackathon focused on blockchain innovation and decentralized applications.',
      date: '2025-11-15T10:00:00',
      location: 'Virtual',
      category: 'Blockchain',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'mock-2',
      name: 'Web3 Conference',
      description: 'Learn about the latest trends in Web3, DeFi, and the future of the decentralized web.',
      date: '2025-12-05T09:30:00',
      location: 'Bangalore, India',
      category: 'Web3',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'mock-3',
      name: 'NFT Art Exhibition',
      description: 'Experience the intersection of art and blockchain with our exclusive NFT art exhibition.',
      date: '2025-11-22T18:00:00',
      location: 'Mumbai, India',
      category: 'NFT',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    }
  ];

  // Get 3 featured events or use mock data if none available
  const featuredEvents = events?.length > 0 ? events.slice(0, 3) : mockEvents;
  
  // Initialize userTickets state
  const [userTickets, setUserTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState(null);

  // Fetch user tickets when authenticated
  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!isAuthenticated) {
        setUserTickets([]);
        return;
      }

      setTicketsLoading(true);
      setTicketsError(null);
      
      try {
        // Replace this with your actual API call to fetch user tickets
        // const response = await fetch('/api/tickets/my-tickets');
        // const data = await response.json();
        // setUserTickets(data);
        
        // For now, using mock data
        setUserTickets([]);
      } catch (error) {
        console.error('Error fetching user tickets:', error);
        setTicketsError('Failed to load your tickets');
      } finally {
        setTicketsLoading(false);
      }
    };

    fetchUserTickets();
  }, [isAuthenticated]);

  // Get resellable tickets (not used, not already for sale)
  const resellableTickets = userTickets?.filter(ticket => !ticket.isUsed && !ticket.isForSale) || [];

  const handleExploreEvents = (e) => {
    e.preventDefault();
    navigate('/explore');
  };

  const handleResellClick = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowResellModal(true);
    setResaleMessage({ type: '', text: '' });
  };

  const handleResellSubmit = (e) => {
    e.preventDefault();
    
    const price = parseInt(resalePrice, 10);
    if (isNaN(price) || price <= 0) {
      setResaleMessage({ type: 'error', text: 'Please enter a valid price' });
      return;
    }
    
    const ticket = userTickets.find(t => t.id === selectedTicketId);
    if (price > ticket.price * 1.5) {
      setResaleMessage({ 
        type: 'error', 
        text: `Price cannot exceed 150% of original price (${ticket.price * 1.5})` 
      });
      return;
    }
    
    const result = listTicketForResale(selectedTicketId, price);
    if (result.success) {
      setResaleMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        setShowResellModal(false);
        setSelectedTicketId(null);
        setResalePrice('');
      }, 2000);
    } else {
      setResaleMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <>
      {/* Hero Section */}
<section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
  {/* Background Video */}
  <div className="absolute inset-0 overflow-hidden">
    <video 
      className="absolute inset-0 w-full h-full object-cover z-0" 
      autoPlay 
      loop 
      muted 
      playsInline
      preload="auto"
    >
      <source 
        src="/videos/hero-video.mp4" 
        type="video/mp4" 
      />
      {/* Fallback content */}
      <div className="absolute inset-0 bg-gradient-to-br from-deep-purple-900 to-space-black"></div>
    </video>
    <div className="absolute inset-0 bg-black/60 z-0"></div>
  </div>

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/60 z-0"></div>

  <div className="container mx-auto px-4 z-10 py-20">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Content */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-holographic-white leading-tight">
          Secure Event Ticketing with <span className="text-tech-blue">Dynamic QR</span> Technology
        </h1>
        
        <p className="tagline text-2xl">No Scams, Just Scans</p>
        
        <p className="text-holographic-white/80 text-lg">
          Scantyx uses blockchain technology to create tamper-proof tickets with dynamic QR codes, 
          eliminating fraud and making event attendance seamless.
        </p>
        
        <div className="flex flex-wrap gap-4">
          {isAuthenticated ? (
            <Link 
              to="/user/create-event" 
              className="btn btn-primary"
              onClick={handleCreateEvent}
            >
              Host an Event
            </Link>
          ) : (
            <button 
              onClick={(e) => {
                e.preventDefault();
                console.log('Get Started clicked');
                openAuthModal('signup');
              }} 
              className="btn btn-primary"
            >
              Get Started
            </button>
          )}
          <Link 
            to="/explore"
            className="btn btn-outline"
          >
            Explore Events
          </Link>
        </div>
      </motion.div>
      
      {/* Right Ticket Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-0.5 bg-deep-purple rounded-2xl blur-lg opacity-75 animate-pulse-slow"></div>
          <div className="relative bg-space-black/80 border-2 border-deep-purple rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-holographic-white">TechFest 2025</h3>
                <p className="text-tech-blue">Bangalore, India</p>
              </div>
              <div className="bg-deep-purple text-holographic-white px-3 py-1 rounded-lg">
                ₹1,499
              </div>
            </div>
            
            <div className="flex justify-center mb-6">
              <QrCode className="h-48 w-48 text-deep-purple" />
            </div>
            
            <div className="mt-12 space-y-4">
              <div className="flex items-center space-x-4 group cursor-pointer hover:bg-gray-800/50 p-3 rounded-lg transition-colors">
                <div className="p-3 rounded-full bg-deep-purple/10 text-deep-purple group-hover:bg-deep-purple/20 transition-colors">
                  <Shield className="w-6 h-6" />
                </div>
                <p className="text-holographic-white/80 group-hover:text-white transition-colors">
                  Secure & Verifiable Tickets
                </p>
              </div>
              <div className="flex items-center space-x-4 group cursor-pointer hover:bg-gray-800/50 p-3 rounded-lg transition-colors">
                <div className="p-3 rounded-full bg-tech-blue/10 text-tech-blue group-hover:bg-tech-blue/20 transition-colors">
                  <QrCode className="w-6 h-6" />
                </div>
                <p className="text-holographic-white/80 group-hover:text-white transition-colors">
                  Dynamic QR Technology
                </p>
              </div>
              <div className="flex items-center space-x-4 group cursor-pointer hover:bg-gray-800/50 p-3 rounded-lg transition-colors"
                   onClick={() => window.scrollTo({ top: document.getElementById('how-it-works').offsetTop - 100, behavior: 'smooth' })}>
                <div className="p-3 rounded-full bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <p className="text-holographic-white/80 group-hover:text-white transition-colors">
                  How It Works
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-holographic-white/70">Date:</span>
                <span className="text-holographic-white">March 15, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-holographic-white/70">Ticket ID:</span>
                <span className="text-holographic-white">#SCX25789</span>
              </div>
              <div className="flex justify-between">
                <span className="text-holographic-white/70">Status:</span>
                <span className="text-validation-green">Valid</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
</section>

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-space-black to-deep-purple-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-holographic-white mb-4">Featured Events</h2>
              <p className="text-holographic-white/70 max-w-2xl mx-auto">Discover our handpicked selection of upcoming events</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-deep-purple-900/50 to-space-black/50 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm hover:shadow-2xl hover:shadow-tech-blue/20 transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.image || '/images/event-placeholder.jpg'} 
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4 w-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block px-3 py-1 text-xs font-semibold bg-tech-blue text-white rounded-full mb-2">
                            {event.category || 'Blockchain'}
                          </span>
                          <h3 className="text-xl font-bold text-holographic-white">{event.name}</h3>
                        </div>
                        <a 
                          href="https://www.instagram.com/scantyx" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-white hover:text-tech-blue transition-colors bg-black/50 rounded-full p-2 backdrop-blur-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Instagram size={20} className="mr-1" />
                          <span className="text-sm font-medium">@ScantyX</span>
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-sm text-holographic-white/70">
                        <Calendar size={16} />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-holographic-white/70">
                        <MapPin size={16} />
                        <span>{event.location || 'Online'}</span>
                      </div>
                    </div>
                    
                    <p className="text-holographic-white/80 text-sm mb-6 line-clamp-2">
                      {event.description || 'Join us for an exciting event with industry leaders and networking opportunities.'}
                    </p>
                    
                    <Link 
                      to={`/events/${event.id}`}
                      className="inline-flex items-center text-tech-blue hover:text-tech-blue/80 font-medium text-sm group"
                    >
                      View Details
                      <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link 
                to="/explore"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-tech-blue to-indigo-600 text-white font-medium rounded-full hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-tech-blue/30"
              >
                View All Events
                <ChevronRight size={18} className="ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <FeaturesSection />
      
      {/* Featured Events Section */}
      <section className="py-20 bg-space-black">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="section-title mb-0">Featured Events</h2>
            <Link to="/explore" className="flex items-center text-tech-blue hover:text-deep-purple transition-colors">
              View All <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event, index) => {
              // Ensure we have a unique key - use event.id if available, otherwise fall back to index
              const uniqueKey = event?.id ? `event-${event.id}` : `event-${index}`;
              return (
                <EventCard 
                  key={uniqueKey} 
                  event={event} 
                />
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Social Media Reels Section */}
      {/* Animated Divider */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-b from-deep-purple-900 to-black">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-tech-blue/30 to-transparent h-px w-full -top-1/2"></div>
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-3 h-3 mx-auto rounded-full bg-tech-blue"
            />
          </div>
        </motion.div>
      </div>
      
      {/* Reels Section with Scroll Animation */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.8, 
            ease: "easeOut",
            delay: 0.2
          } 
        }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <SocialMediaSection />
      </motion.div>
      
      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Resell Tickets Section (only show if user has tickets) */}
      {resellableTickets.length > 0 && (
        <section className="py-20 bg-space-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="section-title">Your Tickets</h2>
              <p className="tagline">Resell tickets you can't use</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {resellableTickets.slice(0, 2).map(ticket => (
                <QRTicket 
                  key={ticket.id} 
                  ticket={ticket} 
                  onResell={handleResellClick}
                  showResellOption={true}
                />
              ))}
            </div>
            
            {resellableTickets.length > 2 && (
              <div className="text-center mt-8">
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-deep-purple bg-opacity-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title">Ready to Experience Secure Ticketing?</h2>
          <p className="tagline mb-8">No Scams, Just Scans</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/explore" className="btn btn-secondary">
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <NewsletterSignup />

      {/* Resell Modal */}
      {showResellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-black bg-opacity-80">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-space-black border border-deep-purple rounded-xl p-6 shadow-2xl"
          >
            <button
              onClick={() => setShowResellModal(false)}
              className="absolute top-4 right-4 text-holographic-white hover:text-tech-blue transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-holographic-white">
                Resell Your Ticket
              </h2>
              <p className="text-holographic-white/70 mt-2">
                Set a fair price (max 150% of original price)
              </p>
            </div>

            {resaleMessage.text && (
              <div className={`mb-4 p-3 rounded-lg ${
                resaleMessage.type === 'error' 
                  ? 'bg-flame-red bg-opacity-20 border border-flame-red' 
                  : 'bg-validation-green bg-opacity-20 border border-validation-green'
              }`}>
                <p className="text-holographic-white">{resaleMessage.text}</p>
              </div>
            )}

            <form onSubmit={handleResellSubmit} className="space-y-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-holographic-white mb-1">
                  Resale Price (₹)
                </label>
                <input
                  type="number"
                  id="price"
                  value={resalePrice}
                  onChange={(e) => setResalePrice(e.target.value)}
                  required
                  min="1"
                  className="input w-full"
                  placeholder="Enter price in INR"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                List Ticket for Resale
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default HomePage;
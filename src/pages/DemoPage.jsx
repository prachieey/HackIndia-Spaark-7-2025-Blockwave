import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Check, 
  X, 
  AlertCircle, 
  Ticket, 
  ScanLine, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Clock,
  MapPin,
  User,
  CreditCard,
  ArrowUpRight,
  Copy,
  Share2,
  Download,
  BarChart2,
  TrendingUp,
  Zap,
  Star
} from 'lucide-react';
import { useEvents } from '../contexts/EventsContext';
import { useAuth } from '../contexts/AuthContext';
import QRTicket from '../components/tickets/QRTicket';
import { format, parseISO } from 'date-fns';

// Helper function to get fallback image based on category
const getEventImageFallback = (category) => {
  const baseUrl = 'https://source.unsplash.com/random/800x450/?';
  const categories = {
    music: 'concert,music,performance',
    conference: 'conference,meeting,speaker',
    workshop: 'workshop,learning,education',
    hackathon: 'hackathon,coding,programming',
    startup: 'startup,business,entrepreneur',
    default: 'event,celebration,party'
  };
  
  const searchTerm = categories[category?.toLowerCase()] || categories.default;
  return `${baseUrl}${searchTerm}&${Math.floor(Math.random() * 1000)}`;
};

// Event Details Component with null checks and default values
const EventDetails = ({ event, onClose }) => {
  if (!event) return null;
  
  // Safely get event properties with defaults
  const {
    title = 'Event Title',
    organizer = 'Event Organizer',
    image,
    date = new Date().toISOString(),
    startTime = '12:00:00',
    endTime = '14:00:00',
    location = 'Location not specified',
    description = 'No description available for this event.'
  } = event;

  // Format date safely
  const formatDate = (dateString, formatStr = 'EEEE, MMMM d, yyyy') => {
    try {
      return format(parseISO(dateString), formatStr);
    } catch (e) {
      return 'Date not available';
    }
  };

  // Format time safely
  const formatTime = (timeString, formatStr = 'h:mm a') => {
    try {
      if (!timeString) return 'Time not specified';
      // If time is just HH:MM:SS, combine with date
      if (timeString.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
        return format(date, formatStr);
      }
      return format(parseISO(timeString), formatStr);
    } catch (e) {
      return 'Time not available';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-neutral-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-holographic-white">{title}</h2>
              <p className="text-neutral-400 mt-1">{organizer}</p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 -mr-2"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Image */}
            <div className="aspect-video bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl overflow-hidden flex items-center justify-center">
              {image ? (
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getEventImageFallback(event.category || 'default');
                  }}
                />
              ) : (
                <div className="text-center p-6">
                  <Ticket className="w-16 h-16 mx-auto text-neutral-600 mb-4" />
                  <p className="text-neutral-400">No image available</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>

            {/* Right Column - Details */}
            <div>
              <div className="space-y-6">
                {/* Date & Time */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-neutral-800 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Date & Time</p>
                    <p className="font-medium">
                      {formatDate(date)}
                    </p>
                    <p className="text-neutral-400">
                      {formatTime(startTime)} - {formatTime(endTime)}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-neutral-800 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Location</p>
                    <p className="font-medium">{location}</p>
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(location)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:underline inline-flex items-center text-sm"
                    >
                      View on map <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-4 border-t border-neutral-800">
                  <h3 className="font-semibold mb-2">About this event</h3>
                  <p className="text-neutral-300">
                    {description}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 bg-gradient-to-r from-primary-500 to-tech-blue text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
                    Get Tickets
                  </button>
                  <button className="flex-1 bg-neutral-800 text-white font-medium py-3 px-6 rounded-lg hover:bg-neutral-700 transition-colors">
                    Share Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DemoPage = () => {
  const { userTickets = [], validateTicket, purchaseResaleTicket, formatPrice } = useEvents();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('myTickets');
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-asc');
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Only render heavy components when mounted
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Memoize the modal component to prevent unnecessary re-renders
  const ScanModal = React.memo(({ show, onClose, onScan, scanning, scanInput, onInputChange, onManualSubmit }) => {
    if (!show) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-holographic-white">Scan Ticket QR Code</h3>
            <button 
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-black rounded-lg p-4 mb-6 relative overflow-hidden">
            {scanning ? (
              <div className="aspect-square w-full flex items-center justify-center">
                <div className="relative w-64 h-64 border-2 border-dashed border-primary-500/50 rounded-lg flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 animate-spin rounded-full" />
                  <QrCode className="w-16 h-16 text-primary-500/30" />
                </div>
              </div>
            ) : (
              <div className="aspect-square w-full bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-lg flex flex-col items-center justify-center p-6 text-center">
                <QrCode className="w-16 h-16 text-primary-500 mb-4" />
                <p className="text-neutral-400 mb-6">Position the QR code within the frame to scan</p>
                <button 
                  onClick={onScan}
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-tech-blue text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center mx-auto"
                >
                  Start Scanning
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <QrCode className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Or enter ticket code manually"
                className="pl-10 pr-4 py-2 w-full bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                value={scanInput}
                onChange={onInputChange}
              />
            </div>
            <button 
              className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-tech-blue text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!scanInput.trim()}
              onClick={onManualSubmit}
            >
              Validate Ticket
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  });
  
  ScanModal.displayName = 'ScanModal';
  
  const handleManualTicketEntry = async () => {
    if (!scanInput.trim()) return;
    
    setIsLoading(true);
    try {
      // Simulate API call to validate ticket
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would call your validation API here
      // const result = await validateTicket(scanInput);
      
      // For demo purposes, we'll simulate a successful validation
      setScanResult({
        valid: true,
        ticket: {
          id: scanInput,
          eventName: 'Tech Summit 2025',
          attendee: 'Demo User',
          type: 'VIP',
          price: 2999.99,
          date: '2025-11-15T19:00:00.000Z',
          location: 'Bangalore Convention Center',
          qrCode: `data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <rect width="100%" height="100%" fill="#1e1e2d"/>
              <text x="50%" y="50%" font-family="monospace" font-size="8" text-anchor="middle" fill="#ffffff" dy=".3em">${scanInput}</text>
            </svg>`
          )}`
        }
      });
      
      setShowScanModal(false);
      setShowTicketModal(true);
    } catch (error) {
      console.error('Error validating ticket:', error);
      setScanResult({
        valid: false,
        message: 'Failed to validate ticket. Please try again.'
      });
    } finally {
      setIsLoading(false);
      setScanning(false);
    }
  };

  // Sample events data
  const [events, setEvents] = useState([
    {
      id: 'event-1',
      name: 'Tech Summit 2025',
      date: '2025-11-15T19:00:00.000Z',
      location: 'Bangalore Convention Center',
      category: 'conference',
      image: 'https://source.unsplash.com/random/800x400/?conference',
      price: 299.99,
      availableTickets: 42,
      organizer: 'Tech Events Inc.'
    },
    {
      id: 'event-2',
      name: 'Jazz & Blues Night',
      date: '2025-12-05T20:30:00.000Z',
      location: 'Blue Note Club, Mumbai',
      category: 'music',
      image: 'https://source.unsplash.com/random/800x400/?jazz',
      price: 1999.99,
      availableTickets: 15,
      organizer: 'Music Masters'
    },
    {
      id: 'event-3',
      name: 'Blockchain Workshop',
      date: '2025-10-22T10:00:00.000Z',
      location: 'Tech Hub, Delhi',
      category: 'workshop',
      image: 'https://source.unsplash.com/random/800x400/?blockchain',
      price: 2499.99,
      availableTickets: 25,
      organizer: 'Blockchain Enthusiasts'
    },
    {
      id: 'event-4',
      name: 'Startup Pitch Night',
      date: '2025-11-30T18:00:00.000Z',
      location: 'Innovation Center, Bangalore',
      category: 'startup',
      image: 'https://source.unsplash.com/random/800x400/?startup',
      price: 1499.99,
      availableTickets: 50,
      organizer: 'Startup India'
    },
    {
      id: 'event-5',
      name: 'AI & ML Conference',
      date: '2025-12-15T09:00:00.000Z',
      location: 'Tech Park, Hyderabad',
      category: 'conference',
      image: 'https://source.unsplash.com/random/800x400/?ai',
      price: 3499.99,
      availableTickets: 30,
      organizer: 'AI Foundation'
    },
    {
      id: 'event-6',
      name: 'Hackathon 2025',
      date: '2025-11-20T10:00:00.000Z',
      location: 'Engineering College, Pune',
      category: 'hackathon',
      image: 'https://source.unsplash.com/random/800x400/?hackathon',
      price: 0,
      availableTickets: 100,
      organizer: 'Developer Community'
    }
  ]);

  // Sample resale tickets data
  const [resaleTickets, setResaleTickets] = useState([
    {
      id: 'resale-1',
      eventId: 'event-1',
      eventName: 'Tech Summit 2025',
      price: 2499.99,
      originalPrice: 2999.99,
      section: 'VIP',
      row: 'A',
      seat: '42',
      seller: '0x7f...1a3b',
      eventDate: '2025-11-15T19:00:00.000Z',
      listedAt: '2025-10-01T14:30:00.000Z',
      sellerRating: 4.8
    },
    {
      id: 'resale-2',
      eventId: 'event-2',
      eventName: 'Jazz & Blues Night',
      price: 1599.99,
      originalPrice: 1999.99,
      section: 'General',
      row: 'B',
      seat: '15',
      seller: '0x5d...9c2e',
      eventDate: '2025-12-05T20:30:00.000Z',
      listedAt: '2025-10-05T09:15:00.000Z',
      sellerRating: 4.5
    }
  ]);
  
  const handleScan = async () => {
    if (!scanInput.trim()) {
      setScanResult({
        success: false,
        message: 'Please enter a QR code',
        icon: <AlertCircle className="w-6 h-6 text-yellow-500" />
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if it's a valid QR format
      if (!scanInput.startsWith('SCANTYX-')) {
        setScanResult({
          success: false,
          message: 'Invalid QR code format',
          icon: <XCircle className="w-6 h-6 text-red-500" />
        });
        return;
      }
      
      // Try to validate from user tickets
      const result = validateTicket(scanInput);
      setScanResult({
        ...result,
        icon: result.success 
          ? <CheckCircle2 className="w-6 h-6 text-green-500" />
          : <XCircle className="w-6 h-6 text-red-500" />
      });
    } catch (error) {
      console.error('Error validating ticket:', error);
      setScanResult({
        success: false,
        message: 'Error validating ticket. Please try again.',
        icon: <XCircle className="w-6 h-6 text-red-500" />
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePurchaseResale = async (ticketId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to purchase tickets');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For user tickets, use the context function
      const result = purchaseResaleTicket(ticketId);
      
      if (result.success) {
        toast.success('Ticket purchased successfully!');
        // Remove the purchased ticket from resale list
        setResaleTickets(prev => prev.filter(t => t.id !== ticketId));
      } else {
        toast.error(result.message || 'Failed to purchase ticket');
      }
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      toast.error('An error occurred while processing your purchase');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString, formatStr = 'MMM d, yyyy h:mm a') => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, formatStr);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };

  // Handle view ticket details
  const handleViewTicket = (ticket) => {
    setActiveTicket(ticket);
    setShowTicketModal(true);
  };

  // Get user's first name for greeting
  const getUserGreeting = () => {
    if (!isAuthenticated) return 'Welcome to Scantyx';
    if (!user || !user.name) return 'Welcome back';
    const firstName = typeof user.name === 'string' ? user.name.split(' ')[0] : 'User';
    return `Welcome back, ${firstName}`;
  };

  // Filter events based on search query and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      default:
        return new Date(a.date) - new Date(b.date);
    }
  });

  // Get upcoming events (next 30 days)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    return eventDate >= today && eventDate <= nextMonth;
  }).slice(0, 3);

  // Get categories for filter
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'conference', name: 'Conferences' },
    { id: 'music', name: 'Music' },
    { id: 'workshop', name: 'Workshops' },
    { id: 'hackathon', name: 'Hackathons' },
    { id: 'startup', name: 'Startup Events' }
  ];

  // Handle event selection
  const handleEventSelect = (event) => {
    // Close any open modals first
    setShowScanModal(false);
    setShowTicketModal(false);
    
    // Then open the event details
    setSelectedEvent(event);
    document.body.style.overflow = 'hidden';
  };

  // Handle closing the event details
  const handleCloseEvent = () => {
    setSelectedEvent(null);
    document.body.style.overflow = 'auto';
  };

  // Handle click outside modals
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (selectedEvent) handleCloseEvent();
      if (showScanModal) setShowScanModal(false);
      if (showTicketModal) setShowTicketModal(false);
    }
  };
  
  const navigate = useNavigate();

  // Handle explore button click
  const handleExploreClick = () => {
    navigate('/explore');
  };

  // Handle scan button click
  const handleScanClick = () => {
    // Close any open modals first
    setSelectedEvent(null);
    setShowTicketModal(false);
    
    // Then open scan modal
    setShowScanModal(true);
    document.body.style.overflow = 'hidden';
  };
  
  // Handle close for all modals
  const closeAllModals = () => {
    setSelectedEvent(null);
    setShowScanModal(false);
    setShowTicketModal(false);
    document.body.style.overflow = 'auto';
  };

  // Effect to handle escape key for all modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="min-h-screen bg-space-black text-holographic-white relative">
      {/* Global overlay for all modals */}
      <AnimatePresence>
        {(selectedEvent || showScanModal || showTicketModal) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={handleBackdropClick}
          />
        )}
      </AnimatePresence>

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${
        (selectedEvent || showScanModal || showTicketModal) ? 'opacity-20 pointer-events-none' : 'opacity-100'
      }`}>
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative rounded-2xl p-8 md:p-12 mb-12 overflow-hidden isolate"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-space-black via-neutral-900 to-space-black" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-tech-blue/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-tech-blue/10 via-transparent to-primary-500/10" />
            
            {/* Animated grid pattern */}
            <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black_90%)]" />
            
            {/* Animated gradient orbs */}
            <motion.div 
              className="absolute -right-20 -top-20 w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-primary-500/20 to-tech-blue/20 blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
            <motion.div 
              className="absolute -left-20 -bottom-20 w-80 h-80 md:w-[32rem] md:h-[32rem] rounded-full bg-gradient-to-br from-tech-blue/10 to-primary-500/10 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: 2
              }}
            />
          </div>
          
          <div className="relative z-10 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 bg-gradient-to-r from-holographic-white via-holographic-white/90 to-holographic-white/80 bg-clip-text text-transparent">
                {getUserGreeting()}
              </h2>
              <p className="text-lg md:text-xl text-holographic-white/80 mb-8 max-w-2xl">
                Discover, buy, and manage event tickets with blockchain-powered security and zero scams.
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button 
                onClick={handleExploreClick}
                className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-primary-500 to-tech-blue text-white font-medium rounded-lg hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20 flex items-center justify-center"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary-600 to-tech-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center">
                  <Ticket className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  Explore Events
                </span>
              </button>
              <button 
                onClick={handleScanClick}
                className="group relative overflow-hidden px-6 py-3 bg-transparent border-2 border-neutral-700 text-holographic-white font-medium rounded-lg hover:bg-neutral-800/50 transition-all duration-300 flex items-center justify-center hover:border-primary-400/50 active:scale-95"
                aria-label="Scan Ticket"
                disabled={showScanModal}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent group-hover:from-white/5 group-hover:to-white/5 transition-all duration-300" />
                <span className="relative z-10 flex items-center">
                  <QrCode className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  Scan Ticket
                </span>
              </button>
              
              {/* Scan Ticket button - modal is now rendered at the root level */}
            </motion.div>
          </div>
        </motion.section>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Events Section */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="appearance-none bg-neutral-800 border border-neutral-700 text-holographic-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 pr-8 py-2"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-neutral-800 border border-neutral-700 text-holographic-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 pr-8 py-2"
                    >
                      <option value="date-asc">Date: Soonest</option>
                      <option value="date-desc">Date: Latest</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEvents.length > 0 ? (
                sortedEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-neutral-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-neutral-700 hover:border-primary-500/50 transition-colors duration-300"
                  >
                    <div className="relative h-48 bg-neutral-700 overflow-hidden">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.name || 'Event'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getEventImageFallback(event.category);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                          <Ticket className="w-16 h-16 text-neutral-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-primary-500/90 text-white text-xs font-medium rounded-full">
                          {event.category ? (event.category.charAt(0).toUpperCase() + event.category.slice(1)) : 'Event'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-holographic-white mb-2 line-clamp-2">
                            {event.name}
                          </h3>
                          <div className="flex items-center text-sm text-holographic-white/60 mb-3">
                            <MapPin className="w-4 h-4 mr-1.5" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-400">
                            {event.price > 0 ? `₹${event.price.toFixed(2)}` : 'FREE'}
                          </div>
                          <div className="text-xs text-holographic-white/60">
                            {event.availableTickets} tickets left
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-700">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-holographic-white/60 mr-2" />
                          <span className="text-sm text-holographic-white/80">
                            {formatDate(event.date, 'MMM d, yyyy')}
                          </span>
                        </div>
                        <button
                          onClick={() => handleEventSelect(event)}
                          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-tech-blue text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Ticket className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-holographic-white">No events found</h3>
                  <p className="text-holographic-white/60 mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Resale Market Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Resale Tickets</h2>
              <button
                onClick={() => setActiveTab('resale')}
                className="text-sm font-medium text-primary-400 hover:text-primary-300 flex items-center"
              >
                View all <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resaleTickets.slice(0, 3).map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-neutral-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-neutral-700 hover:border-primary-500/50 transition-colors duration-300"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-holographic-white mb-1">
                          {ticket.eventName}
                        </h3>
                        <div className="flex items-center text-sm text-holographic-white/60 mb-2">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          <span>{formatDate(ticket.eventDate, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs font-medium rounded">
                        {ticket.section}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-holographic-white/60 mb-1">Seat</p>
                        <p className="font-medium">{ticket.row}{ticket.seat}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-holographic-white/60 mb-1">Price</p>
                        <div className="flex items-center justify-end">
                          <span className="text-lg font-bold text-holographic-white">
                            ₹{ticket.price.toLocaleString('en-IN')}
                          </span>
                          {ticket.originalPrice > ticket.price && (
                            <span className="ml-2 text-sm text-holographic-white/60 line-through">
                              ₹{ticket.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-holographic-white/60 mt-4 pt-4 border-t border-neutral-700">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1.5" />
                        <span>{ticket.seller}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>{ticket.sellerRating}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchaseResale(ticket.id)}
                      disabled={isLoading}
                      className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-tech-blue text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                          Processing...
                        </>
                      ) : (
                        'Buy Now'
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-12">
            <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Ticket className="w-8 h-8 text-primary-400" />,
                  title: 'Buy Tickets',
                  description: 'Purchase tickets for your favorite events with just a few clicks.'
                },
                {
                  icon: <QrCode className="w-8 h-8 text-primary-400" />,
                  title: 'Secure Validation',
                  description: 'Verify ticket authenticity with our blockchain-powered validation system.'
                },
                {
                  icon: <Zap className="w-8 h-8 text-primary-400" />,
                  title: 'Instant Transfers',
                  description: 'Sell or transfer tickets instantly with no middlemen or hidden fees.'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-700 hover:border-primary-500/50 transition-colors duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-holographic-white mb-2">{item.title}</h3>
                  <p className="text-holographic-white/70">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900/50 border-t border-neutral-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-tech-blue flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-tech-blue bg-clip-text text-transparent">
                  Scantyx
                </span>
              </div>
              <p className="text-sm text-holographic-white/60">
                The most secure way to buy, sell, and manage event tickets with blockchain technology.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-holographic-white uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-2">
                {['About Us', 'Careers', 'Blog', 'Press'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-holographic-white/60 hover:text-primary-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-holographic-white uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-holographic-white/60 hover:text-primary-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-holographic-white uppercase tracking-wider mb-4">
                Connect With Us
              </h3>
              <div className="flex space-x-4">
                {['Twitter', 'Discord', 'Telegram', 'Github'].map((platform) => (
                  <a
                    key={platform}
                    href="#"
                    className="text-holographic-white/60 hover:text-primary-400 transition-colors"
                    aria-label={platform}
                  >
                    <span className="sr-only">{platform}</span>
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                      <span className="text-sm">{platform.charAt(0)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-neutral-800 text-center">
            <p className="text-sm text-holographic-white/50">
              &copy; {new Date().getFullYear()} Scantyx. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetails 
            event={selectedEvent} 
            onClose={handleCloseEvent} 
          />
        )}
        
        {showScanModal && (
          <ScanModal 
            show={showScanModal}
            onClose={closeAllModals}
            onScan={() => setScanning(true)}
            scanning={scanning}
            scanInput={scanInput}
            onInputChange={(e) => setScanInput(e.target.value)}
            onManualSubmit={handleManualTicketEntry}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DemoPage;
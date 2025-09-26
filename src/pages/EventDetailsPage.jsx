import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Search, Filter, FilterX, ArrowUpDown, Ticket, Calendar, MapPin, Clock, 
  DollarSign, Percent, Heart, AlertTriangle, ShoppingCart, Star, Eye, 
  TrendingUp, TrendingDown, Check, Loader2, Share2, BadgeCheck, ShieldCheck, 
  ChevronRight, ChevronDown, Plus, Minus, Facebook, Twitter, Mail, Link2, HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '../components/ui/pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { eventAPI } from '../services/eventService';
import { createGenericEvent } from '../utils/eventUtils';

const { getEvent, getEvents } = eventAPI;
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventsContext';
import { cn } from '../lib/utils';

// Utility functions
const calculateTimeLeft = (date) => {
  const difference = new Date(date) - new Date();
  if (difference <= 0) return 'Event started';
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const calculateTimeSincePosted = (listedOn) => {
  const difference = new Date() - new Date(listedOn);
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  
  if (days > 30) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  return 'Just now';
};

const formatCurrency = (amount) => {
  // Convert to number in case it's a string
  const numAmount = Number(amount);
  if (isNaN(numAmount)) return '₹0';
  
  // For amounts in thousands or more, show in K format (e.g., 1.5K, 10K)
  if (numAmount >= 1000) {
    return `₹${(numAmount / 1000).toFixed(1)}K`;
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Event Details Page Component
const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { getEventById, purchaseTicket, addToCart } = useEvents();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicketType, setSelectedTicketType] = useState('silver');
  const [selectedTickets, setSelectedTickets] = useState({
    silver: { quantity: 0, price: 1999, max: 5 },
    gold: { quantity: 0, price: 4999, max: 3 },
    platinum: { quantity: 0, price: 9999, max: 2 }
  });
  const [activeTab, setActiveTab] = useState('tickets');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState({ type: '', message: '' });
  const [timeLeft, setTimeLeft] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEventById(eventId);
        setEvent(eventData);
        setTimeLeft(calculateTimeLeft(eventData.startDate));
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details. Showing fallback event data.');
        try {
          // Create a fallback event if the real one can't be loaded
          const fallbackEvent = createGenericEvent(eventId);
          console.log('Created fallback event:', fallbackEvent);
          setEvent(fallbackEvent);
          setError(null); // Clear error since we have a fallback
        } catch (fallbackErr) {
          console.error('Error creating fallback event:', fallbackErr);
          setError('Failed to load event details and create fallback');
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }

    // Update time left every minute
    const timer = setInterval(() => {
      if (event?.startDate) {
        setTimeLeft(calculateTimeLeft(event.startDate));
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [eventId, getEventById, event?.startDate]);

  // Handle ticket quantity change
  const handleTicketQuantity = (tier, newQuantity) => {
    setSelectedTicketType(tier); // Update the selected ticket type
    setSelectedTickets(prev => {
      const updatedQuantity = Math.max(0, Math.min(newQuantity, prev[tier].max));
      return {
        ...prev,
        [tier]: {
          ...prev[tier],
          quantity: updatedQuantity
        }
      };
    });
  };

  // Toggle seat selection
  const toggleSeatSelection = (section, row, seat) => {
    const seatId = `${section}-${row}-${seat}`;
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  // Calculate subtotal, fees, and total
  const calculateOrderTotal = useCallback(() => {
    const subtotal = Object.values(selectedTickets).reduce(
      (sum, ticket) => sum + (ticket.quantity * (ticket.price || 0)),
      0
    );
    const platformFee = Math.ceil(subtotal * 0.05); // 5% platform fee
    const total = subtotal + platformFee;
    
    return {
      subtotal,
      platformFee,
      total
    };
  }, [selectedTickets]);

  // Handle purchase - Redirect to payment page
  const handlePurchase = async () => {
    try {
      // Check if any tickets are selected for the selected ticket type
      const selectedTicket = selectedTickets[selectedTicketType];
      
      if (!selectedTicket || selectedTicket.quantity <= 0) {
        setPurchaseStatus({
          type: 'error',
          message: `Please select at least one ${selectedTicketType} ticket.`
        });
        return;
      }

      setPurchaseStatus({ type: 'loading', message: 'Preparing your order...' });
      
      // Prepare ticket details for the order
      const ticketDetails = Object.entries(selectedTickets)
        .filter(([_, ticket]) => ticket.quantity > 0)
        .map(([tier, ticket]) => ({
          type: tier,
          quantity: ticket.quantity,
          price: ticket.price,
          total: ticket.quantity * ticket.price
        }));

      // Calculate order total with platform fee
      const orderTotal = calculateOrderTotal();

      // Get the first selected ticket (there should be exactly one since we're using ticket types)
      const selectedTicketDetail = ticketDetails[0];
      
      // Prepare ticket data in the format expected by PaymentPage
      const ticketData = {
        id: `${eventId}-${selectedTicketDetail.type}`,
        eventId: event?.id || eventId,
        eventName: event?.title || `Event ${eventId}`,
        eventImage: event?.image || 'https://source.unsplash.com/random/800x600/?event',
        ticketType: selectedTicketDetail.type.charAt(0).toUpperCase() + selectedTicketDetail.type.slice(1),
        resellPrice: selectedTicketDetail.price,
        quantity: selectedTicketDetail.quantity,
        venue: event?.venue?.name || 'Venue not specified',
        date: event?.date || new Date().toISOString()
      };

      // Redirect to payment page with ticket data
      navigate('/payment', { 
        state: { 
          ticket: ticketData,
          subtotal: orderTotal.subtotal,
          platformFee: orderTotal.platformFee,
          total: orderTotal.total
        } 
      });
      
    } catch (error) {
      console.error('Error processing order:', error);
      setPurchaseStatus({ 
        type: 'error', 
        message: 'Failed to process your order. Please try again.' 
      });
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }

    // Check if any tickets are selected
    const totalTickets = Object.values(selectedTickets).reduce(
      (sum, ticket) => sum + ticket.quantity, 0
    );

    if (totalTickets === 0) {
      setPurchaseStatus({
        type: 'error',
        message: 'Please select at least one ticket.'
      });
      return;
    }

    try {
      // Prepare cart items with ticket details
      const cartItems = Object.entries(selectedTickets)
        .filter(([_, ticket]) => ticket.quantity > 0)
        .map(([tier, ticket]) => ({
          eventId,
          ticketType: tier,
          quantity: ticket.quantity,
          price: ticket.price,
          total: ticket.quantity * ticket.price
        }));

      // Add each ticket type to cart
      await Promise.all(cartItems.map(item => addToCart(item)));
      
      setPurchaseStatus({ 
        type: 'success', 
        message: `${totalTickets} ticket(s) added to cart successfully!` 
      });
      
      // Reset quantities after adding to cart
      setSelectedTickets({
        silver: { ...selectedTickets.silver, quantity: 0 },
        gold: { ...selectedTickets.gold, quantity: 0 },
        platinum: { ...selectedTickets.platinum, quantity: 0 }
      });
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setPurchaseStatus({ 
        type: 'error', 
        message: error.message || 'Failed to add to cart. Please try again.' 
      });
    }
  };

  // Share event
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: window.location.href,
        });
      } else {
        setShowShareModal(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Event not found</h2>
        <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/">Browse Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
              Home
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link to="/events" className="ml-1 text-sm font-medium text-muted-foreground hover:text-foreground md:ml-2">
                Events
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="ml-1 text-sm font-medium text-foreground md:ml-2">
                {event.title}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Event Header */}
      <div className="bg-card rounded-xl shadow-sm border mb-8 overflow-hidden">
        <div className="relative h-64 md:h-96 bg-gray-900">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/1200x600?text=Event+Image';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xl">{event.title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-sm">
                    {event.category || 'Event'}
                  </Badge>
                  {event.isFeatured && (
                    <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-sm">
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {event.title}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-white/90 flex-wrap">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{event.venue?.name || event.location || 'Online Event'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  {event.price > 0 && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="font-semibold text-white">{formatCurrency(event.price)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-background/50 backdrop-blur-sm border-white/20 hover:bg-background/70"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`bg-background/50 backdrop-blur-sm border-white/20 hover:bg-background/70 ${
                    isFavorite ? 'text-red-500 hover:text-red-500' : ''
                  }`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart 
                    className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} 
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="lineup">Lineup</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'tickets' && (
                <div className="space-y-8">
                  {/* Venue Layout */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Venue Layout</h3>
                    <div className="relative w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                      {/* Stage */}
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-3/4 h-12 bg-blue-600 text-white flex items-center justify-center font-medium rounded-t-lg">
                        STAGE
                      </div>
                      
                      {/* Seating Sections */}
                      <div className="absolute inset-4 mt-16 flex flex-col space-y-2">
                        {/* Platinum Section (Front Rows) */}
                        <div className="flex-1 flex flex-col space-y-1">
                          <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">Platinum</div>
                          {[...Array(4)].map((_, row) => (
                            <div key={`platinum-${row}`} className="flex justify-center space-x-1">
                              {[...Array(8)].map((_, seat) => {
                                const seatId = `platinum-${row}-${seat}`;
                                const isSelected = selectedSeats.includes(seatId);
                                return (
                                  <button
                                    key={seatId}
                                    onClick={() => toggleSeatSelection('platinum', row, seat)}
                                    className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs ${
                                      isSelected 
                                        ? 'bg-amber-500 text-white' 
                                        : 'bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800/70'
                                    }`}
                                    disabled={row >= 2} // First 2 rows selectable
                                  >
                                    {isSelected ? '✓' : seat + 1}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        
                        {/* Gold Section (Middle Rows) */}
                        <div className="flex-1 flex flex-col space-y-1 mt-4">
                          <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">Gold</div>
                          {[...Array(6)].map((_, row) => (
                            <div key={`gold-${row}`} className="flex justify-center space-x-1">
                              {[...Array(12)].map((_, seat) => {
                                const seatId = `gold-${row}-${seat}`;
                                const isSelected = selectedSeats.includes(seatId);
                                return (
                                  <button
                                    key={seatId}
                                    onClick={() => toggleSeatSelection('gold', row, seat)}
                                    className={`w-5 h-5 rounded-sm text-xs ${
                                      isSelected 
                                        ? 'bg-yellow-500 text-white' 
                                        : 'bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-200 dark:hover:bg-yellow-800/70'
                                    }`}
                                    disabled={row >= 4} // First 4 rows selectable
                                  >
                                    {isSelected ? '✓' : ''}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        
                        {/* Silver Section (Back Rows) */}
                        <div className="flex-1 flex flex-col space-y-1 mt-4">
                          <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">Silver</div>
                          {[...Array(8)].map((_, row) => (
                            <div key={`silver-${row}`} className="flex justify-center space-x-1">
                              {[...Array(16)].map((_, seat) => {
                                const seatId = `silver-${row}-${seat}`;
                                const isSelected = selectedSeats.includes(seatId);
                                return (
                                  <button
                                    key={seatId}
                                    onClick={() => toggleSeatSelection('silver', row, seat)}
                                    className={`w-4 h-4 rounded-sm text-[10px] flex items-center justify-center ${
                                      isSelected 
                                        ? 'bg-gray-400 text-white' 
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                    disabled={row >= 6} // First 6 rows selectable
                                  >
                                    {isSelected ? '✓' : ''}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Legend */}
                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 text-xs">
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-amber-500 mr-1 rounded-sm"></span>
                          <span>Platinum</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-yellow-500 mr-1 rounded-sm"></span>
                          <span>Gold</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-gray-400 mr-1 rounded-sm"></span>
                          <span>Silver</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-gray-200 dark:bg-gray-700 mr-1 rounded-sm border border-gray-300 dark:border-gray-600"></span>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-gray-100 dark:bg-gray-800 mr-1 rounded-sm border border-dashed border-gray-300 dark:border-gray-600"></span>
                          <span>Unavailable</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ticket Types */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Select Tickets</h3>
                    
                    {/* Platinum Ticket */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4">
                        <h4 className="text-lg font-bold">Platinum Experience</h4>
                        <p className="text-amber-100 text-sm">Best seats in the house with premium amenities</p>
                      </div>
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="font-medium">Platinum Ticket</p>
                            <p className="text-sm text-muted-foreground">First 2 rows • Private bar access • VIP lounge</p>
                            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                              {selectedTickets.platinum.max - selectedTickets.platinum.quantity} tickets left
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold">
                                {selectedTickets.platinum.price > 0 
                                  ? formatCurrency(selectedTickets.platinum.price)
                                  : 'Free'}
                              </p>
                              <p className="text-xs text-muted-foreground">per ticket</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleTicketQuantity('platinum', selectedTickets.platinum.quantity - 1)}
                                disabled={selectedTickets.platinum.quantity <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{selectedTickets.platinum.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleTicketQuantity('platinum', selectedTickets.platinum.quantity + 1)}
                                disabled={selectedTickets.platinum.quantity >= selectedTickets.platinum.max}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Gold Ticket */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white p-4">
                        <h4 className="text-lg font-bold">Gold Experience</h4>
                        <p className="text-yellow-100 text-sm">Great view with comfortable seating</p>
                      </div>
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="font-medium">Gold Ticket</p>
                            <p className="text-sm text-muted-foreground">Middle section • Comfortable seating • Quick bar access</p>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                              {selectedTickets.gold.max - selectedTickets.gold.quantity} tickets left
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold">{formatCurrency(selectedTickets.gold.price)}</p>
                              <p className="text-xs text-muted-foreground">per ticket</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleTicketQuantity('gold', selectedTickets.gold.quantity - 1)}
                                disabled={selectedTickets.gold.quantity <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{selectedTickets.gold.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleTicketQuantity('gold', selectedTickets.gold.quantity + 1)}
                                disabled={selectedTickets.gold.quantity >= selectedTickets.gold.max}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Silver Ticket */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4">
                        <h4 className="text-lg font-bold">Silver Experience</h4>
                        <p className="text-gray-100 text-sm">Affordable option with good view</p>
                      </div>
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="font-medium">Silver Ticket</p>
                            <p className="text-sm text-muted-foreground">Upper section • Standard seating • Food court access</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {selectedTickets.silver.max - selectedTickets.silver.quantity} tickets left
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold">{formatCurrency(selectedTickets.silver.price)}</p>
                              <p className="text-xs text-muted-foreground">per ticket</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleTicketQuantity('silver', selectedTickets.silver.quantity - 1)}
                                disabled={selectedTickets.silver.quantity <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{selectedTickets.silver.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleTicketQuantity('silver', selectedTickets.silver.quantity + 1)}
                                disabled={selectedTickets.silver.quantity >= selectedTickets.silver.max}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="prose max-w-none">
                    <h3 className="text-2xl font-bold mb-4">About This Event</h3>
                    <p className="text-muted-foreground">{event.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Date & Time</h4>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        {event.endDate && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                              {new Date(event.startDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} - {new Date(event.endDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZoneName: 'short'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Location</h4>
                      <div className="space-y-1">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="font-medium">{event.venue?.name || 'Online Event'}</p>
                            {event.venue?.address && (
                              <p className="text-sm text-muted-foreground">
                                {event.venue.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {event.organizer && (
                    <div>
                      <h4 className="font-semibold mb-2">Organizer</h4>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                          <span className="text-sm font-medium">
                            {event.organizer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{event.organizer.name}</p>
                          {event.organizer.website && (
                            <a 
                              href={event.organizer.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-muted-foreground hover:underline"
                            >
                              View website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'lineup' && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">Event Lineup</h3>
                  {event.performers && event.performers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {event.performers.map((performer, index) => (
                        <div key={index} className="flex items-center p-4 border rounded-lg">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mr-4">
                            {performer.image ? (
                              <img 
                                src={performer.image} 
                                alt={performer.name} 
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-medium">
                                {performer.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{performer.name}</p>
                            {performer.genre && (
                              <p className="text-sm text-muted-foreground">{performer.genre}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h4 className="text-lg font-medium">No lineup announced yet</h4>
                      <p className="text-muted-foreground mt-1">
                        Check back later for updates on performers and speakers.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Reviews</h3>
                    <Button>Write a Review</Button>
                  </div>
                  
                  {event.reviews && event.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {event.reviews.map((review, index) => (
                        <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                                <span className="text-sm font-medium">
                                  {review.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{review.userName}</p>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        i < Math.floor(review.rating) 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-muted-foreground/30'
                                      }`} 
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-2 text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h4 className="text-lg font-medium">No reviews yet</h4>
                      <p className="text-muted-foreground mt-1">
                        Be the first to review this event.
                      </p>
                      <Button className="mt-4">Write a Review</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Tabs>
        </div>

        {/* Ticket Purchase Card */}
        <div className="lg:sticky lg:top-8 h-fit">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Get Tickets</CardTitle>
              {timeLeft && (
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline-block mr-1" />
                  {timeLeft} left
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {purchaseStatus.message && (
                <div 
                  className={`p-3 rounded-md text-sm ${
                    purchaseStatus.type === 'error' 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-green-50 text-green-700'
                  }`}
                >
                  {purchaseStatus.message}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="ticket-type" className="block text-sm font-medium mb-2">
                    Ticket Type
                  </Label>
                  <Select 
                    value={selectedTicketType}
                    onValueChange={setSelectedTicketType}
                  >
                    <SelectTrigger id="ticket-type">
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="silver">Silver Ticket</SelectItem>
                      <SelectItem value="gold">Gold Ticket</SelectItem>
                      <SelectItem value="platinum">Platinum Ticket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {/* Silver Ticket Quantity */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Silver Ticket</h4>
                        <p className="text-sm text-muted-foreground">Standard seating • Food court access</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {selectedTickets.silver.max - selectedTickets.silver.quantity} tickets left
                        </p>
                      </div>
                      <div className="text-lg font-bold">{formatCurrency(selectedTickets.silver.price)}</div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-medium">Quantity</span>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTicketQuantity('silver', selectedTickets.silver.quantity - 1)}
                          disabled={selectedTickets.silver.quantity <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{selectedTickets.silver.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTicketQuantity('silver', selectedTickets.silver.quantity + 1)}
                          disabled={selectedTickets.silver.quantity >= selectedTickets.silver.max}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Gold Ticket Quantity */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Gold Ticket</h4>
                        <p className="text-sm text-muted-foreground">Middle section • Comfortable seating</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                          {selectedTickets.gold.max - selectedTickets.gold.quantity} tickets left
                        </p>
                      </div>
                      <div className="text-lg font-bold">{formatCurrency(selectedTickets.gold.price)}</div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-medium">Quantity</span>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTicketQuantity('gold', selectedTickets.gold.quantity - 1)}
                          disabled={selectedTickets.gold.quantity <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{selectedTickets.gold.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTicketQuantity('gold', selectedTickets.gold.quantity + 1)}
                          disabled={selectedTickets.gold.quantity >= selectedTickets.gold.max}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Platinum Ticket Quantity */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Platinum Ticket</h4>
                        <p className="text-sm text-muted-foreground">Front rows • VIP access</p>
                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                          {selectedTickets.platinum.max - selectedTickets.platinum.quantity} tickets left
                        </p>
                      </div>
                      <div className="text-lg font-bold">{formatCurrency(selectedTickets.platinum.price)}</div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-medium">Quantity</span>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTicketQuantity('platinum', selectedTickets.platinum.quantity - 1)}
                          disabled={selectedTickets.platinum.quantity <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{selectedTickets.platinum.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTicketQuantity('platinum', selectedTickets.platinum.quantity + 1)}
                          disabled={selectedTickets.platinum.quantity >= selectedTickets.platinum.max}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {/* Display individual ticket prices */}
                  {Object.entries(selectedTickets)
                    .filter(([_, ticket]) => ticket.quantity > 0)
                    .map(([tier, ticket]) => (
                      <div key={tier} className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {tier.charAt(0).toUpperCase() + tier.slice(1)} x{ticket.quantity}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(ticket.price * ticket.quantity)}
                        </span>
                      </div>
                    ))}
                  
                  {/* Ticket Price */}
                  <div className="flex justify-between pt-2">
                    <span className="text-sm font-medium text-foreground">Ticket Price</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(calculateOrderTotal().subtotal)}
                    </span>
                  </div>
                  
                  {/* GST (18%) */}
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-foreground">GST (18% included)</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-48 text-xs">
                            18% GST is already included in the ticket price as per government regulations.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="font-medium text-foreground">
                      {formatCurrency(calculateOrderTotal().subtotal * 0.18)}
                    </span>
                  </div>
                  
                  {/* Platform Fee */}
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground">Platform Fee (5%)</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-48 text-xs">
                            This fee helps us maintain our platform and provide 24/7 customer support.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(calculateOrderTotal().platformFee)}
                    </span>
                  </div>
                  
                  {/* Total */}
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-foreground">Total Amount</span>
                    <span className="text-foreground">{formatCurrency(calculateOrderTotal().total)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    *18% GST included in the ticket price</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                size="lg" 
                className="w-full"
                onClick={handlePurchase}
                disabled={purchaseStatus.type === 'loading'}
              >
                {purchaseStatus.type === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : 'Buy Now'}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={handleAddToCart}
                disabled={purchaseStatus.type === 'loading'}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Secure checkout. Free cancellation up to 24 hours before the event.
              </p>
            </CardFooter>
          </Card>

          {/* Safety Tips */}
          <Card className="mt-6 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-green-600" />
                Safe & Secure
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>100% guarantee of authenticity for all tickets</span>
              </div>
              <div className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Secure payment processing</span>
              </div>
              <div className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>24/7 customer support</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this event</DialogTitle>
            <DialogDescription>
              Share this event with your friends and family.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button variant="outline">
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button variant="outline">
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setPurchaseStatus({ type: 'success', message: 'Link copied to clipboard!' });
              setShowShareModal(false);
            }}>
              <Link2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Mock data for Resell Tickets
const mockResellTickets = [
  {
    id: 1,
    eventId: 'summer-fest-2026',
    eventName: 'Summer Music Festival 2026',
    eventDate: '2026-07-15T18:00:00+05:30',
    eventLocation: 'Marine Drive, Mumbai',
    ticketType: 'VIP Pass',
    originalPrice: 5000,
    resellPrice: 4500,
    discount: 10,
    seller: 'John D.',
    sellerRating: 4.8,
    sellerVerified: true,
    isVerified: true,
    listedOn: '2025-10-01T14:30:00+05:30',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1740&q=80',
    description: 'Selling my VIP pass for Summer Music Festival 2026. Includes fast-track entry and lounge access.',
    views: 245,
    favorites: 56,
    sold: 10,
    quantity: 2,
    isWatched: false,
    isFavorite: false,
    category: 'Music Festival',
    priceTrend: 'stable',
    city: 'Mumbai'
  },
  // Add more mock tickets here...
];

const categories = ['All', 'Concert', 'Music Festival', 'Festival', 'Summit', 'Exhibition', 'Sports', 'Theater', 'Workshop'];
const cities = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];

// Resell Tickets Page Component
const ResellTicketsPage = ({ initialFilters = {} }) => {
  const { isAuthenticated, user } = useAuth();
  const { purchaseResellTicket, verifyTicket } = useEvents();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [sortBy, setSortBy] = useState(initialFilters.sort || 'newest');
  const [activeTab, setActiveTab] = useState(initialFilters.tab || 'all');
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || [0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState(initialFilters.categories || []);
  const [selectedCity, setSelectedCity] = useState(initialFilters.city || 'All');
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage, setTicketsPerPage] = useState(9);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareTickets, setCompareTickets] = useState([]);
  const [reportReason, setReportReason] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [failedImages, setFailedImages] = useState(new Set());

  // Simulate API fetch
  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTickets(mockResellTickets.map(ticket => ({
        ...ticket,
        timeLeft: calculateTimeLeft(ticket.eventDate),
        timeSincePosted: calculateTimeSincePosted(ticket.listedOn)
      })));
      setIsLoading(false);
    };
    fetchTickets();
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    return tickets
      .filter(ticket => {
        const matchesSearch = ticket.eventName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          ticket.ticketType.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          ticket.seller.toLowerCase().includes(searchTerm.toLowerCase().trim());
        const matchesTab = activeTab === 'all' || ticket.ticketType.toLowerCase().includes(activeTab.toLowerCase());
        const matchesPrice = ticket.resellPrice >= priceRange[0] && ticket.resellPrice <= priceRange[1];
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(ticket.category);
        const matchesCity = selectedCity === 'All' || ticket.city === selectedCity;
        return matchesSearch && matchesTab && matchesPrice && matchesCategory && matchesCity;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.resellPrice - b.resellPrice;
        if (sortBy === 'price-desc') return b.resellPrice - a.resellPrice;
        if (sortBy === 'discount-desc') return b.discount - a.discount;
        if (sortBy === 'views-desc') return b.views - a.views;
        if (sortBy === 'rating-desc') return b.sellerRating - a.sellerRating;
        return new Date(b.listedOn) - new Date(a.listedOn);
      });
  }, [tickets, searchTerm, activeTab, priceRange, selectedCategories, selectedCity, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / ticketsPerPage));
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);

  // Handle purchase
  const handlePurchase = useCallback(async (ticket) => {
    if (!isAuthenticated) {
      setStatus({ type: 'error', message: 'Please sign in to purchase tickets.' });
      navigate('/login', { state: { from: '/resell' } });
      return;
    }
    setLoadingPurchase(true);
    try {
      await purchaseResellTicket(ticket.id);
      navigate('/payment', { state: { ticket, from: '/resell' } });
    } catch (error) {
      setStatus({ type: 'error', message: 'Purchase failed. Please try again.' });
    } finally {
      setLoadingPurchase(false);
      setShowPurchaseModal(false);
    }
  }, [isAuthenticated, navigate, purchaseResellTicket]);

  // Handle verify ticket
  const handleVerify = useCallback(async (id) => {
    setLoadingVerify(true);
    try {
      const isValid = await verifyTicket(id);
      setStatus({ type: 'success', message: isValid ? 'Ticket is valid!' : 'Ticket verification failed.' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Verification failed. Please try again.' });
    } finally {
      setLoadingVerify(false);
    }
  }, [verifyTicket]);

  // Toggle favorite
  const toggleFavorite = useCallback((id) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === id ? { ...ticket, isFavorite: !ticket.isFavorite } : ticket
    ));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Verified Resale Tickets
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Secure the best seats at the best prices. Every ticket is verified for your peace of mind.
          </p>
        </div>

        {/* Status Notification */}
        <AnimatePresence>
          {status.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'p-3 rounded-lg mb-4 max-w-7xl mx-auto',
                status.type === 'error' ? 'bg-red-100 border border-red-300 text-red-600' : 'bg-green-100 border border-green-300 text-green-600'
              )}
            >
              <p className="text-sm flex items-start">
                {status.type === 'error' ? (
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                ) : (
                  <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                )}
                {status.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filter Bar */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search events, tickets, or sellers..."
                className="pl-10 h-12 text-base border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] h-12">
                <ArrowUpDown className="mr-2 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="discount-desc">Best Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              {['all', 'vip', 'general', 'early-bird', 'group'].map(tab => (
                <TabsTrigger key={tab} value={tab}>
                  {tab === 'all' ? 'All' : tab.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Ticket Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTickets.map(ticket => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="h-full flex flex-col overflow-hidden group transition-all duration-300 hover:shadow-xl">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={ticket.image}
                    alt={ticket.eventName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-green-500 text-white">
                      {Math.round(ticket.discount)}% OFF
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/90 hover:bg-white rounded-full"
                      onClick={() => toggleFavorite(ticket.id)}
                    >
                      <Heart
                        className={cn(
                          'h-4 w-4',
                          ticket.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
                        )}
                      />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4 flex-1">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {ticket.ticketType}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{ticket.eventName}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{ticket.eventLocation.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(ticket.eventDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="text-sm text-gray-500 line-through">
                        ₹{ticket.originalPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        ₹{ticket.resellPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                          {ticket.seller[0]}
                        </div>
                        <span className="text-sm font-medium">{ticket.seller}</span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-3 w-3',
                              i < Math.floor(ticket.sellerRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            )}
                          />
                        ))}
                        <span className="text-xs text-gray-600 ml-1">{ticket.sellerRating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowPurchaseModal(true);
                    }}
                    disabled={ticket.quantity === 0}
                  >
                    {ticket.quantity > 0 ? 'Buy Now' : 'Sold Out'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {filteredTickets.length > ticketsPerPage && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Resell Ticket</DialogTitle>
            <DialogDescription>
              Confirm your purchase for this ticket.
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{selectedTicket.eventName}</h4>
                <p className="text-sm text-gray-600">{selectedTicket.ticketType}</p>
              </div>
              <div className="flex justify-between">
                <span>Resell Price</span>
                <span className="font-bold text-green-600">₹{selectedTicket.resellPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Original Price</span>
                <span className="line-through">₹{selectedTicket.originalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Savings</span>
                <span>{Math.round(selectedTicket.discount)}%</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseModal(false)}>
              Cancel
            </Button>
            <Button
              disabled={loadingPurchase}
              onClick={() => handlePurchase(selectedTicket)}
            >
              {loadingPurchase ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Purchase'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// PropTypes
EventDetailsPage.propTypes = {};
ResellTicketsPage.propTypes = {
  initialFilters: PropTypes.object
};

export { EventDetailsPage, ResellTicketsPage };
export default EventDetailsPage;
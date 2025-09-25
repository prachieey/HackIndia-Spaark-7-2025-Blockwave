import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  User, 
  ArrowLeft, 
  AlertCircle, 
  Check, 
  Star, 
  MessageSquare,
  Shield,
  Ticket,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  X,
  Facebook,
  Twitter,
  Instagram,
  Share2,
  Heart,
  Clock as ClockIcon,
  Info,
  Map
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import { useEvents } from '../contexts/EventsContext';
import { useAuth } from '../contexts/AuthContext';
import { ReviewsSection } from '../components/reviews';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

// Format currency in INR
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Calculate total with tax
const calculateTotal = (price, quantity) => {
  const subtotal = price * quantity;
  const tax = subtotal * 0.18; // 18% GST
  return {
    subtotal,
    tax,
    total: subtotal + tax
  };
};

// Format date range
const formatDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  if (startDate.toDateString() === endDate.toDateString()) {
    return `${startDate.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })} • ${startDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} - ${endDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short' 
    })}`;
  } else {
    return `${startDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    })} - ${endDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })}`;
  }
};

// Render star rating
const renderStars = (rating, size = 'md') => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<Star key={i} className={`${sizeClass} text-yellow-400 fill-current`} />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<Star key={i} className={`${sizeClass} text-yellow-400 fill-current`} />);
    } else {
      stars.push(<Star key={i} className={`${sizeClass} text-gray-400 fill-current`} />);
    }
  }
  
  return stars;
};

// Sample event data
const sampleEvent = {
  _id: 'summer-fest-2025',
  title: 'Summer Music Festival 2025',
  description: 'Join us for the biggest music festival of the year! Experience amazing performances from top artists across multiple stages, delicious food, and an unforgettable atmosphere.',
  startDate: '2025-12-15T18:00:00.000Z',
  endDate: '2025-12-17T23:00:00.000Z',
  location: 'Mahalaxmi Racecourse, Mumbai',
  image: 'https://source.unsplash.com/random/1200x600/?music-festival',
  capacity: 10000,
  registered: 7500,
  category: 'Music',
  organizer: {
    name: 'Event Masters',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
  },
  ticketTypes: [
    {
      id: 'general',
      name: 'General Admission',
      price: 25000,
      available: 2500,
      description: '3-day general admission pass',
      benefits: [
        'Access to all general admission areas',
        'Access to food and beverage vendors',
        'Access to merchandise stands',
        'Live performances across 3 stages'
      ]
    },
    {
      id: 'vip',
      name: 'VIP Experience',
      price: 50000,
      available: 200,
      description: 'VIP access with premium viewing areas and amenities',
      benefits: [
        'Exclusive VIP entrance',
        'Premium viewing areas near the stage',
        'Complimentary food and drinks',
        'VIP lounge access',
        'Exclusive merchandise pack',
        'Dedicated parking'
      ]
    }
  ]
};

// Sample reviews data
const sampleReviews = [
  {
    id: 1,
    user: 'Rahul Sharma',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    date: '2025-01-15',
    comment: 'One of the best music festivals I\'ve ever attended! The lineup was incredible and the organization was top-notch. Can\'t wait for next year!',
    verified: true
  },
  {
    id: 2,
    user: 'Priya Patel',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4,
    date: '2025-01-10',
    comment: 'Amazing experience overall! The sound quality was excellent and the food options were great. The only downside was the long lines at the entry.',
    verified: true
  },
  {
    id: 3,
    user: 'Amit Kumar',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    rating: 5,
    date: '2025-01-05',
    comment: 'Absolutely worth every penny! The atmosphere was electric and the performances were mind-blowing. The VIP experience was exceptional with all the added perks.',
    verified: true
  },
  {
    id: 4,
    user: 'Neha Gupta',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 3,
    date: '2025-01-02',
    comment: 'Good event but could be better organized. The main stage was overcrowded and it was hard to get a good view. Food and drinks were overpriced.',
    verified: true
  }
];

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getEventById, purchaseTicket } = useEvents();
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(sampleEvent);
  const [reviews, setReviews] = useState(sampleReviews);
  const [loading, setLoading] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [purchaseStatus, setPurchaseStatus] = useState({ type: '', message: '' });
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState('general');
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  // Calculate ticket stats
  const selectedTicket = useMemo(() => 
    event.ticketTypes.find(t => t.id === selectedTicketType) || event.ticketTypes[0], 
    [event.ticketTypes, selectedTicketType]
  );
  
  const { subtotal, tax, total } = useMemo(
    () => calculateTotal(selectedTicket?.price || 0, ticketQuantity),
    [selectedTicket, ticketQuantity]
  );
  
  // Handle ticket purchase
  const handlePurchase = async () => {
    if (!isAuthenticated) {
      setPurchaseStatus({
        type: 'error',
        message: 'Please sign in to purchase tickets'
      });
      setTimeout(() => {
        navigate('/login', { state: { from: `/events/${eventId}` } });
      }, 1500);
      return;
    }

    if (!selectedTicket || selectedTicket.available < ticketQuantity) {
      setPurchaseStatus({
        type: 'error',
        message: 'Not enough tickets available. Please reduce the quantity.'
      });
      return;
    }

    try {
      setIsPurchasing(true);
      setPurchaseStatus({ type: '', message: '' });

      // In a real app, you would process the payment here
      // const result = await purchaseTicket(eventId, ticketQuantity, selectedTicketType);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update available tickets
      const updatedTicketTypes = event.ticketTypes.map(t => 
        t.id === selectedTicketType 
          ? { ...t, available: t.available - ticketQuantity }
          : t
      );
      
      setEvent(prev => ({
        ...prev,
        ticketTypes: updatedTicketTypes
      }));
      
      setPurchaseStatus({
        type: 'success',
        message: `Success! ${ticketQuantity} ${ticketQuantity > 1 ? 'tickets' : 'ticket'} purchased for ${formatCurrency(total)}.`
      });
      
      setShowPurchaseSuccess(true);
      
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseStatus({
        type: 'error',
        message: error.message || 'An error occurred while processing your purchase. Please try again.'
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  // Format event date and time
  const eventDate = useMemo(
    () => formatDateRange(event.startDate, event.endDate),
    [event.startDate, event.endDate]
  );

  // Render ticket type options
  const renderTicketOptions = () => (
    <RadioGroup 
      value={selectedTicketType} 
      onValueChange={setSelectedTicketType}
      className="space-y-4"
    >
      {event.ticketTypes.map((ticket) => (
        <div 
          key={ticket.id}
          className={`p-4 rounded-xl border-2 transition-colors ${
            selectedTicketType === ticket.id
              ? 'border-blue-500 bg-blue-900/20'
              : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
          }`}
        >
          <div className="flex items-start">
            <RadioGroupItem 
              value={ticket.id} 
              id={`ticket-${ticket.id}`}
              className="mt-1 mr-3"
              disabled={ticket.available <= 0}
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <Label 
                    htmlFor={`ticket-${ticket.id}`} 
                    className="text-lg font-semibold cursor-pointer"
                  >
                    {ticket.name}
                  </Label>
                  <p className="text-gray-300 text-sm mt-1">{ticket.description}</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{formatCurrency(ticket.price)}</span>
                    <span className="text-sm text-gray-400 ml-2">per ticket</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  ticket.available > 0 
                    ? 'bg-green-900/30 text-green-400' 
                    : 'bg-red-900/30 text-red-400'
                }`}>
                  {ticket.available > 0 
                    ? `${ticket.available} available` 
                    : 'Sold Out'}
                </div>
              </div>
              
              {ticket.benefits && ticket.benefits.length > 0 && (
                <div className="mt-3 pl-1">
                  <ul className="space-y-2 text-sm text-gray-300">
                    {ticket.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </RadioGroup>
  );

  // Render ticket quantity selector
  const renderQuantitySelector = () => (
    <div className="mt-6 pt-6 border-t border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-medium text-gray-200">Quantity</h4>
          <p className="text-sm text-gray-400">
            {selectedTicket.available > 0 
              ? `${selectedTicket.available} tickets available` 
              : 'Sold out'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            className="h-10 w-10 p-0"
            onClick={() => setTicketQuantity(prev => Math.max(1, prev - 1))}
            disabled={ticketQuantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-medium">{ticketQuantity}</span>
          <Button 
            variant="outline" 
            size="sm"
            className="h-10 w-10 p-0"
            onClick={() => setTicketQuantity(prev => 
              Math.min(prev + 1, selectedTicket.available)
            )}
            disabled={ticketQuantity >= selectedTicket.available}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal ({ticketQuantity} {ticketQuantity > 1 ? 'tickets' : 'ticket'}):</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">GST (18%):</span>
          <span>+{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between pt-3 border-t border-gray-700 font-medium">
          <span className="text-gray-200">Total:</span>
          <div className="text-right">
            <div className="text-xl text-white">{formatCurrency(total)}</div>
            <div className="text-xs text-gray-400">
              {ticketQuantity} {ticketQuantity > 1 ? 'tickets' : 'ticket'} × {formatCurrency(selectedTicket.price)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Checkout Button */}
      <Button 
        className="w-full py-6 text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all"
        onClick={handlePurchase}
        disabled={isPurchasing || selectedTicket.available <= 0}
      >
        {isPurchasing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : selectedTicket.available <= 0 ? (
          'Sold Out'
        ) : (
          <>
            <span>Get Tickets</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
      
      <div className="mt-4 text-center text-sm text-gray-400 flex items-center justify-center">
        <Shield className="h-4 w-4 mr-2" />
        Secure checkout powered by Stripe
      </div>
      
      {/* Purchase Status Message */}
      {purchaseStatus.message && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          purchaseStatus.type === 'error' 
            ? 'bg-red-900/30 text-red-200 border border-red-800' 
            : 'bg-green-900/30 text-green-200 border border-green-800'
        }`}>
          {purchaseStatus.message}
        </div>
      )}
    </div>
  );

  // Render reviews section
  const renderReviews = () => (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Customer Reviews</h3>
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            {renderStars(averageRating, 'lg')}
            <span className="ml-2 text-lg font-medium">{averageRating}/5</span>
          </div>
          <Button 
            variant="outline"
            onClick={() => setReviews(prev => [...prev, {
              id: prev.length + 1,
              user: user?.name || 'You',
              avatar: user?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
              rating: 5,
              date: new Date().toISOString().split('T')[0],
              comment: 'This is a sample review',
              verified: true
            }])}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Write a Review
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <img 
                  src={review.avatar} 
                  alt={review.user} 
                  className="h-12 w-12 rounded-full object-cover mr-3"
                />
                <div>
                  <div className="font-medium">{review.user}</div>
                  <div className="flex items-center text-sm text-gray-400">
                    {review.verified && (
                      <span className="flex items-center mr-2 text-blue-400">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </span>
                    )}
                    <span>{review.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex">
                {renderStars(review.rating, 'sm')}
              </div>
            </div>
            <p className="mt-4 text-gray-300">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with back button */}
      <header className="relative">
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-4 left-4 z-10 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/70"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        
        {/* Event Cover Image */}
        <div className="h-64 md:h-96 w-full overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>
        
        {/* Event Info Overlay */}
        <div className="container mx-auto px-4 relative -mt-16">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-700/50">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <Badge variant="secondary" className="mr-2">
                    {event.category}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-300">
                    <Users className="h-4 w-4 mr-1" />
                    {event.registered} attending
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                <div className="flex items-center text-gray-300 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{eventDate}</span>
                </div>
                <div className="flex items-center text-gray-300 text-sm mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{event.location}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="rounded-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Heart className="h-4 w-4 mr-2 text-red-500" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Description */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  {event.description}
                </p>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-blue-400 mr-2" />
                    <h3 className="font-medium">Date & Time</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{eventDate}</p>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-5 w-5 text-green-400 mr-2" />
                    <h3 className="font-medium">Location</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{event.location}</p>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Ticket className="h-5 w-5 text-purple-400 mr-2" />
                    <h3 className="font-medium">Tickets Available</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {event.ticketTypes.reduce((sum, t) => sum + t.available, 0).toLocaleString()} tickets remaining
                  </p>
                </div>
                
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-yellow-400 mr-2" />
                    <h3 className="font-medium">Secure Checkout</h3>
                  </div>
                  <p className="text-gray-300 text-sm">Your payment is secure and encrypted</p>
                </div>
              </div>
            </div>
            
            {/* Reviews Section */}
            {renderReviews()}
          </div>
          
          {/* Sidebar - Ticket Purchase */}
          <div>
            <div className="sticky top-6">
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Get Tickets</h2>
                  
                  {renderTicketOptions()}
                  {selectedTicket && selectedTicket.available > 0 && renderQuantitySelector()}
                  
                  {selectedTicket && selectedTicket.available <= 0 && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                      <p className="text-red-400 font-medium">
                        <AlertCircle className="h-5 w-5 inline-block mr-2" />
                        This ticket type is sold out!
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Please select another ticket type or check back later for availability.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-900/50 p-4 border-t border-gray-700/50">
                  <div className="flex items-center justify-center text-sm text-gray-400">
                    <Shield className="h-4 w-4 mr-2" />
                    Secure checkout powered by Stripe
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                <h3 className="font-medium mb-3">Event Organizer</h3>
                <div className="flex items-center">
                  <img 
                    src={event.organizer.avatar} 
                    alt={event.organizer.name}
                    className="h-12 w-12 rounded-full object-cover mr-3"
                  />
                  <div>
                    <div className="font-medium">{event.organizer.name}</div>
                    <div className="text-sm text-gray-400">Organizer</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Contact Organizer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Purchase Success Modal */}
      {showPurchaseSuccess && (
        <Dialog open={showPurchaseSuccess} onOpenChange={setShowPurchaseSuccess}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-4">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Purchase Successful!</h3>
              <p className="text-gray-300 mb-6">
                Your {ticketQuantity} {ticketQuantity > 1 ? 'tickets' : 'ticket'} for {event.title} have been confirmed.
              </p>
              <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Order Total:</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>
                <div className="text-sm text-gray-400">
                  Confirmation sent to {user?.email || 'your email'}
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={() => {
                    setShowPurchaseSuccess(false);
                    // In a real app, you would navigate to the tickets page
                    // navigate('/my-tickets');
                  }}
                  className="w-full"
                >
                  View My Tickets
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPurchaseSuccess(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EventDetailsPage;

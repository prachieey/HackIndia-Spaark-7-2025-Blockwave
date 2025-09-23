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
  Loader2
} from 'lucide-react';
import { useEvents } from '../contexts/EventsContext';
import { useAuth } from '../contexts/AuthContext';
import { ReviewsSection } from '../components/reviews';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Import shared date utilities
import { formatEventDate, formatEventTime, formatEventDateRange } from '../utils/dateUtils';

// Helper function to create a generic event when the requested one is not found
const createGenericEvent = (eventId) => {
  return {
    _id: eventId,
    id: eventId,
    title: `Event ${eventId}`,
    description: 'This event could not be loaded. This is a placeholder event with sample data.',
    image: 'https://source.unsplash.com/random/800x600/?event',
    date: new Date().toISOString(),
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
    location: 'Location not specified',
    venue: {
      name: 'Venue not specified',
      address: 'Address not available',
      city: 'City not specified'
    },
    category: 'other',
    price: 0,
    minPrice: 0,
    maxPrice: 0,
    hasMultiplePrices: false,
    capacity: 100,
    registered: 0,
    isFree: true,
    rating: 0,
    ticketTypes: [
      { id: '1', name: 'General Admission', price: 0, quantity: 100, description: 'Standard entry' }
    ],
    organizer: {
      id: 'sample-organizer',
      name: 'Event Organizer',
      email: 'organizer@example.com'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __isFallback: true // Flag to indicate this is a fallback event
  };
};

const EventDetailsPage = () => {
  // All hooks must be called unconditionally at the top level
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getEventById, purchaseTicket } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [purchaseStatus, setPurchaseStatus] = useState({ type: '', message: '' });
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Memoize derived state
  const eventDate = useMemo(() => event ? formatEventDate(event.date) : '', [event]);
  const eventTime = useMemo(() => event ? formatEventTime(event.date) : '', [event]);
  const organizerName = useMemo(() => {
    if (!event) return 'Unknown Organizer';
    return typeof event.organizer === 'object' 
      ? event.organizer?.name || 'Unknown Organizer' 
      : event.organizer || 'Unknown Organizer';
  }, [event]);
  
  const ticketPrice = useMemo(() => {
    return event?.price ? formatCurrency(event.price) : 'Free';
  }, [event]);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchEvent = async () => {
      if (!eventId) {
        console.error('No event ID provided');
        // Instead of redirecting, create a generic event
        const genericEvent = createGenericEvent('no-id');
        setEvent(genericEvent);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching event with ID: ${eventId}`);
        const eventData = await getEventById(eventId);
        
        if (isMounted) {
          if (!eventData) {
            console.warn(`Event not found: ${eventId}, using fallback event`);
            const fallbackEvent = createGenericEvent(eventId);
            setEvent(fallbackEvent);
          } else {
            console.log('Successfully fetched event:', eventData._id || eventData.id);
            setEvent(eventData);
          }
        }
      } catch (error) {
        console.error('Error in fetchEvent:', {
          eventId,
          error: error.message,
          stack: error.stack
        });
        
        if (isMounted) {
          // Show a user-friendly error message
          alert('There was an error loading the event details. Please try again later.');
          navigate('/explore');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchEvent();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [eventId, getEventById, navigate]);
  
  // Using memoized date and time formatters from above
  
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    console.log('Purchase button clicked - Event ID:', eventId, 'Quantity:', ticketQuantity);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      setPurchaseStatus({
        type: 'error',
        message: 'Please sign in to purchase tickets'
      });
      // Add a small delay before redirecting to show the message
      setTimeout(() => {
        navigate('/login', { state: { from: `/events/${eventId}` } });
      }, 500);
      return;
    }
    
    // Validate ticket quantity
    if (event.availableTickets < ticketQuantity) {
      setPurchaseStatus({
        type: 'error',
        message: 'Not enough tickets available. Please reduce the quantity.'
      });
      return;
    }
    
    try {
      setIsPurchasing(true);
      setPurchaseStatus({ type: '', message: '' });
      
      // Basic validation
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      if (ticketQuantity < 1) {
        throw new Error('Please select at least one ticket');
      }
      
      console.log('Calling purchaseTicket API...');
      const result = await purchaseTicket(eventId, ticketQuantity);
      console.log('purchaseTicket result:', result);
      
      if (!result) {
        throw new Error('No response from server');
      }
      
      if (result.success) {
        const successMessage = `Success! ${ticketQuantity} ticket(s) purchased.`;
        console.log(successMessage);
        setPurchaseStatus({
          type: 'success',
          message: successMessage
        });
        setShowPurchaseSuccess(true);
        
        // Refresh event data
        console.log('Refreshing event data...');
        const updatedEvent = await getEventById(eventId);
        if (updatedEvent) {
          console.log('Updated event data:', updatedEvent);
          setEvent(updatedEvent);
        }
      } else {
        throw new Error(result.message || 'Failed to complete purchase');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseStatus({
        type: 'error',
        message: error.message || 'An error occurred. Please try again.'
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center bg-gradient-to-b from-space-black to-deep-purple/5">
        <Loader2 className="h-12 w-12 text-tech-blue animate-spin mb-4" />
        <p className="text-holographic-white/70">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center bg-gradient-to-b from-space-black to-deep-purple/5">
        <AlertCircle className="h-16 w-16 text-flame-red mb-4" />
        <h2 className="text-2xl font-bold text-holographic-white mb-2">Event Not Found</h2>
        <p className="text-holographic-white/70 mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Link 
          to="/explore" 
          className="px-6 py-2 bg-tech-blue text-white rounded-lg hover:bg-deep-purple transition-colors flex items-center"
        >
          Browse Events <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-space-black to-deep-purple/5">
      <div className="container mx-auto px-4 py-12">
        <Link 
          to="/explore" 
          className="inline-flex items-center text-tech-blue hover:text-deep-purple transition-colors mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" /> 
          Back to Events
        </Link>
        
        {event && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Event Image */}
              <div className="relative h-64 md:h-[32rem] rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={event.image || '/images/event-placeholder.jpg'} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/event-placeholder.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <div className="inline-block bg-tech-blue/90 text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                    {event.category || 'Event'}
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                    {event.title}
                  </h1>
                  <p className="text-holographic-white/80 flex items-center">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {event.location || 'Location not specified'}
                  </p>
                </div>
              </div>
              
              {/* Event Details */}
              <div className="bg-space-black/50 backdrop-blur-sm border border-deep-purple/20 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-holographic-white/50">Date & Time</h3>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-tech-blue flex-shrink-0" />
                      <div>
                        <p className="text-holographic-white">{eventDate}</p>
                        <p className="text-holographic-white/70 text-sm">{eventTime}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-holographic-white/50">Organizer</h3>
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-tech-blue flex-shrink-0" />
                      <p className="text-holographic-white">{organizerName}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-holographic-white mb-4 flex items-center">
                      <MessageSquare className="h-6 w-6 text-tech-blue mr-2" />
                      About This Event
                    </h2>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-holographic-white/80 leading-relaxed whitespace-pre-line">
                        {event.description || `Join us for an exciting event at ${event.location || 'a great location'} on ${eventDate} at ${eventTime}.
                        
This event promises to be an engaging experience filled with interesting activities, networking opportunities, and valuable insights. Don't miss out on this opportunity to connect with like-minded individuals and expand your knowledge in this field.

For more information, please contact the organizer.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:sticky lg:top-24"
            >
              <div className="bg-space-black/80 backdrop-blur-sm border border-deep-purple/20 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-holographic-white">Ticket Price</h3>
                    <span className="text-2xl font-bold bg-gradient-to-r from-tech-blue to-deep-purple bg-clip-text text-transparent">
                      {ticketPrice}
                    </span>
                  </div>
                  
                   {/* Ticket Availability */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-holographic-white/70">Tickets Available</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-deep-purple/20 text-holographic-white">
                        {event.availableTickets} remaining
                      </span>
                    </div>
                    
                    <div className="w-full bg-deep-purple/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-tech-blue to-deep-purple h-2 rounded-full" 
                        style={{ 
                          width: `${Math.max(10, (event.availableTickets / (event.availableTickets + event.soldTickets || event.availableTickets * 2)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  {event.availableTickets > 0 ? (
                    <>
                      <div className="space-y-3">
                        <label htmlFor="quantity" className="block text-sm font-medium text-holographic-white">
                          Select Quantity
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setTicketQuantity(num)}
                              className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${
                                ticketQuantity === num
                                  ? 'bg-tech-blue/20 border-tech-blue text-holographic-white'
                                  : 'border-deep-purple/30 hover:border-tech-blue/50 text-holographic-white/70 hover:text-holographic-white'
                              }`}
                              disabled={num > event.availableTickets}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-t border-deep-purple/20">
                        <span className="text-sm text-holographic-white/70">Total</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-tech-blue to-deep-purple bg-clip-text text-transparent">
                          {event.price ? formatCurrency(event.price * ticketQuantity) : 'Free'}
                        </span>
                      </div>
                      
                      <AnimatePresence>
                        {purchaseStatus.message && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`p-3 rounded-lg ${
                              purchaseStatus.type === 'error' 
                                ? 'bg-flame-red/10 border border-flame-red/30' 
                                : 'bg-validation-green/10 border border-validation-green/30'
                            }`}
                          >
                            <p className="text-sm flex items-start">
                              {purchaseStatus.type === 'error' ? (
                                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-flame-red" />
                              ) : (
                                <Check className="h-5 w-5 mr-2 flex-shrink-0 text-validation-green" />
                              )}
                              <span className={purchaseStatus.type === 'error' ? 'text-flame-red' : 'text-validation-green'}>
                                {purchaseStatus.message}
                              </span>
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <button
                        onClick={handlePurchase}
                        disabled={loading || isPurchasing || event.availableTickets < 1}
                        className={`w-full bg-gradient-to-r from-tech-blue to-deep-purple text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                          loading || isPurchasing || event.availableTickets < 1 
                            ? 'opacity-70 cursor-not-allowed' 
                            : 'hover:opacity-90 hover:shadow-lg transform hover:-translate-y-0.5'
                        } flex items-center justify-center space-x-2`}
                      >
                        {isPurchasing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Ticket className="h-5 w-5" />
                            <span>
                              {event.availableTickets < 1 
                                ? 'Sold Out' 
                                : `Get Tickets (${event.availableTickets} available)`}
                            </span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="p-4 bg-flame-red/10 border border-flame-red/30 rounded-xl">
                      <p className="text-flame-red flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span className="font-medium">Sold Out</span>
                      </p>
                      <p className="text-flame-red/80 text-sm mt-1 text-center">
                        All tickets have been sold out
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center space-x-2 text-xs text-holographic-white/50">
                    <Shield className="h-4 w-4 text-tech-blue" />
                    <span>Secured by Scantyx blockchain</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      
      {/* Purchase Success Modal */}
      {showPurchaseSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-black bg-opacity-80">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-space-black border border-deep-purple rounded-xl p-6 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-validation-green bg-opacity-20 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-validation-green" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-holographic-white mb-2">
                Ticket Purchased Successfully!
              </h2>
              <p className="text-holographic-white/70 mb-6">
                Your ticket has been added to your account.
              </p>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => navigate('/tickets')}
                  className="w-full px-4 py-2 bg-tech-blue hover:bg-tech-blue/90 text-white rounded-lg transition-colors"
                >
                  View My Tickets
                </button>
                <button
                  onClick={() => setShowPurchaseSuccess(false)}
                  className="w-full px-4 py-2 bg-transparent hover:bg-white/5 text-holographic-white border border-white/10 rounded-lg transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Reviews Section */}
      <section className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-space-black/50 backdrop-blur-sm border border-deep-purple/20 rounded-2xl p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-holographic-white mb-2 flex items-center">
                <MessageSquare className="h-6 w-6 text-tech-blue mr-2" />
                Event Reviews
              </h2>
              <p className="text-holographic-white/70">
                Read what other attendees are saying about this event
              </p>
            </div>
            
            {isAuthenticated ? (
              <button 
                onClick={() => setShowReviewForm(true)}
                className="mt-4 md:mt-0 px-6 py-2.5 bg-gradient-to-r from-tech-blue to-deep-purple text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Write a Review</span>
              </button>
            ) : (
              <div className="mt-4 md:mt-0 text-center">
                <p className="text-holographic-white/70 text-sm mb-2">Sign in to leave a review</p>
                <Link 
                  to="/login" 
                  state={{ from: window.location.pathname }}
                  className="text-tech-blue hover:text-deep-purple text-sm font-medium inline-flex items-center"
                >
                  Sign In <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            )}
          </div>
          
          <div className="border-t border-deep-purple/20 pt-8">
            <ReviewsSection eventId={eventId} />
          </div>
        </motion.div>
      </section>
      
      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="bg-space-black border-deep-purple/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-holographic-white text-2xl flex items-center">
              <MessageSquare className="h-6 w-6 text-tech-blue mr-2" />
              Write a Review
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ReviewsSection eventId={eventId} />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Debug Component - Only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1000,
          fontSize: '12px',
          maxWidth: '300px',
          fontFamily: 'monospace',
          border: '1px solid #4B5563',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#60A5FA' }}>Debug Info:</div>
          <div>Event ID: {eventId || 'N/A'}</div>
          <div>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
          <div>Available Tickets: {event?.availableTickets || 0}</div>
          <div>Selected Qty: {ticketQuantity}</div>
          <div>Purchase Status: {purchaseStatus?.type || 'none'}</div>
          <button 
            onClick={() => {
              console.log('Current event data:', event);
              console.log('User token:', localStorage.getItem('token'));
              console.log('Purchase status:', purchaseStatus);
            }}
            style={{
              marginTop: '8px',
              padding: '3px 6px',
              background: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            Show Debug in Console
          </button>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
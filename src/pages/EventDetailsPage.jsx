import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, User, ArrowLeft, AlertCircle, Check } from 'lucide-react';
import { useEvents } from '../contexts/EventsContext';
import { useAuth } from '../contexts/AuthContext';

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getEventById, purchaseTicket, formatPrice } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [purchaseStatus, setPurchaseStatus] = useState({ type: '', message: '' });
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = getEventById(eventId);
        if (!eventData) {
          navigate('/explore');
          return;
        }
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [eventId, getEventById, navigate]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };
  
  // Format time
  const formatTime = (dateString) => {
    const options = { 
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleTimeString('en-IN', options);
  };
  
  const handlePurchase = () => {
    if (!isAuthenticated) {
      setPurchaseStatus({
        type: 'error',
        message: 'Please sign in to purchase tickets'
      });
      return;
    }
    
    if (event.availableTickets < ticketQuantity) {
      setPurchaseStatus({
        type: 'error',
        message: 'Not enough tickets available'
      });
      return;
    }
    
    const result = purchaseTicket(eventId, ticketQuantity);
    if (result.success) {
      setPurchaseStatus({
        type: 'success',
        message: 'Ticket purchased successfully!'
      });
      setShowPurchaseSuccess(true);
    } else {
      setPurchaseStatus({
        type: 'error',
        message: result.message
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <Link to="/explore" className="inline-flex items-center text-tech-blue hover:text-deep-purple transition-colors mb-8">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Events
        </Link>
        
        {event && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-holographic-white mb-4">{event.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-tech-blue" />
                  <span className="text-holographic-white">{formatDate(event.date)}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-tech-blue" />
                  <span className="text-holographic-white">{formatTime(event.date)}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-tech-blue" />
                  <span className="text-holographic-white">{event.location}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-tech-blue" />
                  <span className="text-holographic-white">Organized by {event.organizer}</span>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-holographic-white mb-4">About This Event</h2>
                <p className="text-holographic-white/80 whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="card sticky top-24">
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-holographic-white">Ticket Price</h3>
                    <span className="text-2xl font-bold text-tech-blue">{formatPrice(event.price)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-tech-blue" />
                    <span className="text-holographic-white">
                      {event.availableTickets} tickets remaining
                    </span>
                  </div>
                  
                  {event.availableTickets > 0 ? (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="quantity" className="block text-sm font-medium text-holographic-white">
                          Quantity
                        </label>
                        <select
                          id="quantity"
                          value={ticketQuantity}
                          onChange={(e) => setTicketQuantity(parseInt(e.target.value, 10))}
                          className="input w-full"
                        >
                          {[...Array(Math.min(10, event.availableTickets)).keys()].map(i => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-holographic-white/70">
                          Total: {formatPrice(event.price * ticketQuantity)}
                        </p>
                      </div>
                      
                      {purchaseStatus.message && (
                        <div className={`p-3 rounded-lg ${
                          purchaseStatus.type === 'error' 
                            ? 'bg-flame-red bg-opacity-20 border border-flame-red' 
                            : 'bg-validation-green bg-opacity-20 border border-validation-green'
                        }`}>
                          <p className="text-holographic-white flex items-start">
                            {purchaseStatus.type === 'error' && (
                              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                            )}
                            {purchaseStatus.message}
                          </p>
                        </div>
                      )}
                      
                      <button
                        onClick={handlePurchase}
                        className="btn btn-primary w-full"
                      >
                        Purchase Ticket
                      </button>
                    </>
                  ) : (
                    <div className="p-3 bg-flame-red bg-opacity-20 border border-flame-red rounded-lg">
                      <p className="text-holographic-white flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Sold Out
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-holographic-white/50 text-center">
                    Secured by Scantyx blockchain technology
                  </p>
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
                Ticket Purchased!
              </h2>
              <p className="text-holographic-white/70">
                Your ticket has been added to your account.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link to="/demo" className="btn btn-primary w-full block text-center">
                View My Tickets
              </Link>
              <button
                onClick={() => setShowPurchaseSuccess(false)}
                className="btn btn-secondary w-full"
              >
                Continue Browsing
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
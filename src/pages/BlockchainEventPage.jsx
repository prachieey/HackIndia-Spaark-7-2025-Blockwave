import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Ticket, ExternalLink, User, Loader2 } from 'lucide-react';
import { useWeb3 } from '../contexts/blockchain/Web3Context';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const BlockchainEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getEventById, 
    buyTicket, 
    getTicketsForEvent, 
    isConnected, 
    connectWallet, 
    account,
    checkTicketValidity
  } = useWeb3();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingTicket, setBuyingTicket] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketCount, setTicketCount] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  
  // Format price from wei to ETH
  const formatPrice = (priceInWei) => {
    if (!priceInWei) return 'Free';
    const priceInEth = ethers.utils.formatEther(priceInWei);
    return `${parseFloat(priceInEth).toFixed(4)} ETH`;
  };
  
  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date not specified';
    const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
    
    const options = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEventById(id);
        
        if (!eventData.exists) {
          toast.error('Event not found');
          navigate('/explore');
          return;
        }
        
        setEvent(eventData);
        
        // Fetch tickets if user is connected
        if (isConnected) {
          const userTickets = await getTicketsForEvent(id);
          setTickets(userTickets);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event data');
        navigate('/explore');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchEvent();
    }
  }, [id, isConnected, getEventById, getTicketsForEvent, navigate]);
  
  // Handle ticket purchase
  const handleBuyTicket = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }
    
    try {
      setBuyingTicket(true);
      
      // Calculate total price
      const totalPrice = ethers.BigNumber.from(event.price).mul(ticketCount);
      
      // Call the smart contract to buy tickets
      const tx = await buyTicket(id, ticketCount, totalPrice);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Refresh tickets
      const updatedTickets = await getTicketsForEvent(id);
      setTickets(updatedTickets);
      
      toast.success(`Successfully purchased ${ticketCount} ticket(s)!`);
    } catch (error) {
      console.error('Error buying ticket:', error);
      toast.error(`Failed to buy ticket: ${error.message}`);
    } finally {
      setBuyingTicket(false);
    }
  };
  
  // Handle ticket validation
  const handleValidateTicket = async (ticketId) => {
    try {
      setIsValidating(true);
      const isValid = await checkTicketValidity(ticketId);
      setValidationResult({ ticketId, isValid });
      
      if (isValid) {
        toast.success('Ticket is valid!');
      } else {
        toast.warning('Ticket is not valid or has been used');
      }
    } catch (error) {
      console.error('Error validating ticket:', error);
      toast.error('Failed to validate ticket');
    } finally {
      setIsValidating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-black">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-deep-purple animate-spin mx-auto mb-4" />
          <p className="text-holographic-white">Loading event details...</p>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-holographic-white mb-4">Event Not Found</h2>
          <p className="text-gray-400 mb-6">The requested event could not be found or may have been removed.</p>
          <Link 
            to="/explore" 
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-deep-purple hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-purple"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-space-black text-holographic-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-neon-blue hover:text-neon-pink transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Events
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden"
            >
              <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <img
                  src={`https://source.unsplash.com/random/1200x800/?event,${id}`}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <h1 className="text-3xl font-bold text-holographic-white mb-2">{event.name}</h1>
                  <p className="text-gray-300">Organized by: 
                    <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded ml-2">
                      {`${event.organizer.substring(0, 6)}...${event.organizer.substring(38)}`}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-deep-purple/20 rounded-lg">
                      <Calendar className="h-5 w-5 text-deep-purple" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Date & Time</h3>
                      <p className="text-holographic-white">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-deep-purple/20 rounded-lg">
                      <MapPin className="h-5 w-5 text-deep-purple" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Location</h3>
                      <p className="text-holographic-white">{event.location || 'Location not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-deep-purple/20 rounded-lg">
                      <Users className="h-5 w-5 text-deep-purple" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Tickets Available</h3>
                      <p className="text-holographic-white">{event.ticketsAvailable.toString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-deep-purple/20 rounded-lg">
                      <Ticket className="h-5 w-5 text-deep-purple" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Price</h3>
                      <p className="text-holographic-white">{formatPrice(event.price)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-lg font-semibold text-holographic-white mb-3">About This Event</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {event.description || 'No description available for this event.'}
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Event Organizer */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-holographic-white mb-4">Event Organizer</h3>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-deep-purple/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-deep-purple" />
                </div>
                <div>
                  <h4 className="font-medium text-holographic-white">
                    {`${event.organizer.substring(0, 6)}...${event.organizer.substring(38)}`}
                  </h4>
                  <p className="text-sm text-gray-400">Blockchain Address</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Ticket Purchase */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sticky top-28"
            >
              <h3 className="text-xl font-bold text-holographic-white mb-6">Get Tickets</h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="ticketCount" className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Tickets
                  </label>
                  <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setTicketCount(prev => Math.max(1, prev - 1))}
                      className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 focus:outline-none"
                      disabled={ticketCount <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="ticketCount"
                      min="1"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 bg-transparent border-0 text-center text-holographic-white focus:ring-0"
                    />
                    <button 
                      onClick={() => setTicketCount(prev => prev + 1)}
                      className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 focus:outline-none"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Price per ticket</span>
                    <span>{formatPrice(event.price)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Quantity</span>
                    <span>{ticketCount}</span>
                  </div>
                  <div className="border-t border-gray-700 my-2"></div>
                  <div className="flex justify-between text-holographic-white font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(ethers.BigNumber.from(event.price).mul(ticketCount))}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleBuyTicket}
                  disabled={buyingTicket}
                  className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors flex items-center justify-center ${
                    buyingTicket
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-deep-purple to-purple-700 hover:from-deep-purple/90 hover:to-purple-700/90'
                  }`}
                >
                  {buyingTicket ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Processing...
                    </>
                  ) : isConnected ? (
                    `Buy ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`
                  ) : (
                    'Connect Wallet to Buy'
                  )}
                </button>
                
                {!isConnected && (
                  <p className="text-sm text-center text-gray-400">
                    Connect your wallet to purchase tickets
                  </p>
                )}
              </div>
            </motion.div>
            
            {/* My Tickets */}
            {tickets.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-holographic-white mb-4">My Tickets</h3>
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket.id.toString()} 
                      className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-holographic-white">Ticket #{ticket.id.toString()}</p>
                          <p className="text-sm text-gray-400">
                            {ticket.used ? 'Used' : 'Valid'}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleValidateTicket(ticket.id)}
                            disabled={isValidating}
                            className="px-3 py-1 text-xs bg-deep-purple/20 text-deep-purple rounded hover:bg-deep-purple/30 transition-colors"
                          >
                            {isValidating && validationResult?.ticketId === ticket.id.toString() ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Validate'
                            )}
                          </button>
                        </div>
                      </div>
                      {validationResult?.ticketId === ticket.id.toString() && (
                        <div className={`mt-2 text-xs p-2 rounded ${
                          validationResult.isValid 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-yellow-900/30 text-yellow-400'
                        }`}>
                          {validationResult.isValid 
                            ? '✓ This ticket is valid and can be used for entry.' 
                            : '⚠ This ticket is not valid or has already been used.'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Event QR Code (placeholder) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-center"
            >
              <div className="h-40 w-40 mx-auto bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <span className="text-gray-600 text-xs">Event QR Code</span>
              </div>
              <p className="text-sm text-gray-400">
                Show this QR code at the event entrance for quick check-in
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainEventPage;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, Clock, Calendar, MapPin, ExternalLink, Loader2, Check, X } from 'lucide-react';
import { useWeb3 } from '../../contexts/blockchain/Web3Context';
import { ethers } from 'ethers';

const BlockchainTickets = () => {
  const { 
    getTicketsForUser, 
    getEventById, 
    isConnected, 
    checkTicketValidity,
    account
  } = useWeb3();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validatingTickets, setValidatingTickets] = useState({});
  const [validationResults, setValidationResults] = useState({});
  
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
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  // Fetch user's tickets
  const fetchTickets = async () => {
    if (!isConnected) return;
    
    try {
      setLoading(true);
      const userTickets = await getTicketsForUser();
      
      // Fetch event details for each ticket
      const ticketsWithDetails = await Promise.all(
        userTickets.map(async (ticket) => {
          try {
            const event = await getEventById(ticket.eventId);
            return {
              ...ticket,
              event: {
                ...event,
                id: ticket.eventId.toString(),
              },
              id: ticket.id.toString(),
            };
          } catch (error) {
            console.error(`Error fetching event ${ticket.eventId}:`, error);
            return {
              ...ticket,
              event: {
                id: ticket.eventId.toString(),
                name: 'Event not found',
                date: 0,
                location: 'Unknown',
                image: 'https://via.placeholder.com/400x225?text=Event+Not+Found'
              },
              id: ticket.id.toString(),
            };
          }
        })
      );
      
      setTickets(ticketsWithDetails);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle ticket validation
  const handleValidateTicket = async (ticketId) => {
    if (!ticketId) return;
    
    try {
      setValidatingTickets(prev => ({ ...prev, [ticketId]: true }));
      const isValid = await checkTicketValidity(ticketId);
      
      setValidationResults(prev => ({
        ...prev,
        [ticketId]: isValid
      }));
      
      // Remove validation result after 5 seconds
      setTimeout(() => {
        setValidationResults(prev => {
          const newResults = { ...prev };
          delete newResults[ticketId];
          return newResults;
        });
      }, 5000);
      
      return isValid;
    } catch (error) {
      console.error('Error validating ticket:', error);
      return false;
    } finally {
      setValidatingTickets(prev => ({
        ...prev,
        [ticketId]: false
      }));
    }
  };
  
  // Fetch tickets when connected
  useEffect(() => {
    if (isConnected) {
      fetchTickets();
    }
  }, [isConnected]);
  
  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-900/50 p-6 rounded-xl inline-block">
          <h3 className="text-lg font-medium text-gray-300 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400">Please connect your wallet to view your blockchain tickets</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-purple"></div>
      </div>
    );
  }
  
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <Ticket className="h-10 w-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-medium text-holographic-white mb-2">No Tickets Found</h3>
          <p className="text-gray-400 mb-6">You don't have any tickets on the blockchain yet.</p>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-holographic-white">My Blockchain Tickets</h2>
          <p className="text-gray-400">Your event tickets stored on the blockchain</p>
        </div>
        <div className="text-sm text-gray-400">
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {tickets.map((ticket) => (
          <motion.div 
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden"
          >
            <div className="md:flex">
              <div className="md:w-1/3 h-48 md:h-auto bg-gray-800 overflow-hidden">
                <img 
                  src={ticket.event?.image || `https://source.unsplash.com/random/600x400/?event,${ticket.eventId}`} 
                  alt={ticket.event?.name || 'Event'} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6 flex-1">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-holographic-white mb-1">
                          {ticket.event?.name || 'Unknown Event'}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          Ticket ID: <span className="font-mono">{ticket.id}</span>
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleValidateTicket(ticket.id)}
                          disabled={validatingTickets[ticket.id]}
                          className={`px-3 py-1.5 text-xs rounded-full flex items-center ${
                            validatingTickets[ticket.id]
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : 'bg-deep-purple/20 text-deep-purple hover:bg-deep-purple/30'
                          }`}
                        >
                          {validatingTickets[ticket.id] ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Validating...
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Validate
                            </>
                          )}
                        </button>
                        
                        <Link
                          to={`/events/blockchain/${ticket.eventId}`}
                          className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full flex items-center"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Event
                        </Link>
                      </div>
                    </div>
                    
                    {validationResults[ticket.id] !== undefined && (
                      <div className={`mt-3 p-2 rounded text-sm ${
                        validationResults[ticket.id]
                          ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                          : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50'
                      }`}>
                        {validationResults[ticket.id] ? (
                          <div className="flex items-center">
                            <Check className="h-4 w-4 mr-2" />
                            <span>This ticket is valid and can be used for entry.</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <X className="h-4 w-4 mr-2" />
                            <span>This ticket is not valid or has already been used.</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-1.5 bg-deep-purple/20 rounded-lg">
                          <Calendar className="h-4 w-4 text-deep-purple" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Event Date</p>
                          <p className="text-sm text-holographic-white">
                            {ticket.event?.date ? formatDate(ticket.event.date) : 'Not specified'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="p-1.5 bg-deep-purple/20 rounded-lg">
                          <MapPin className="h-4 w-4 text-deep-purple" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Location</p>
                          <p className="text-sm text-holographic-white">
                            {ticket.event?.location || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="p-1.5 bg-deep-purple/20 rounded-lg">
                          <Ticket className="h-4 w-4 text-deep-purple" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Ticket Price</p>
                          <p className="text-sm text-holographic-white">
                            {ticket.event?.price ? formatPrice(ticket.event.price) : 'Free'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="p-1.5 bg-deep-purple/20 rounded-lg">
                          <Clock className="h-4 w-4 text-deep-purple" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Status</p>
                          <div className="flex items-center">
                            <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                              ticket.used ? 'bg-red-500' : 'bg-green-500'
                            }`}></span>
                            <span className="text-sm text-holographic-white">
                              {ticket.used ? 'Used' : 'Valid'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-800">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-gray-400 mb-1">Ticket Owner</p>
                        <p className="text-sm font-mono text-gray-300 truncate">
                          {account}
                        </p>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(ticket.id);
                            toast.success('Ticket ID copied to clipboard');
                          }}
                          className="px-4 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                        >
                          Copy Ticket ID
                        </button>
                        
                        <Link
                          to={`/events/blockchain/${ticket.eventId}?ticket=${ticket.id}`}
                          className="px-4 py-2 text-xs bg-deep-purple hover:bg-purple-700 text-white rounded-lg transition-colors text-center"
                        >
                          View Ticket
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainTickets;

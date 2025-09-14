import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Loader2, AlertCircle, Wallet } from 'lucide-react';
import { useWeb3 } from '../../contexts/blockchain/Web3Context';
import EventCard from './EventCard';
import { toast } from 'react-toastify';

// Animation variants for framer-motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const BlockchainEvents = () => {
  const { 
    getAllEvents, 
    isConnected, 
    connectWallet, 
    loading: web3Loading,
    error: web3Error 
  } = useWeb3();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch events from blockchain
  const fetchEvents = useCallback(async () => {
    if (!isConnected) {
      setError('Please connect your wallet to view blockchain events');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching blockchain events...');
      const blockchainEvents = await getAllEvents();
      console.log('Received events:', blockchainEvents);
      
      if (!blockchainEvents || blockchainEvents.length === 0) {
        setEvents([]);
        setError('No events found on the blockchain');
        return;
      }
      
      // Transform blockchain event data to match the expected format
      const formattedEvents = blockchainEvents
        .filter(event => event && event.exists)
        .map(event => ({
          id: event.id.toString(),
          title: event.name || 'Unnamed Event',
          description: event.description || `Event at ${event.location || 'unknown location'}`,
          date: event.date || '0',
          location: event.location || 'Location not specified',
          price: event.price || '0',
          availableTickets: event.ticketsAvailable || '0',
          ticketsSold: event.ticketsSold || '0',
          organizer: event.organizer || '0x000...0000',
          image: `https://source.unsplash.com/random/600x400/?event,${event.id || '1'}`,
          category: 'Blockchain',
          isBlockchain: true
        }));
      
      console.log('Formatted events:', formattedEvents);
      setEvents(formattedEvents);
      
      if (formattedEvents.length === 0) {
        setError('No valid events found on the blockchain');
      }
      
    } catch (err) {
      console.error('Error in fetchEvents:', {
        error: err,
        message: err.message,
        stack: err.stack
      });
      
      let errorMessage = 'Failed to load events from the blockchain';
      if (err.message.includes('Wallet not connected')) {
        errorMessage = 'Please connect your wallet to view events';
      } else if (err.message.includes('Contract not initialized')) {
        errorMessage = 'Blockchain contract not initialized. Please try refreshing the page.';
      } else if (err.message.includes('revert')) {
        errorMessage = 'Transaction was reverted by the blockchain';
      } else if (err.message.includes('user rejected')) {
        errorMessage = 'You rejected the transaction';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAllEvents, isConnected]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
  };

  // Initial data fetch
  useEffect(() => {
    if (isConnected) {
      fetchEvents();
    }
  }, [isConnected, fetchEvents]);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Error connecting wallet:', err);
      toast.error('Failed to connect wallet');
    }
  };

  // Filter events based on search term and category
  const filteredEvents = events.filter(event => {
    if (!event) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchLower) ||
      event.description?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower);
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      event.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Sort events by date (newest first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return parseInt(b.date) - parseInt(a.date);
  });

  // Render wallet connection prompt
  if (!isConnected) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="max-w-md mx-auto bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-deep-purple/20 flex items-center justify-center">
            <Wallet className="h-8 w-8 text-deep-purple" />
          </div>
          <h3 className="text-xl font-bold text-holographic-white mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400 mb-6">Connect your wallet to view and interact with blockchain events</p>
          <button
            onClick={handleConnectWallet}
            disabled={web3Loading}
            className={`px-6 py-3 rounded-xl font-medium flex items-center justify-center mx-auto ${
              web3Loading 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-deep-purple hover:bg-purple-700 text-white'
            } transition-colors`}
          >
            {web3Loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Connecting...
              </>
            ) : (
              'Connect Wallet'
            )}
          </button>
          {web3Error && (
            <p className="mt-4 text-sm text-red-400">{web3Error}</p>
          )}
        </div>
      </motion.div>
    );
  }

  // Render loading state
  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-deep-purple/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-deep-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-400">Loading blockchain events...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="max-w-md mx-auto bg-red-900/20 border border-red-800/50 rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Events</h3>
          <p className="text-red-300/80 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${
                refreshing 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-red-900/50 hover:bg-red-900/70 text-white'
              } transition-colors`}
            >
              {refreshing ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Refreshing...
                </>
              ) : (
                'Try Again'
              )}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Categories for filtering
  const categories = ['All', 'Blockchain', 'Music', 'Art', 'Technology'];

  // Render events grid
  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-holographic-white">Blockchain Events</h2>
          <p className="text-gray-400">
            {events.length > 0 
              ? `Showing ${sortedEvents.length} of ${events.length} events` 
              : 'No events found'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-deep-purple/50 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="relative flex-shrink-0">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value.toLowerCase())}
              className="pl-10 pr-8 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-deep-purple/50 focus:border-transparent appearance-none transition-all"
            >
              {categories.map(category => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`px-4 py-2.5 rounded-xl font-medium flex items-center justify-center ${
              refreshing 
                ? 'bg-gray-800 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            } transition-colors`}
            title="Refresh events"
          >
            {refreshing ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <AnimatePresence>
        {sortedEvents.length === 0 ? (
          <motion.div 
            className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-800/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-holographic-white mb-1">No events found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'There are no events on the blockchain yet'}
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg font-medium transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            <AnimatePresence>
              {sortedEvents.map((event) => (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <EventCard event={event} isBlockchain={true} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BlockchainEvents;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Ticket, AlertCircle } from 'lucide-react';
import { useEvents } from '../../contexts/EventsContext';
import QRTicket from '../../components/tickets/QRTicket';
import BlockchainTickets from '../../components/events/BlockchainTickets';
import { useWeb3 } from '../../contexts/blockchain/Web3Context';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserTicketsPage = () => {
  // Use local state for tickets to ensure we can show mock data
  const [localTickets, setLocalTickets] = useState([]);
  const { userTickets = [], fetchUserTickets, loading, error } = useEvents();
  const { isConnected } = useWeb3();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('regular'); // 'regular' or 'blockchain'

  // Mock tickets data for testing (prices in INR)
  const mockTickets = [
    {
      _id: 'mock1',
      id: 'mock1',
      eventId: 'event1',
      eventTitle: 'Tech Conference 2025',
      type: 'VIP',
      price: 7499, // ₹7,499
      purchaseDate: new Date().toISOString(),
      isUsed: false,
      qrData: 'mock-ticket-1',
      event: {
        title: 'Tech Conference 2025',
        date: '2025-10-15T09:00:00.000Z',
        location: 'Convention Center, Mumbai',
        image: 'https://source.unsplash.com/random/800x600/?conference',
        currency: 'INR'
      }
    },
    {
      _id: 'mock2',
      id: 'mock2',
      eventId: 'event2',
      eventTitle: 'Summer Music Festival',
      type: 'General Admission',
      price: 2499, // ₹2,499
      purchaseDate: new Date().toISOString(),
      isUsed: false,
      qrData: 'mock-ticket-2',
      event: {
        title: 'Summer Music Festival',
        date: '2025-07-20T12:00:00.000Z',
        location: 'Lalbagh Botanical Garden, Bangalore',
        image: 'https://source.unsplash.com/random/800x600/?music-festival',
        currency: 'INR'
      }
    },
    {
      _id: 'mock3',
      id: 'mock3',
      eventId: 'event3',
      eventTitle: 'Blockchain Workshop',
      type: 'Workshop Pass',
      price: 4999, // ₹4,999
      purchaseDate: new Date().toISOString(),
      isUsed: false,
      qrData: 'mock-ticket-3',
      event: {
        title: 'Blockchain Summit 2025',
        date: '2025-11-10T10:00:00.000Z',
        location: 'Hyderabad International Convention Center',
        image: 'https://source.unsplash.com/random/800x600/?blockchain',
        currency: 'INR'
      }
    },
    {
      _id: 'mock4',
      id: 'mock4',
      eventId: 'event4',
      eventTitle: 'Startup Pitch Competition 2025',
      type: 'Early Bird',
      price: 1499, // ₹1,499
      purchaseDate: new Date().toISOString(),
      isUsed: false,
      isForSale: true,
      resalePrice: 1999, // ₹1,999
      qrData: 'mock-ticket-4',
      event: {
        title: 'Startup Pitch Competition 2025',
        date: '2025-12-05T13:00:00.000Z',
        location: 'Taj Lands End, Mumbai',
        description: 'Annual startup pitch competition with top investors',
        image: 'https://source.unsplash.com/random/800x600/?startup',
        category: 'Business',
        availableTickets: 150,
        totalTickets: 500,
        currency: 'INR'
      }
    }
  ];

  // Use mock data directly without API calls
  useEffect(() => {
    console.log('Using mock tickets data');
    setLocalTickets(mockTickets);
    setIsLoading(false);
    
    // Optional: Still try to fetch real tickets in the background
    // but don't wait for it or show loading states
    if (fetchUserTickets) {
      fetchUserTickets()
        .then(() => {
          if (userTickets && userTickets.length > 0) {
            console.log('Fetched real tickets in background');
            setLocalTickets(userTickets);
          }
        })
        .catch(err => {
          console.log('Background fetch failed, continuing with mock data');
        });
    }
  }, []);

  // Use localTickets instead of userTickets for filtering
  const filteredTickets = React.useMemo(() => {
    return (localTickets || []).filter(ticket => {
      const eventTitle = ticket.eventTitle || ticket.event?.title || 'Untitled Event';
      const matchesSearch = eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'used' && ticket.isUsed) ||
        (filterStatus === 'unused' && !ticket.isUsed) ||
        (filterStatus === 'forSale' && ticket.isForSale);
      return matchesSearch && matchesStatus;
    });
  }, [localTickets, searchTerm, filterStatus]);
  
  // Log the tickets for debugging
  useEffect(() => {
    console.log('Current tickets:', localTickets);
    console.log('Filtered tickets:', filteredTickets);
  }, [localTickets, filteredTickets]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-holographic-white">My Tickets</h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('regular')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'regular' 
                ? 'border-b-2 border-deep-purple text-holographic-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Regular Tickets
          </button>
          
          <button
            onClick={() => setActiveTab('blockchain')}
            disabled={!isConnected}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'blockchain'
                ? 'border-b-2 border-deep-purple text-holographic-white'
                : 'text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            title={!isConnected ? "Connect your wallet to view blockchain tickets" : ""}
          >
            <Ticket className="h-4 w-4" />
            Blockchain Tickets
          </button>
        </div>
      </div>

      {activeTab === 'regular' ? (
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tech-blue w-5 h-5" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">All Tickets</option>
              <option value="unused">Unused</option>
              <option value="used">Used</option>
              <option value="forSale">For Sale</option>
            </select>
          </div>
          {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-holographic-blue"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => {
              // Ensure the ticket has all required fields
              const fullTicket = {
                ...ticket,
                id: ticket.id || ticket._id, // Ensure id is always defined
                eventTitle: ticket.eventTitle || ticket.event?.title || 'Untitled Event',
                purchaseDate: ticket.purchaseDate || new Date().toISOString(),
                isUsed: ticket.isUsed || false,
                qrData: ticket.qrData || `ticket-${ticket.id || ticket._id}`,
                event: {
                  title: ticket.eventTitle || ticket.event?.title || 'Untitled Event',
                  date: ticket.event?.date || new Date().toISOString(),
                  location: ticket.event?.location || 'Location not specified',
                  image: ticket.event?.image || 'https://source.unsplash.com/random/800x600/?event',
                  ...ticket.event
                },
                ...ticket
              };
              
              return (
                <QRTicket 
                  key={fullTicket.id || fullTicket._id} 
                  ticket={fullTicket} 
                  onUpdate={() => {
                    // Try to refresh tickets, but fall back to mock data if it fails
                    fetchUserTickets().catch(() => setLocalTickets(mockTickets));
                  }}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Ticket className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-200">No tickets found</h3>
                <p className="text-gray-400 max-w-md">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'No tickets match your search criteria. Try adjusting your filters.'
                    : 'You haven\'t purchased any tickets yet. Explore events to get started!'}
                </p>
                {(!searchTerm && filterStatus === 'all') && (
                  <button
                    onClick={() => navigate('/explore')}
                    className="mt-4 px-6 py-2 bg-holographic-blue text-white rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Explore Events
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
        </>
      ) : (
        <div className="mt-6">
          <BlockchainTickets />
        </div>
      )}

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold text-holographic-white mb-2">No tickets found</h3>
          <p className="text-holographic-white/70">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default UserTicketsPage;
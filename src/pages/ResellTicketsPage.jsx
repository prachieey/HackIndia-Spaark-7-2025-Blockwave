
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, FilterX, ArrowUpDown, Ticket, Calendar, MapPin, Clock, DollarSign, Percent, Heart, AlertTriangle, ShoppingCart, Star, Eye, TrendingUp, TrendingDown, Check, Loader2, Share2, BadgeCheck, ShieldCheck, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '../components/ui/pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventsContext';
import { cn } from '../lib/utils';

// Utility to calculate time left
const calculateTimeLeft = (date) => {
  const difference = new Date(date) - new Date();
  if (difference <= 0) return 'Event started';
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  const seconds = Math.floor((difference / 1000) % 60);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m ${seconds}s`;
};

// Utility to calculate time since posted
const calculateTimeSincePosted = (listedOn) => {
  const difference = new Date() - new Date(listedOn);
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  return hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ago` : 'Just now';
};

// Mock data with additional fields
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
  {
    id: 2,
    eventId: 'tech-summit-2026',
    eventName: 'Tech Summit 2026',
    eventDate: '2026-03-10T09:00:00+05:30',
    eventLocation: 'Expo Center, Bangalore',
    ticketType: 'Early Bird',
    originalPrice: 3000,
    resellPrice: 2700,
    discount: 10,
    seller: 'Alice S.',
    sellerRating: 4.9,
    sellerVerified: true,
    isVerified: true,
    listedOn: '2025-11-15T10:00:00+05:30',
    image: 'https://images.unsplash.com/photo-1524178231561-6e9af79a00d0?auto=format&fit=crop&w=1470&q=80',
    description: 'Early bird ticket for Tech Summit 2026. Includes networking sessions and workshops.',
    views: 320,
    favorites: 78,
    sold: 15,
    quantity: 3,
    isWatched: false,
    isFavorite: false,
    category: 'Summit',
    priceTrend: 'decreasing',
    city: 'Bangalore'
  },
  {
    id: 3,
    eventId: 'food-fest-2026',
    eventName: 'Food Festival 2026',
    eventDate: '2026-05-20T11:00:00+05:30',
    eventLocation: 'Park, Chennai',
    ticketType: 'Group (4 tickets)',
    originalPrice: 1000,
    resellPrice: 800,
    discount: 20,
    seller: 'Sarah L.',
    sellerRating: 5.0,
    sellerVerified: true,
    isVerified: true,
    listedOn: '2025-12-01T09:30:00+05:30',
    image: 'https://images.unsplash.com/photo-1565688530519-87a737f0cce0?auto=format&fit=crop&w=1470&q=80',
    description: 'Group tickets for Food Festival 2026. Price per ticket. Perfect for a fun day out!',
    views: 150,
    favorites: 35,
    sold: 8,
    quantity: 0,
    isWatched: false,
    isFavorite: false,
    category: 'Festival',
    priceTrend: 'increasing',
    city: 'Chennai'
  },
  {
    id: 4,
    eventId: 'art-expo-2026',
    eventName: 'Art Exhibition 2026',
    eventDate: '2026-04-15T10:00:00+05:30',
    eventLocation: 'Gallery, Kolkata',
    ticketType: 'General',
    originalPrice: 500,
    resellPrice: 400,
    discount: 20,
    seller: 'David K.',
    sellerRating: 4.6,
    sellerVerified: true,
    isVerified: true,
    listedOn: '2025-11-20T16:15:00+05:30',
    image: 'https://images.unsplash.com/photo-1540575467063-3a4b7228d9b3?auto=format&fit=crop&w=1470&q=80',
    description: 'General admission ticket for Art Exhibition 2026. Includes guided tour.',
    views: 210,
    favorites: 48,
    sold: 5,
    quantity: 1,
    isWatched: false,
    isFavorite: false,
    category: 'Exhibition',
    priceTrend: 'stable',
    city: 'Kolkata'
  },
  {
    id: 5,
    eventId: 'rock-concert-2026',
    eventName: 'Rock Concert 2026',
    eventDate: '2026-06-25T20:00:00+05:30',
    eventLocation: 'Stadium, Delhi',
    ticketType: 'General Admission',
    originalPrice: 2000,
    resellPrice: 1800,
    discount: 10,
    seller: 'Mike T.',
    sellerRating: 4.7,
    sellerVerified: false,
    isVerified: false,
    listedOn: '2025-12-10T15:45:00+05:30',
    image: 'https://images.unsplash.com/photo-1493225455756-09d248c804ee?auto=format&fit=crop&w=1470&q=80',
    description: 'Extra ticket for Rock Concert 2026. Great view from general area.',
    views: 280,
    favorites: 62,
    sold: 12,
    quantity: 4,
    isWatched: false,
    isFavorite: false,
    category: 'Concert',
    priceTrend: 'increasing',
    city: 'Delhi'
  }
];

const categories = ['All', 'Concert', 'Music Festival', 'Festival', 'Summit', 'Exhibition', 'Sports', 'Theater', 'Workshop'];
const cities = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];

const ResellTicketsPage = ({ initialFilters = {} }) => {
  const { isAuthenticated, user } = useAuth();
  const { purchaseResellTicket = () => Promise.resolve(true), verifyTicket = () => Promise.resolve(true) } = useEvents();
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
  const [searchSuggestions, setSearchSuggestions] = useState([]);

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

  // Load recently viewed tickets
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentlyViewedTickets') || '[]');
      if (Array.isArray(stored)) {
        setRecentlyViewed(stored);
      }
    } catch (error) {
      console.error('Failed to load recently viewed tickets:', error);
    }
  }, []);

  // Update countdown timers
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets(prev => prev.map(ticket => ({
        ...ticket,
        timeLeft: new Date(ticket.eventDate) - new Date() < 24 * 60 * 60 * 1000
          ? calculateTimeLeft(ticket.eventDate)
          : ticket.timeLeft
      })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update search suggestions
  useEffect(() => {
    if (searchTerm.trim()) {
      const suggestions = [...new Set(
        tickets
          .filter(t => t.eventName.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(t => t.eventName)
          .slice(0, 5)
      )];
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchTerm, tickets]);

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

  // Calculate statistics
  const stats = useMemo(() => ({
    totalListings: filteredTickets.length,
    averageDiscount: Math.round(filteredTickets.reduce((sum, ticket) => sum + ticket.discount, 0) / (filteredTickets.length || 1)) || 0,
    totalSavings: filteredTickets.reduce((sum, ticket) => sum + (ticket.originalPrice - ticket.resellPrice), 0)
  }), [filteredTickets]);

  // Handle favorite toggle
  const toggleFavorite = useCallback((id) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === id ? { ...ticket, isFavorite: !ticket.isFavorite } : ticket
    ));
  }, []);

  // Handle watch toggle
  const toggleWatch = useCallback((id) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === id ? { ...ticket, isWatched: !ticket.isWatched } : ticket
    ));
  }, []);

  // Handle compare toggle
  const toggleCompare = useCallback((ticket) => {
    setCompareTickets(prev => {
      if (prev.some(t => t.id === ticket.id)) {
        return prev.filter(t => t.id !== ticket.id);
      }
      return [...prev, ticket].slice(0, 3);
    });
  }, []);

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
      updateRecentlyViewed(ticket);
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

  // Handle report
  const handleReport = useCallback(() => {
    if (!selectedTicket) {
      setStatus({ type: 'error', message: 'No ticket selected.' });
      return;
    }
    if (!reportReason.trim()) {
      setStatus({ type: 'error', message: 'Please provide a reason for reporting.' });
      return;
    }
    console.log(`Reporting ticket ${selectedTicket.id} for reason: ${reportReason}`);
    setStatus({ type: 'success', message: 'Report submitted successfully.' });
    setShowReportModal(false);
    setReportReason('');
  }, [selectedTicket, reportReason]);

  // Handle offer
  const handleMakeOffer = useCallback(() => {
    if (!selectedTicket) {
      setStatus({ type: 'error', message: 'No ticket selected.' });
      return;
    }
    const amount = parseFloat(offerAmount);
    if (!amount || amount <= 0 || isNaN(amount)) {
      setStatus({ type: 'error', message: 'Please enter a valid offer amount.' });
      return;
    }
    console.log(`Offer of ₹${amount} made for ticket ${selectedTicket.id}`);
    setStatus({ type: 'success', message: 'Offer sent to seller!' });
    setShowOfferModal(false);
    setOfferAmount('');
  }, [selectedTicket, offerAmount]);

  // Handle share
  const handleShare = useCallback((ticket) => {
    const url = `${window.location.origin}/events/${ticket.eventId}`;
    if (navigator.share) {
      navigator.share({
        title: ticket.eventName,
        text: `Check out this ${ticket.ticketType} ticket for ${ticket.eventName} on sale!`,
        url
      }).catch(() => {
        navigator.clipboard.writeText(url);
        setStatus({ type: 'success', message: 'Link copied to clipboard!' });
      });
    } else {
      navigator.clipboard.writeText(url);
      setStatus({ type: 'success', message: 'Link copied to clipboard!' });
    }
  }, []);

  // Update recently viewed
  const updateRecentlyViewed = useCallback((ticket) => {
    setRecentlyViewed(prev => {
      const updated = [
        { id: ticket.id, eventName: ticket.eventName, image: ticket.image, eventId: ticket.eventId, ticketType: ticket.ticketType },
        ...prev.filter(item => item.id !== ticket.id)
      ].slice(0, 5);
      try {
        localStorage.setItem('recentlyViewedTickets', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recently viewed tickets:', error);
      }
      return updated;
    });
  }, []);

  // Handle image error
  const handleImageError = useCallback((id) => {
    setFailedImages(prev => new Set(prev).add(id));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mb-4 shadow-sm">
            Premium Resale Marketplace
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Find Verified Resale Tickets
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Secure the best seats at the best prices. Every ticket is verified for your peace of mind.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Ticket, title: 'Available Listings', value: stats.totalListings, desc: 'Active tickets available now', color: 'blue' },
            { icon: Percent, title: 'Average Discount', value: `${stats.averageDiscount}%`, desc: 'Below face value', color: 'green' },
            { icon: DollarSign, title: 'Total Savings', value: `₹${stats.totalSavings.toLocaleString('en-IN')}`, desc: 'Saved by our customers', color: 'amber' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative">
                <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-50 to-white opacity-50`}></div>
                <CardHeader className="relative z-10 pb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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

        {/* Search and Sort Bar */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search events, tickets, or sellers..."
                className="pl-10 h-12 text-base border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.replace(/[<>"'&]/g, ''))}
                aria-label="Search tickets"
              />
              {searchSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                      onClick={() => setSearchTerm(suggestion)}
                      role="option"
                      aria-label={`Select ${suggestion}`}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] h-12 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" aria-label="Sort tickets">
                  <ArrowUpDown className="mr-2 h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="border-gray-200 shadow-lg rounded-xl">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="discount-desc">Best Discount</SelectItem>
                  <SelectItem value="views-desc">Most Viewed</SelectItem>
                  <SelectItem value="rating-desc">Seller Rating</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="lg:hidden h-12 px-4 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                onClick={() => setShowFilters(!showFilters)}
                aria-label={showFilters ? 'Hide filters' : 'Show filters'}
              >
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">Filters</span>
              </Button>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto bg-gray-100 p-1 rounded-lg">
              {['all', 'vip', 'general', 'early-bird', 'group'].map(tab => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-700"
                  aria-label={`${tab === 'all' ? 'All' : tab.replace('-', ' ')} tickets`}
                >
                  {tab === 'all' ? 'All' : tab.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {(showFilters || isLargeScreen) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="lg:w-1/4"
              >
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold flex items-center text-gray-900">
                      <Filter className="h-5 w-5 mr-2.5 text-blue-600" />
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Filters
                      </span>
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center"
                      onClick={() => {
                        setSearchTerm('');
                        setSortBy('newest');
                        setActiveTab('all');
                        setPriceRange([0, 10000]);
                        setSelectedCategories([]);
                        setSelectedCity('All');
                        setCurrentPage(1);
                        setShowFilters(false);
                      }}
                      aria-label="Reset all filters"
                    >
                      <FilterX className="h-3.5 w-3.5 mr-1.5" />
                      Reset All
                    </Button>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-gray-800">Price Range</Label>
                      <div className="px-1">
                        <Slider
                          value={priceRange}
                          onValueChange={value => {
                            setPriceRange(value);
                            setShowFilters(false);
                          }}
                          min={0}
                          max={10000}
                          step={100}
                          minStepsBetweenThumbs={1}
                          className="py-3 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span[data-orientation=horizontal]]:h-1.5"
                          aria-label="Price range slider"
                        />
                      </div>
                      <div className="flex justify-between text-sm font-medium text-gray-600">
                        <span>₹0</span>
                        <span>₹10,000</span>
                      </div>
                      <div className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100 text-center">
                        ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold block text-gray-800">Categories</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
                        {categories.map(category => (
                          <div key={category} className="flex items-center">
                            <Checkbox
                              id={`cat-${category}`}
                              checked={selectedCategories.includes(category) || (category === 'All' && selectedCategories.length === 0)}
                              onCheckedChange={checked => {
                                if (category === 'All') {
                                  setSelectedCategories([]);
                                } else if (checked) {
                                  setSelectedCategories(prev => [...prev.filter(c => c !== 'All'), category]);
                                } else {
                                  setSelectedCategories(prev => prev.filter(c => c !== category));
                                }
                                setShowFilters(false);
                              }}
                              aria-label={`Select ${category} category`}
                            />
                            <Label htmlFor={`cat-${category}`} className="ml-2 text-sm font-medium text-gray-600">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold block text-gray-800">City</Label>
                      <Select value={selectedCity} onValueChange={value => { setSelectedCity(value); setShowFilters(false); }}>
                        <SelectTrigger className="w-full h-10 border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" aria-label="Select city">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent className="border-gray-200 shadow-lg rounded-xl">
                          {cities.map(city => (
                            <SelectItem key={city} value={city} className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50">
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <Label className="text-sm font-semibold block text-gray-800">Tickets per Page</Label>
                      <Select value={ticketsPerPage.toString()} onValueChange={value => { setTicketsPerPage(Number(value)); setCurrentPage(1); setShowFilters(false); }}>
                        <SelectTrigger className="w-full h-10 border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" aria-label="Tickets per page">
                          <SelectValue placeholder="Tickets per page" />
                        </SelectTrigger>
                        <SelectContent className="border-gray-200 shadow-lg rounded-xl">
                          {[6, 9, 12, 15, 24].map(num => (
                            <SelectItem key={num} value={num.toString()} className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50">
                              Show {num} per page
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Compare Button */}
            {compareTickets.length > 0 && (
              <div className="mb-6 flex justify-end">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowCompareModal(true)}
                  aria-label={`Compare ${compareTickets.length} selected tickets`}
                >
                  Compare {compareTickets.length} Ticket{compareTickets.length > 1 ? 's' : ''}
                </Button>
              </div>
            )}

            {/* Recently Viewed Section */}
            {recentlyViewed.length > 0 && (
              <div className="mb-12 relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
                  <Button variant="ghost" size="sm" className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg px-3 py-1.5">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {recentlyViewed
                    .filter(item => tickets.find(t => t.id === item.id)?.quantity > 0)
                    .map(item => (
                      <motion.div key={item.id} whileHover={{ y: -5 }} className="group">
                        <Card className="overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300 h-full flex flex-col bg-white/90 backdrop-blur-sm">
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={failedImages.has(item.id) ? 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80' : item.image}
                              alt={item.eventName}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={() => handleImageError(item.id)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                              <div className="flex justify-between items-start">
                                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white shadow-md">
                                  {Math.round(tickets.find(t => t.id === item.id)?.discount || 15)}% OFF
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-gray-800 hover:text-red-500 transition-colors"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleFavorite(item.id);
                                  }}
                                  aria-label={tickets.find(t => t.id === item.id)?.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                  <Heart
                                    className={cn(
                                      'h-4 w-4 transition-all',
                                      tickets.find(t => t.id === item.id)?.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-800 group-hover:text-red-500'
                                    )}
                                  />
                                </Button>
                              </div>
                              <div className="text-white">
                                <p className="text-sm font-medium">{item.eventLocation?.split(',')[0] || 'Location'}</p>
                                <p className="text-xs opacity-90">{item.eventDate ? new Date(item.eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Date'}</p>
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-4 flex-1 flex flex-col">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight">{item.eventName}</h3>
                              <div className="flex items-center text-sm text-gray-600 mb-3">
                                <Ticket className="h-4 w-4 mr-1.5 text-gray-500" />
                                <span>{item.ticketType || 'Standard'}</span>
                              </div>
                            </div>
                            <Button
                              asChild
                              variant="default"
                              size="sm"
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <Link
                                to={`/events/${item.eventId}`}
                                onClick={() => updateRecentlyViewed(tickets.find(t => t.id === item.id) || item)}
                                aria-label={`View ${item.eventName} event`}
                              >
                                <span>View Event</span>
                                <ChevronRight className="h-4 w-4 ml-1.5" />
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}

            {/* Ticket Listings */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-96 animate-pulse bg-gray-100">
                    <div className="h-40 bg-gray-200"></div>
                    <CardContent className="p-5 space-y-4">
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentTickets.map(ticket => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.015 }}
                  >
                    <Card
                      className="h-full flex flex-col overflow-hidden group transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:shadow-xl relative bg-white/90 backdrop-blur-sm"
                      onClick={() => updateRecentlyViewed(ticket)}
                      role="article"
                      aria-label={`Ticket for ${ticket.eventName}`}
                    >
                      {ticket.ticketType === 'VIP' && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-bold px-3 py-1 transform rotate-45 translate-x-1/3 translate-y-1/2 w-32 text-center shadow-md">
                            PREMIUM
                          </div>
                        </div>
                      )}
                      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                        <img
                          src={failedImages.has(ticket.id) ? 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80' : ticket.image}
                          alt={ticket.eventName}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={() => handleImageError(ticket.id)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 border-0 shadow-md hover:bg-white transition-colors">
                                <MapPin className="h-3 w-3 mr-1 text-blue-600" />
                                {ticket.eventLocation.split(',')[0]}
                              </Badge>
                              <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 border-0 shadow-md hover:bg-white transition-colors">
                                <Calendar className="h-3 w-3 mr-1 text-purple-600" />
                                {new Date(ticket.eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                              </Badge>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 text-white shadow-md text-xs px-2.5 py-1">
                                {Math.round(ticket.discount)}% OFF
                              </Badge>
                              {ticket.ticketType === 'VIP' && (
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white shadow-md text-xs px-2.5 py-1">
                                  VIP Access
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-md group/btn transition-all duration-200 hover:scale-110"
                                  onClick={(e) => { e.stopPropagation(); toggleFavorite(ticket.id); }}
                                  aria-label={ticket.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                  <Heart
                                    className={cn(
                                      'h-4 w-4 transition-all duration-300 group-hover/btn:scale-110',
                                      ticket.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700 group-hover/btn:text-red-500'
                                    )}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-gray-900 text-white text-xs">
                                {ticket.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-md group/btn transition-all duration-200 hover:scale-110"
                                  onClick={(e) => { e.stopPropagation(); toggleWatch(ticket.id); }}
                                  aria-label={ticket.isWatched ? 'Unwatch price' : 'Watch price changes'}
                                >
                                  <Eye
                                    className={cn(
                                      'h-4 w-4 transition-colors duration-300 group-hover/btn:scale-110',
                                      ticket.isWatched ? 'text-blue-500' : 'text-gray-700 group-hover/btn:text-blue-500'
                                    )}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-gray-900 text-white text-xs">
                                {ticket.isWatched ? 'Unwatch price' : 'Watch price changes'}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-md group/btn transition-all duration-200 hover:scale-110"
                                  onClick={(e) => { e.stopPropagation(); handleShare(ticket); }}
                                  aria-label="Share this ticket"
                                >
                                  <Share2 className="h-4 w-4 text-gray-700 group-hover/btn:text-purple-600 transition-colors duration-300 group-hover/btn:scale-110" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-gray-900 text-white text-xs">
                                Share this ticket
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-md group/btn transition-all duration-200 hover:scale-110"
                                  onClick={(e) => { e.stopPropagation(); toggleCompare(ticket); }}
                                  aria-label={compareTickets.some(t => t.id === ticket.id) ? 'Remove from comparison' : 'Add to comparison'}
                                >
                                  <Check
                                    className={cn(
                                      'h-4 w-4 transition-colors duration-300 group-hover/btn:scale-110',
                                      compareTickets.some(t => t.id === ticket.id) ? 'text-green-500' : 'text-gray-700 group-hover/btn:text-green-500'
                                    )}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-gray-900 text-white text-xs">
                                {compareTickets.some(t => t.id === ticket.id) ? 'Remove from comparison' : 'Add to comparison'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <CardHeader className="pb-4 px-5 pt-5">
                        <div className="flex justify-between items-start gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] py-0.5 px-2 font-medium border',
                                  ticket.ticketType === 'VIP' ? 'border-amber-300 bg-amber-50 text-amber-700' :
                                  ticket.ticketType === 'Early Bird' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                                  'border-gray-200 bg-gray-50 text-gray-700'
                                )}
                              >
                                {ticket.ticketType}
                              </Badge>
                              {ticket.isVerified && (
                                <Badge variant="outline" className="text-[10px] py-0.5 px-2 border-green-200 bg-green-50 text-green-700 font-medium">
                                  <Check className="h-3 w-3 mr-1" /> Verified
                                </Badge>
                              )}
                            </div>
                            <Link to={`/events/${ticket.eventId}`} className="group block">
                              <CardTitle
                                className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300"
                                style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.3' }}
                              >
                                {ticket.eventName}
                              </CardTitle>
                            </Link>
                            <div className="flex items-center text-sm text-gray-600 mt-1.5">
                              <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{ticket.eventLocation.split(',')[0]}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Calendar className="h-3 w-3 mr-1.5 flex-shrink-0" />
                              <span>{new Date(ticket.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                              <span className="mx-1.5">•</span>
                              <Clock className="h-3 w-3 mr-1.5 flex-shrink-0" />
                              <span>{ticket.timeLeft}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-500 line-through mb-0.5">
                              ₹{ticket.originalPrice.toLocaleString('en-IN')}
                            </div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              ₹{ticket.resellPrice.toLocaleString('en-IN')}
                            </div>
                            <div className="text-xs font-medium text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded-full mt-1">
                              Save ₹{(ticket.originalPrice - ticket.resellPrice).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 px-5 pb-5">
                        <div className="flex items-center justify-between mt-3 mb-4">
                          <div className="flex items-center">
                            <div className="flex -space-x-1.5">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {ticket.seller[0].toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {ticket.seller}
                                {ticket.sellerVerified && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="ml-1.5">
                                          <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-gray-900 text-white text-xs">
                                        Verified Seller
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <div className="flex items-center">
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      className={cn(
                                        'h-3 w-3',
                                        star <= Math.floor(ticket.sellerRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-100'
                                      )}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-medium text-gray-600 ml-1.5">
                                  {ticket.sellerRating.toFixed(1)} ({ticket.sold} sales)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                    <Eye className="h-3 w-3 mr-1 text-gray-400" />
                                    {ticket.views > 1000 ? `${(ticket.views / 1000).toFixed(1)}k` : ticket.views}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-900 text-white text-xs">
                                  {ticket.views.toLocaleString('en-IN')} views
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                    <ShoppingCart className="h-3 w-3 mr-1 text-gray-400" />
                                    {ticket.sold > 1000 ? `${(ticket.sold / 1000).toFixed(1)}k` : ticket.sold}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-900 text-white text-xs">
                                  {ticket.sold.toLocaleString('en-IN')} sold
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1.5" />
                              <span>Posted {ticket.timeSincePosted}</span>
                            </div>
                            {ticket.quantity > 0 ? (
                              <div className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></div>
                                <span className="text-xs font-medium">{ticket.quantity} available</span>
                              </div>
                            ) : (
                              <div className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">
                                Sold Out
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="default"
                          size="lg"
                          className="w-full h-11 font-medium text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 mt-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                            setShowPurchaseModal(true);
                          }}
                          disabled={ticket.quantity === 0}
                          aria-label={ticket.quantity > 0 ? 'Buy ticket now' : 'Ticket sold out'}
                        >
                          <ShoppingCart className="h-4.5 w-4.5 mr-2" />
                          {ticket.quantity > 0 ? 'Buy Now' : 'Sold Out'}
                        </Button>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center">
                            <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                            <span>100% Secure Checkout</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                            <span>Instant Delivery</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="mt-auto pt-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex w-full justify-between items-center">
                          <div className="flex items-center text-xs text-gray-500">
                            <Heart className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            <span>{ticket.favorites} favorites</span>
                          </div>
                          <div className="flex items-center">
                            {ticket.priceTrend === 'increasing' ? (
                              <TrendingUp className="h-3.5 w-3.5 text-red-500 mr-1" />
                            ) : ticket.priceTrend === 'decreasing' ? (
                              <TrendingDown className="h-3.5 w-3.5 text-green-500 mr-1" />
                            ) : (
                              <TrendingUp className="h-3.5 w-3.5 text-gray-400 mr-1" />
                            )}
                            <span className="text-xs font-medium text-gray-700 capitalize">
                              {ticket.priceTrend} price
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-end mt-2 space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2.5 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTicket(ticket);
                                    setShowReportModal(true);
                                  }}
                                  aria-label="Report ticket"
                                >
                                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                                  Report
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-900 text-white text-xs">
                                Report this listing
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2.5 text-xs font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerify(ticket.id);
                                  }}
                                  disabled={loadingVerify}
                                  aria-label="Verify ticket authenticity"
                                >
                                  {loadingVerify && selectedTicket?.id === ticket.id ? (
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin text-gray-800" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                  )}
                                  Verify
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-900 text-white text-xs">
                                Verify ticket authenticity
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2.5 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTicket(ticket);
                                    setShowOfferModal(true);
                                  }}
                                  aria-label="Make an offer"
                                >
                                  <DollarSign className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                  Offer
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-900 text-white text-xs">
                                Make an offer on this ticket
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {filteredTickets.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">No tickets found matching your criteria</div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveTab('all');
                    setSortBy('newest');
                    setPriceRange([0, 10000]);
                    setSelectedCategories([]);
                    setSelectedCity('All');
                    setCurrentPage(1);
                    setShowFilters(false);
                  }}
                  aria-label="Clear all filters"
                >
                  <FilterX className="mr-2 h-4 w-4" />
                  Clear all filters
                </Button>
              </div>
            )}

            {!isLoading && filteredTickets.length > 0 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                        className={cn(currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')}
                      />
                    </PaginationItem>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      let pageNum = totalPages <= 5 ? i + 1 :
                        currentPage <= 3 ? i + 1 :
                        currentPage >= totalPages - 2 ? totalPages - 4 + i :
                        currentPage - 2 + i;
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={currentPage === pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            aria-label={`Page ${pageNum}`}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis aria-label="More pages" />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                        className={cn(currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
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
                <div className="flex justify-between">
                  <span>Event Date</span>
                  <span>{new Date(selectedTicket.eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                </div>
                <div className="border-t pt-2">
                  <p className="text-sm">Seller: {selectedTicket.seller} ({selectedTicket.sellerRating} ★)</p>
                  {selectedTicket.sellerVerified && <Badge variant="secondary">Verified Seller</Badge>}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPurchaseModal(false)} aria-label="Cancel purchase">
                Cancel
              </Button>
              <Button
                disabled={loadingPurchase}
                onClick={() => handlePurchase(selectedTicket)}
                aria-label="Confirm purchase"
              >
                {loadingPurchase ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Confirm Purchase
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Modal */}
        <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Listing</DialogTitle>
              <DialogDescription>
                Please explain why you're reporting this ticket listing.
              </DialogDescription>
            </DialogHeader>
            <textarea
              className="w-full h-32 p-2 border rounded"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value.replace(/[<>"'&]/g, ''))}
              placeholder="Describe the issue (e.g., suspicious pricing, fake ticket)..."
              aria-label="Report reason"
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowReportModal(false)}
                aria-label="Cancel report"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReport}
                aria-label="Submit report"
              >
                Submit Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Make Offer Modal */}
        <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make an Offer</DialogTitle>
              <DialogDescription>
                Enter your offer for this ticket.
              </DialogDescription>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">{selectedTicket.eventName}</h4>
                  <p className="text-sm text-gray-600">{selectedTicket.ticketType}</p>
                </div>
                <div className="flex justify-between">
                  <span>Current Price</span>
                  <span className="font-bold text-green-600">₹{selectedTicket.resellPrice.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <Label className="block mb-2">Your Offer</Label>
                  <Input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="Enter amount (₹)"
                    min="0"
                    aria-label="Offer amount"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOfferModal(false)} aria-label="Cancel offer">
                Cancel
              </Button>
              <Button onClick={handleMakeOffer} aria-label="Submit offer">
                Submit Offer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Compare Tickets Modal */}
        <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Compare Tickets</DialogTitle>
              <DialogDescription>
                Compare up to {compareTickets.length} selected tickets side by side.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {compareTickets.map(ticket => (
                <Card key={ticket.id} className="bg-white/90 backdrop-blur-sm border border-gray-100">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2">{ticket.eventName}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleCompare(ticket)}
                        aria-label={`Remove ${ticket.eventName} from comparison`}
                      >
                        <FilterX className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">{ticket.ticketType}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Resell Price</span>
                      <span className="font-bold text-green-600">₹{ticket.resellPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Original Price</span>
                      <span className="line-through">₹{ticket.originalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Savings</span>
                      <span>{Math.round(ticket.discount)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Event Date</span>
                      <span>{new Date(ticket.eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location</span>
                      <span>{ticket.eventLocation.split(',')[0]}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Seller</span>
                      <span className="flex items-center">
                        {ticket.seller}
                        {ticket.sellerVerified && (
                          <BadgeCheck className="h-4 w-4 ml-1 text-blue-500" />
                        )}
                        <span className="ml-1">({ticket.sellerRating} ★)</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Listed</span>
                      <span>{ticket.timeSincePosted || calculateTimeSincePosted(ticket.listedOn)}</span>
                    </div>
                    <div className="pt-2 space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full flex items-center justify-center"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowCompareModal(false);
                          setShowOfferModal(true);
                        }}
                        aria-label={`Make an offer for ${ticket.eventName}`}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Make Offer
                      </Button>
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowCompareModal(false);
                          setShowPurchaseModal(true);
                        }}
                        disabled={ticket.quantity <= 0}
                        aria-label={`Buy ${ticket.eventName} ticket`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {ticket.quantity > 0 ? 'Buy Now' : 'Sold Out'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

ResellTicketsPage.propTypes = {
  initialFilters: PropTypes.shape({
    search: PropTypes.string,
    sort: PropTypes.string,
    tab: PropTypes.string,
    priceRange: PropTypes.arrayOf(PropTypes.number),
    categories: PropTypes.arrayOf(PropTypes.string),
    city: PropTypes.string
  })
};

ResellTicketsPage.defaultProps = {
  initialFilters: {}
};

export default ResellTicketsPage;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, Ticket, Calendar, MapPin, Clock, DollarSign, Percent, Heart, AlertTriangle, ShoppingCart, Star, Eye, FilterX, TrendingUp, TrendingDown, Check, Loader2, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis as PaginationEllipsisComponent } from '../components/ui/pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventsContext';
import { cn } from '../lib/utils';
import PropTypes from 'prop-types';

// Utility to calculate time left
const calculateTimeLeft = (date) => {
  const difference = new Date(date) - new Date();
  if (difference <= 0) return 'Event started';
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  return `${days}d ${hours}h ${minutes}m`;
};

// Mock data with future dates
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
    listedOn: '2025-10-01T14:30:00+05:30',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1740&q=80',
    description: 'Selling my VIP pass for Summer Music Festival 2026. Includes fast-track entry and lounge access.',
    views: 245,
    favorites: 56,
    isWatched: false,
    isFavorite: false,
    category: 'Music Festival',
    priceTrend: 'stable'
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
    listedOn: '2025-11-15T10:00:00+05:30',
    image: 'https://images.unsplash.com/photo-1524178231561-6e9af79a00d0?auto=format&fit=crop&w=1470&q=80',
    description: 'Early bird ticket for Tech Summit 2026. Includes networking sessions and workshops.',
    views: 320,
    favorites: 78,
    isWatched: false,
    isFavorite: false,
    category: 'Summit',
    priceTrend: 'decreasing'
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
    listedOn: '2025-12-01T09:30:00+05:30',
    image: 'https://images.unsplash.com/photo-1565688530519-87a737f0cce0?auto=format&fit=crop&w=1470&q=80',
    description: 'Group tickets for Food Festival 2026. Price per ticket. Perfect for a fun day out!',
    views: 150,
    favorites: 35,
    isWatched: false,
    isFavorite: false,
    category: 'Festival',
    priceTrend: 'increasing'
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
    listedOn: '2025-11-20T16:15:00+05:30',
    image: 'https://images.unsplash.com/photo-1540575467063-3a4b7228d9b3?auto=format&fit=crop&w=1470&q=80',
    description: 'General admission ticket for Art Exhibition 2026. Includes guided tour.',
    views: 210,
    favorites: 48,
    isWatched: false,
    isFavorite: false,
    category: 'Exhibition',
    priceTrend: 'stable'
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
    listedOn: '2025-12-10T15:45:00+05:30',
    image: 'https://images.unsplash.com/photo-1493225455756-09d248c804ee?auto=format&fit=crop&w=1470&q=80',
    description: 'Extra ticket for Rock Concert 2026. Great view from general area.',
    views: 280,
    favorites: 62,
    isWatched: false,
    isFavorite: false,
    category: 'Concert',
    priceTrend: 'increasing'
  }
];

const categories = ['All', 'Concert', 'Music Festival', 'Festival', 'Summit', 'Exhibition', 'Sports', 'Theater', 'Workshop'];

const ResellTicketsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { purchaseResellTicket, verifyTicket } = useEvents();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState(mockResellTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage, setTicketsPerPage] = useState(9);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [failedImages, setFailedImages] = useState(new Set());

  // Handle window resize for responsive filters
  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load recently viewed tickets from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('recentlyViewedTickets') || '[]');
    setRecentlyViewed(stored);
  }, []);

  // Update recently viewed tickets
  const updateRecentlyViewed = useCallback((ticket) => {
    setRecentlyViewed(prev => {
      const updated = [
        { id: ticket.id, eventName: ticket.eventName, image: ticket.image, eventId: ticket.eventId },
        ...prev.filter(item => item.id !== ticket.id)
      ].slice(0, 5); // Keep only 5 recent items
      localStorage.setItem('recentlyViewedTickets', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Update countdown timers
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets(prev => prev.map(ticket => ({
        ...ticket,
        timeLeft: calculateTimeLeft(ticket.eventDate)
      })));
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    return tickets
      .filter(ticket => {
        const matchesSearch = ticket.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.ticketType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.seller.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || ticket.ticketType.toLowerCase().includes(activeTab.toLowerCase());
        const matchesPrice = ticket.resellPrice >= priceRange[0] && ticket.resellPrice <= priceRange[1];
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(ticket.category);
        return matchesSearch && matchesTab && matchesPrice && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.resellPrice - b.resellPrice;
        if (sortBy === 'price-desc') return b.resellPrice - a.resellPrice;
        if (sortBy === 'discount-desc') return b.discount - a.discount;
        if (sortBy === 'views-desc') return b.views - a.views;
        if (sortBy === 'rating-desc') return b.sellerRating - a.sellerRating;
        return new Date(b.listedOn) - new Date(a.listedOn); // Default: newest
      });
  }, [tickets, searchTerm, activeTab, priceRange, selectedCategories, sortBy]);

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

  // Handle purchase
  const handlePurchase = useCallback(() => {
    if (!isAuthenticated) {
      setStatus({ type: 'error', message: 'Please sign in to purchase tickets.' });
      navigate('/login', { state: { from: '/resell' } });
      return;
    }

    // Navigate to payment page with ticket details
    navigate('/payment', { 
      state: { 
        ticket: selectedTicket,
        from: '/resell'
      } 
    });
  }, [isAuthenticated, navigate, selectedTicket, purchaseResellTicket]);

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
    if (!amount || amount <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid offer amount.' });
      return;
    }
    console.log(`Offer of ₹${amount} made for ticket ${selectedTicket.id}`);
    setStatus({ type: 'success', message: 'Offer sent to seller!' });
    setShowOfferModal(false);
    setOfferAmount('');
  }, [selectedTicket, offerAmount]);

  // Handle image error
  const handleImageError = useCallback((id) => {
    setFailedImages(prev => new Set(prev).add(id));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Find Verified Resale Tickets</h1>
          <p className="text-lg text-muted-foreground">Get the best deals on tickets for upcoming events</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Available Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalListings}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Average Discount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats.averageDiscount}%</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Total Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">₹{stats.totalSavings.toLocaleString()}</div>
            </CardContent>
          </Card>
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
                status.type === 'error'
                  ? 'bg-red-100 border border-red-300 text-red-600'
                  : 'bg-green-100 border border-green-300 text-green-600'
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
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events, tickets, or sellers..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search tickets"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]" aria-label="Sort tickets">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
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
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
                role="button"
                aria-label={showFilters ? 'Hide filters' : 'Show filters'}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-700"
                aria-label="All ticket types"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="vip" 
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-700"
                aria-label="VIP tickets"
              >
                VIP
              </TabsTrigger>
              <TabsTrigger 
                value="general" 
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-700"
                aria-label="General admission tickets"
              >
                General
              </TabsTrigger>
              <TabsTrigger 
                value="early-bird" 
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-700"
                aria-label="Early bird tickets"
              >
                Early Bird
              </TabsTrigger>
              <TabsTrigger 
                value="group" 
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-700"
                aria-label="Group tickets"
              >
                Group
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {(showFilters || isLargeScreen) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:w-1/4"
              >
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold flex items-center text-gray-900">
                      <Filter className="h-5 w-5 mr-2 text-gray-900" />
                      Filters
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-3 py-1.5 rounded-md transition-colors"
                      onClick={() => {
                        setSearchTerm('');
                        setSortBy('newest');
                        setActiveTab('all');
                        setPriceRange([0, 10000]);
                        setSelectedCategories([]);
                        setCurrentPage(1);
                      }}
                      role="button"
                      aria-label="Reset all filters"
                    >
                      Reset All
                    </Button>
                  </div>
                  <div className="space-y-6">
                    {/* Price Range Filter */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-gray-900">Price Range</Label>
                        <span className="text-xs bg-gray-100 text-gray-900 px-2 py-1 rounded-full">
                          ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                        </span>
                      </div>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={10000}
                        step={100}
                        minStepsBetweenThumbs={1}
                        className="py-3"
                        aria-label="Price range slider"
                      />
                      <div className="flex justify-between text-sm font-medium text-gray-700">
                        <span>₹0</span>
                        <span>₹10,000</span>
                      </div>
                    </div>

                    {/* Categories Filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium block text-gray-900">Categories</Label>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-3">
                            <Checkbox
                              id={`cat-${category}`}
                              checked={selectedCategories.includes(category) || (category === 'All' && selectedCategories.length === 0)}
                              onCheckedChange={(checked) => {
                                if (category === 'All') {
                                  setSelectedCategories([]);
                                } else if (checked) {
                                  setSelectedCategories(prev => [...prev.filter(c => c !== 'All'), category]);
                                } else {
                                  setSelectedCategories(prev => prev.filter(c => c !== category));
                                }
                              }}
                              aria-label={`Select ${category} category`}
                            />
                            <Label
                              htmlFor={`cat-${category}`}
                              className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                            >
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Items Per Page */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <Label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-900">Tickets per Page</Label>
                      <Select
                        value={ticketsPerPage.toString()}
                        onValueChange={(value) => {
                          setTicketsPerPage(Number(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full" aria-label="Tickets per page">
                          <SelectValue placeholder="Tickets per page" />
                        </SelectTrigger>
                        <SelectContent>
                          {[6, 9, 12, 15, 20].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} per page
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setPriceRange([0, 10000]);
                        setSelectedCategories([]);
                        setSearchTerm('');
                        setActiveTab('all');
                        setSortBy('newest');
                        setCurrentPage(1);
                      }}
                      role="button"
                      aria-label="Clear all filters"
                    >
                      <FilterX className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Recently Viewed Section */}
            {recentlyViewed.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentlyViewed.map(item => (
                    <Card key={item.id} className="overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={failedImages.has(item.id) ? 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80' : item.image}
                          alt={item.eventName}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={() => handleImageError(item.id)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <div className="text-white">
                            <p className="text-sm font-medium">{item.eventLocation?.split(',')[0] || 'Location not available'}</p>
                            <p className="text-xs">{item.eventDate ? new Date(item.eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Date not available'}</p>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 h-14">{item.eventName}</h3>
                        <Button 
                          asChild 
                          variant="outline" 
                          className="w-full border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                          aria-label={`View ${item.eventName}`}
                        >
                          <Link 
                            to={`/events/${item.eventId}`} 
                            onClick={() => updateRecentlyViewed(item)}
                            className="text-sm font-medium"
                          >
                            View Event
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentTickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Card
                    className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
                    onClick={() => updateRecentlyViewed(ticket)}
                    role="article"
                    aria-label={`Ticket for ${ticket.eventName}`}
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={failedImages.has(ticket.id) ? 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80' : ticket.image}
                        alt={ticket.eventName}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={() => handleImageError(ticket.id)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div className="text-white">
                          <p className="text-sm font-medium">{ticket.eventLocation}</p>
                          <p className="text-sm">{new Date(ticket.eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                        </div>
                      </div>
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-md">
                        {Math.round(ticket.discount)}% OFF
                      </Badge>
                      <div className="absolute top-3 left-3 flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="p-1.5 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(ticket.id);
                                }}
                                role="button"
                                aria-label={ticket.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <Heart 
                                  className={cn(
                                    'h-4 w-4 transition-all duration-300', 
                                    ticket.isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-700 hover:text-red-500'
                                  )} 
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {ticket.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="p-1.5 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWatch(ticket.id);
                                }}
                                role="button"
                                aria-label={ticket.isWatched ? 'Unwatch price' : 'Watch price changes'}
                              >
                                <Eye className={cn(
                                  'h-4 w-4 transition-colors duration-300', 
                                  ticket.isWatched ? 'text-blue-500' : 'text-gray-700 hover:text-blue-500'
                                )} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {ticket.isWatched ? 'Unwatch price' : 'Watch price changes'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <Link to={`/events/${ticket.eventId}`} className="group">
                            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {ticket.eventName}
                            </CardTitle>
                          </Link>
                          <CardDescription className="flex items-center text-sm mt-2">
                            <Ticket className="h-4 w-4 mr-1.5 text-gray-900" />
                            <span className="text-sm font-medium text-gray-900">{ticket.ticketType}</span>
                          </CardDescription>
                          <div className="flex items-center text-sm text-gray-900 mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-900" />
                            <span className="text-gray-900" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{ticket.eventLocation.split(',')[0]}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-muted-foreground line-through">
                            ₹{ticket.originalPrice.toLocaleString()}
                          </div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            ₹{ticket.resellPrice.toLocaleString()}
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            Save ₹{(ticket.originalPrice - ticket.resellPrice).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <div className="flex items-center justify-between text-sm text-gray-900 mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-900" />
                          <span className="text-gray-900">{new Date(ticket.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-900" />
                          <span className="text-gray-900">{ticket.timeLeft || calculateTimeLeft(ticket.eventDate)} left</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center">
                          <div className="flex -space-x-1.5">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                              {ticket.seller[0]}
                            </div>
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">{ticket.seller}</div>
                            <div className="flex items-center">
                              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 mr-1" />
                              <span className="text-xs text-gray-900">{ticket.sellerRating}</span>
                              {ticket.sellerVerified && (
                                <Badge variant="outline" className="ml-2 text-[10px] py-0 px-1.5 border-green-200 bg-green-50 text-green-700">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-900">
                            <span className="inline-flex items-center">
                              <Eye className="h-3 w-3 mr-1 text-gray-900" />
                              {ticket.views}
                            </span>
                            <span className="mx-1 text-gray-600">•</span>
                            <span className="inline-flex items-center">
                              <Heart className="h-3 w-3 mr-1 text-gray-900" />
                              {ticket.favorites}
                            </span>
                          </div>
                          <div className="flex items-center justify-end text-xs mt-1">
                            {ticket.priceTrend === 'increasing' ? (
                              <TrendingUp className="h-3.5 w-3.5 text-red-500 mr-1" />
                            ) : ticket.priceTrend === 'decreasing' ? (
                              <TrendingDown className="h-3.5 w-3.5 text-green-500 mr-1" />
                            ) : (
                              <TrendingUp className="h-3.5 w-3.5 text-gray-400 mr-1" />
                            )}
                            <span className="text-gray-900 font-medium capitalize">{ticket.priceTrend}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900 mt-2 px-1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {ticket.description}
                      </div>
                    </CardContent>
                    <CardFooter className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex w-full justify-between items-center">
                        <div className="flex gap-1.5">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2.5 text-xs font-medium text-gray-800 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTicket(ticket);
                                    setShowReportModal(true);
                                  }}
                                  role="button"
                                  aria-label="Report ticket"
                                >
                                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                                  Report
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Report this listing</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2.5 text-xs font-medium text-gray-800 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerify(ticket.id);
                                  }}
                                  disabled={loadingVerify}
                                  role="button"
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
                              <TooltipContent>Verify ticket authenticity</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2.5 text-xs rounded-lg hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTicket(ticket);
                                    setShowOfferModal(true);
                                  }}
                                  role="button"
                                  aria-label="Make an offer"
                                >
                                  <DollarSign className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                  Offer
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Make an offer</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Button
                          size="sm"
                          className="h-9 px-4 text-sm font-medium rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md shadow-green-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                            setShowPurchaseModal(true);
                          }}
                          role="button"
                          aria-label="Buy ticket now"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy Now
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">No tickets found matching your criteria</div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveTab('all');
                    setSortBy('newest');
                    setPriceRange([0, 10000]);
                    setSelectedCategories([]);
                    setCurrentPage(1);
                  }}
                  role="button"
                  aria-label="Clear all filters"
                >
                  <FilterX className="mr-2 h-4 w-4" />
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        role="button"
                        aria-label="Previous page"
                        className={cn(currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')}
                      />
                    </PaginationItem>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={currentPage === pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            role="button"
                            aria-label={`Page ${pageNum}`}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsisComponent aria-label="More pages" />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        role="button"
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
                  <p className="text-sm text-muted-foreground">{selectedTicket.ticketType}</p>
                </div>
                <div className="flex justify-between">
                  <span>Resell Price</span>
                  <span className="font-bold text-green-600">₹{selectedTicket.resellPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Original Price</span>
                  <span className="line-through">₹{selectedTicket.originalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Savings</span>
                  <span>{Math.round(selectedTicket.discount)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Event Date</span>
                  <span>{new Date(selectedTicket.eventDate).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="border-t pt-2">
                  <p className="text-sm">Seller: {selectedTicket.seller} ({selectedTicket.sellerRating} ★)</p>
                  {selectedTicket.sellerVerified && <Badge variant="secondary">Verified Seller</Badge>}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPurchaseModal(false)} role="button" aria-label="Cancel purchase">
                Cancel
              </Button>
              <Button disabled={loadingPurchase} onClick={handlePurchase} role="button" aria-label="Confirm purchase">
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
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue (e.g., suspicious pricing, fake ticket)..."
              aria-label="Report reason"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReportModal(false)} role="button" aria-label="Cancel report">
                Cancel
              </Button>
              <Button onClick={handleReport} role="button" aria-label="Submit report">
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
                  <p className="text-sm text-muted-foreground">{selectedTicket.ticketType}</p>
                </div>
                <div className="flex justify-between">
                  <span>Current Price</span>
                  <span className="font-bold text-green-600">₹{selectedTicket.resellPrice.toLocaleString()}</span>
                </div>
                <div>
                  <Label className="block mb-2">Your Offer</Label>
                  <Input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="Enter amount (₹)"
                    min="0"
                    aria-label="Offer amount"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOfferModal(false)} role="button" aria-label="Cancel offer">
                Cancel
              </Button>
              <Button onClick={handleMakeOffer} role="button" aria-label="Submit offer">
                Submit Offer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

ResellTicketsPage.propTypes = {
  // No props are passed to this component, but defining PropTypes for future extensibility
};

export default ResellTicketsPage;

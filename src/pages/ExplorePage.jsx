import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sliders, X, Map, List, CheckCircle } from 'lucide-react';
import { parseISO, isWithinInterval } from 'date-fns';
import EventFilters from '../components/events/EventFilters';
import EventMapView from '../components/events/EventMapView';
import EventCard from '../components/events/EventCard';
import { useEvents } from '../contexts/EventsContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const ExplorePage = () => {
  const { events, loading, refreshEvents } = useEvents();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for success message
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Show success message if redirected from event creation
  useEffect(() => {
    if (location.state?.showSuccessMessage) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        // Clear the location state
        navigate(location.pathname, { replace: true, state: {} });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [dateRange, setDateRange] = useState([{ 
    startDate: null, 
    endDate: null, 
    key: 'selection' 
  }]);
  const [sortBy, setSortBy] = useState('date-asc');
  const [showMap, setShowMap] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  
  // Apply filters and sorting to events
  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        // Search term filter - search in name, description, location, and organizer
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
          event.name.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.location?.name?.toLowerCase().includes(searchLower) ||
          event.organizer?.name?.toLowerCase().includes(searchLower);
        
        // Category filter - support multiple categories
        const matchesCategory = selectedCategory === 'All' || 
          (Array.isArray(event.categories) 
            ? event.categories.includes(selectedCategory)
            : event.category === selectedCategory);
        
        // Price range filter - handle both free and paid events
        const eventPrice = event.ticketPrice || 0;
        const matchesPrice = !selectedPriceRange || (
          eventPrice >= (selectedPriceRange.min || 0) && 
          eventPrice <= (selectedPriceRange.max || Infinity)
        );
        
        // Date range filter - handle both single day and multi-day events
        const eventDate = event.startDate ? parseISO(event.startDate) : null;
        const matchesDateRange = !dateRange[0]?.startDate || !dateRange[0]?.endDate || !eventDate ||
          isWithinInterval(eventDate, {
            start: dateRange[0].startDate,
            end: dateRange[0].endDate
          });
        
        return matchesSearch && matchesCategory && matchesPrice && matchesDateRange;
      })
      .sort((a, b) => {
        // Apply sorting with additional fallbacks
        const aDate = a.startDate ? new Date(a.startDate) : new Date(0);
        const bDate = b.startDate ? new Date(b.startDate) : new Date(0);
        const aPrice = a.ticketPrice || 0;
        const bPrice = b.ticketPrice || 0;
        const aPopularity = a.attendees?.length || 0;
        const bPopularity = b.attendees?.length || 0;
        
        switch (sortBy) {
          case 'date-asc':
            return aDate - bDate;
          case 'date-desc':
            return bDate - aDate;
          case 'price-asc':
            return aPrice - bPrice;
          case 'price-desc':
            return bPrice - aPrice;
          case 'popularity':
            return bPopularity - aPopularity;
          default:
            return 0;
        }
      });
  }, [events, searchTerm, selectedCategory, selectedPriceRange, dateRange, sortBy]);
  
  // Paginated events
  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredEvents.slice(0, start + itemsPerPage);
  }, [filteredEvents, page]);
  
  // Check if there are more events to load
  const hasMore = paginatedEvents.length < filteredEvents.length;
  
  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedPriceRange(null);
    setDateRange([{ startDate: null, endDate: null, key: 'selection' }]);
    setSortBy('date-asc');
  }, []);
  
  // Handle event selection from map or list
  const handleEventSelect = useCallback((event) => {
    setSelectedEvent(event);
    
    // If on mobile and map is open, close it when an event is selected
    if (window.innerWidth < 768 && showMap) {
      setShowMap(false);
    }
    
    // Scroll to the selected event card
    const element = document.getElementById(`event-${event.id || event._id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add visual feedback for the selected event
      element.classList.add('ring-2', 'ring-blue-500', 'scale-[1.02]');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'scale-[1.02]');
      }, 2000);
    }
  }, [showMap]);
  
  // Handle loading more events
  const loadMoreEvents = useCallback(() => {
    setIsLoadingMore(true);
    setPage(prev => prev + 1);
    // Simulate network delay
    setTimeout(() => setIsLoadingMore(false), 500);
  }, []);
  
  // Reset pagination when filters change
  const handleFilterChange = useCallback((filterType, value) => {
    setPage(1); // Reset to first page when filters change
    
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        break;
      case 'category':
        setSelectedCategory(value);
        break;
      case 'price':
        setSelectedPriceRange(value);
        break;
      case 'date':
        setDateRange(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
      default:
        break;
    }
  }, []);
  
  // Toggle filters panel on mobile
  const toggleFilters = useCallback(() => {
    setFiltersExpanded(prev => !prev);
  }, []);
  
  // Toggle map view
  const toggleMapView = useCallback(() => {
    setShowMap(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded-lg text-green-400 flex items-center"
            >
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>Your event has been created and listed successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Filters Toggle */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <button
            onClick={toggleFilters}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {filtersExpanded ? <X size={16} /> : <Sliders size={16} />}
            <span>{filtersExpanded ? 'Hide Filters' : 'Filters'}</span>
          </button>
          
          <button
            onClick={toggleMapView}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {showMap ? <List size={16} /> : <Map size={16} />}
            <span>{showMap ? 'List View' : 'Map View'}</span>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className={`${filtersExpanded ? 'block' : 'hidden'} md:block md:w-64 lg:w-80 flex-shrink-0`}>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Reset all
                </button>
              </div>
              
              <EventFilters
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                selectedPriceRange={selectedPriceRange}
                dateRange={dateRange}
                sortBy={sortBy}
                onSearchChange={(value) => handleFilterChange('search', value)}
                onCategoryChange={(value) => handleFilterChange('category', value)}
                onPriceRangeChange={(value) => handleFilterChange('price', value)}
                onDateRangeChange={(value) => handleFilterChange('date', value)}
                onSortChange={(value) => handleFilterChange('sort', value)}
                categories={[...new Set(events.flatMap(e => e.categories || []).filter(Boolean))]}
              />
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">
                  Showing {Math.min(paginatedEvents.length, filteredEvents.length)} of {filteredEvents.length} events
                </p>
                {currentUser?.isAdmin && (
                  <button
                    onClick={() => navigate('/admin/events/new')}
                    className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Create New Event
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Map View */}
            {showMap ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
                <EventMapView 
                  events={filteredEvents} 
                  onEventSelect={handleEventSelect}
                  selectedEvent={selectedEvent}
                />
              </div>
            ) : (
              /* List View */
              <>
                {/* View Toggle - Desktop */}
                <div className="hidden md:flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {searchTerm ? `Search: "${searchTerm}"` : 'All Events'}
                    {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                  </h1>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMapView}
                      className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Map size={16} />
                      <span>Map View</span>
                    </button>
                  </div>
                </div>
                
                {/* Events Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="animate-pulse">
                          <div className="h-48 bg-gray-200"></div>
                          <div className="p-4">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
                            <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
                            <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : paginatedEvents.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <AnimatePresence>
                        {paginatedEvents.map((event) => (
                          <motion.div
                            key={event.id || event._id}
                            id={`event-${event.id || event._id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="relative"
                          >
                            <EventCard 
                              event={event} 
                              onClick={handleEventSelect}
                              isSelected={selectedEvent && (selectedEvent.id === event.id || selectedEvent._id === event._id)}
                              className="h-full"
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    
                    {/* Load More Button */}
                    {hasMore && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={loadMoreEvents}
                          disabled={isLoadingMore}
                          className={`px-6 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            isLoadingMore ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {isLoadingMore ? 'Loading...' : 'Load More Events'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MapPin className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || selectedCategory !== 'All' || selectedPriceRange || dateRange[0]?.startDate
                        ? 'Try adjusting your filters to find more events.'
                        : 'There are currently no upcoming events. Check back later!'}
                    </p>
                    {(searchTerm || selectedCategory !== 'All' || selectedPriceRange || dateRange[0]?.startDate) && (
                      <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;

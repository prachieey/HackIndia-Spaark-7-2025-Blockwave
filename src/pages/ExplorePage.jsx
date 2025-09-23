import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sliders, X, Map, List, CheckCircle, Loader2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { formatEventDate } from '../utils/dateUtils';
import { parseISO, isWithinInterval, format, addHours } from 'date-fns';
import EventFilters from '../components/events/EventFilters';
import EventMapView from '../components/events/EventMapView';
import EventCard from '../components/events/EventCard';
import { useEvents } from '../contexts/EventsContext';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/blockchain/Web3Context';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/button';

const ExplorePage = () => {
  const { events, loading, error, fetchEvents } = useEvents();
  const { user } = useAuth();
  const { isConnected } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for success message and error handling
  const [showSuccess, setShowSuccess] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
  
  // Handle refresh events
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setLocalError(null);
      await fetchEvents();
    } catch (err) {
      console.error('Error refreshing events:', err);
      setLocalError('Failed to refresh events. Please try again.');
      toast.error('Failed to refresh events');
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchEvents]);
  
  // Initial load and refresh when component mounts
  useEffect(() => {
    handleRefresh();
  }, []);
  
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
  
  // Available categories - should match your backend
  const categories = [
    'All',
    'music',
    'sports',
    'conference',
    'art',
    'charity',
    'other'
  ];
  
  // Apply filters and sorting to events
  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        if (!event) return false;
        
        // Search term filter - search in name, description, location, and organizer
        const searchLower = searchTerm.toLowerCase();
        const eventName = event.title?.toLowerCase() || event.name?.toLowerCase() || '';
        const eventDescription = event.description?.toLowerCase() || '';
        const eventLocation = event.venue?.name?.toLowerCase() || event.location?.toLowerCase() || '';
        
        const matchesSearch = searchTerm === '' || 
          eventName.includes(searchLower) ||
          eventDescription.includes(searchLower) ||
          eventLocation.includes(searchLower);
        
        // Filter by category
        const matchesCategory = selectedCategory === 'All' || 
          (event.category && event.category.toLowerCase() === selectedCategory.toLowerCase());
        
        // Filter by date range
        const eventDate = event.startDate ? new Date(event.startDate) : null;
        let matchesDate = true;
        
        if (dateRange[0].startDate && dateRange[0].endDate && eventDate) {
          try {
            matchesDate = isWithinInterval(eventDate, {
              start: new Date(dateRange[0].startDate),
              end: new Date(dateRange[0].endDate)
            });
          } catch (error) {
            console.error('Error checking date range:', error);
          }
        }
        
        // Filter by price range
        let matchesPrice = true;
        if (selectedPriceRange && event.ticketTypes?.length > 0) {
          const [min, max] = selectedPriceRange.split('-').map(Number);
          const minPrice = Math.min(...event.ticketTypes.map(t => t.price));
          if (max === Infinity) {
            matchesPrice = minPrice >= min;
          } else {
            matchesPrice = minPrice >= min && minPrice <= max;
          }
        }
        
        return matchesSearch && matchesCategory && matchesDate && matchesPrice;
      })
      .sort((a, b) => {
        // Handle cases where dates might be invalid
        const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
        const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
        
        // Sort by date
        if (sortBy === 'date-asc') {
          return dateA - dateB;
        } else if (sortBy === 'date-desc') {
          return dateB - dateA;
        } else if (sortBy === 'price-asc') {
          return (a.price || 0) - (b.price || 0);
        } else if (sortBy === 'price-desc') {
          return (b.price || 0) - (a.price || 0);
        }
        return 0;
      });
  }, [events, searchTerm, selectedCategory, dateRange, selectedPriceRange, sortBy]);

  // Pagination
  const paginatedEvents = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredEvents.slice(0, startIndex + itemsPerPage); // Load all items up to current page
  }, [filteredEvents, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const hasMore = page < totalPages;

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };
  
  // Handle event click
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    if (showMap) {
      // In map view, clicking a card should center the map on that event
      // This would be implemented in the EventMapView component
    } else {
      // In list view, navigate to the event details page
      navigate(`/events/${event._id || event.id}`);
    }
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedPriceRange(null);
    setDateRange([{ startDate: null, endDate: null, key: 'selection' }]);
    setSortBy('date-asc');
    setPage(1);
  };

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedPriceRange(null);
    setDateRange([{ startDate: null, endDate: null, key: 'selection' }]);
    setSortBy('date-asc');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
          {/* Title and Event Count */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore Events</h1>
            <p className="mt-1 text-sm text-gray-500">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
              {searchTerm ? ` for "${searchTerm}"` : ''}
            </p>
          </div>
          
          {/* View Toggle and Filter Buttons */}
          <div className="flex flex-col space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {showMap ? (
                  <>
                    <List className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="whitespace-nowrap">List View</span>
                  </>
                ) : (
                  <>
                    <Map className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="whitespace-nowrap">Map View</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                  filtersExpanded 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Sliders className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {filtersExpanded ? 'Hide Filters' : 'Filters'}
                </span>
                {(searchTerm || selectedCategory !== 'All' || selectedPriceRange || dateRange[0].startDate) && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                    Active
                  </span>
                )}
              </button>
              
              {(searchTerm || selectedCategory !== 'All' || selectedPriceRange || dateRange[0].startDate) && (
                <button
                  onClick={handleResetFilters}
                  className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors border border-gray-200 rounded-md"
                >
                  <X className="h-4 w-4 mr-1" />
                  <span className="whitespace-nowrap">Clear filters</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <AnimatePresence>
          {filtersExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <EventFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedPriceRange={selectedPriceRange}
                  setSelectedPriceRange={setSelectedPriceRange}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  categories={categories}
                  onReset={handleResetFilters}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events grid */}
        <div className="mt-6 relative">
          {/* Blur overlay that appears when filters are expanded */}
          <AnimatePresence>
            {filtersExpanded && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-white z-10 pointer-events-none"
              />
            )}
          </AnimatePresence>
          
          {showMap ? (
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative"
              animate={{
                filter: filtersExpanded ? 'blur(4px)' : 'blur(0px)',
                transition: { duration: 0.3 }
              }}
            >
              <EventMapView 
                events={filteredEvents} 
                selectedEvent={selectedEvent}
                onEventClick={handleEventClick}
                className="h-[600px] w-full"
              />
              {selectedEvent && (
                <div className="p-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">{selectedEvent.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatEventDate(selectedEvent.startDate)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedEvent.location}
                  </p>
                  <div className="mt-4">
                    <Button
                      onClick={() => handleEventClick(selectedEvent)}
                      className="w-full justify-center"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              className="relative"
              animate={{
                filter: filtersExpanded ? 'blur(4px)' : 'blur(0px)',
                transition: { duration: 0.3 }
              }}
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredEvents.map((event, index) => {
                  if (!event) return null; // Skip null/undefined events
                  
                  // Create a unique key using event._id, event.id, or fallback to index
                  const uniqueKey = event?._id || event?.id || `event-${index}`;
                  
                  // Get the first ticket type's price as the event price if available
                  const ticketPrice = event.ticketTypes?.length > 0 
                    ? Math.min(...event.ticketTypes.map(t => t.price))
                    : 0;
                  
                  // Get the event location from venue or location field
                  const eventLocation = event.venue?.name || event.location || 'Location not specified';
                  
                  // Get the event image from bannerImage or use a fallback
                  const eventImage = event.bannerImage || 
                                   event.image || 
                                   'https://via.placeholder.com/400x225';
                  
                  // Get the organizer name (handling both object and string cases)
                  const organizerName = typeof event.organizer === 'object' 
                    ? event.organizer?.name || 'Organizer'
                    : event.organizer || 'Organizer';
                  
                  return (
                    <EventCard 
                      key={uniqueKey}
                      event={{
                        ...event,
                        // Ensure all required fields have fallbacks
                        id: event._id || uniqueKey,
                        title: event.title || 'Untitled Event',
                        description: event.description || 'No description available',
                        image: eventImage,
                        date: event.startDate ? formatEventDate(event.startDate) : 'Date not specified',
                        location: eventLocation,
                        price: ticketPrice,
                        category: event.category || 'other',
                        organizer: organizerName,
                        // Add any other required fields with fallbacks
                        startDate: event.startDate,
                        endDate: event.endDate,
                        timezone: event.timezone || 'UTC',
                        status: event.status || 'upcoming',
                        tags: event.tags || [],
                        // Ensure we have the original event data for the click handler
                        _original: event
                      }}
                      onClick={() => handleEventClick(event)}
                    />
                  );
                })}
              
              </div>
              
              {filteredEvents.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900">No events found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    We couldn't find any events matching your criteria. Try adjusting your filters.
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={handleResetFilters}
                      variant="outline"
                      className="inline-flex items-center"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear all filters
                    </Button>
                  </div>
                </div>
              ) : null}
              
              {hasMore && (
                <div className="mt-10 text-center">
                  <Button
                    onClick={loadMore}
                    disabled={loading || isLoadingMore}
                    className="inline-flex items-center px-6 py-3 text-base font-medium"
                  >
                    {loading || isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Events'
                    )}
                  </Button>
                  <p className="mt-2 text-sm text-gray-500">
                    Showing {Math.min(paginatedEvents.length, filteredEvents.length)} of {filteredEvents.length} events
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Event Platform. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="/about" className="text-sm text-gray-500 hover:text-gray-700">About</a>
              <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
              <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
              <a href="/contact" className="text-sm text-gray-500 hover:text-gray-700">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExplorePage;

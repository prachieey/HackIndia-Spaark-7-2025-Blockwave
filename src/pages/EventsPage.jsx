// Updated the React import to include Fragment
import React, { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEvents } from '../contexts/EventsContext';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
// Updated the import to include Disclosure
import { Transition, Dialog, Disclosure } from '@headlessui/react';// Added this import at the top of EventsPage.jsx
import { useWeb3 } from '../contexts/blockchain/Web3Context';
import { 
  FiFilter, 
  FiSearch, 
  FiCalendar, 
  FiMapPin, 
  FiDollarSign,
  FiClock,
  FiUsers,
  FiChevronDown,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiRefreshCw
   

  // Added this line

} from 'react-icons/fi';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

// Format date for display
const formatDate = (dateString) => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch (e) {
    return 'Date not available';
  }
};

const EventsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { events, fetchEvents, loading, error } = useEvents();
  
  // Get Web3 context - this will now handle cases where Web3 is not available
  const { isConnected } = useWeb3();
  
  // Fetch all events on component mount
  useEffect(() => {
    // Fetch all events without any filters to get the complete list
    const loadEvents = async () => {
      try {
        console.log('Loading all events...');
        // First, try to fetch with a direct API call for debugging
        try {
          const response = await fetch('http://localhost:5002/api/v1/events');
          const data = await response.json();
          console.log('Direct API Response:', data);
          
          if (Array.isArray(data)) {
            console.log(`Direct API returned ${data.length} events`);
          } else if (data && typeof data === 'object') {
            console.log('Direct API returned an object with keys:', Object.keys(data));
            if (data.events && Array.isArray(data.events)) {
              console.log(`Direct API returned ${data.events.length} events in 'events' property`);
            }
          }
        } catch (directError) {
          console.error('Direct API call failed:', directError);
        }

        // Then use the regular fetchEvents function
        const result = await fetchEvents({
          limit: 100,
          page: 1,
          sort: 'startDate',
          order: 'asc'
        }, { skipLoading: false });
        
        console.log('Events loaded:', events?.length);
        console.log('FetchEvents result:', result);
        
        if (!result || result.length === 0) {
          console.warn('No events found in the API response');
          // Try to fetch with a different endpoint
          try {
            console.log('Trying alternative endpoint: /api/events');
            const altResponse = await fetch('http://localhost:5002/api/events');
            const altData = await altResponse.json();
            console.log('Alternative endpoint response:', altData);
          } catch (altError) {
            console.error('Alternative endpoint failed:', altError);
          }
        }
      } catch (err) {
        console.error('Error loading events:', err);
      }
    };
    
    loadEvents();
  }, [fetchEvents, events?.length]);
  
  // State for UI
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    date: 'all',
    category: 'all',
    price: 'all',
    sortBy: 'date-asc',
  });

  // Mobile menu state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Available filter options
  const filterOptions = {
    date: [
      { value: 'all', label: 'All Dates' },
      { value: 'today', label: 'Today' },
      { value: 'this-week', label: 'This Week' },
      { value: 'this-month', label: 'This Month' },
      { value: 'upcoming', label: 'Upcoming' },
    ],
    price: [
      { value: 'all', label: 'Any Price' },
      { value: '0-0', label: 'Free' },
      { value: '1-500', label: 'Under ₹500' },
      { value: '500-1000', label: '₹500 - ₹1000' },
      { value: '1000-5000', label: '₹1000 - ₹5000' },
      { value: '5000-10000', label: '₹5000+' },
    ],
    sort: [
      { value: 'date-asc', label: 'Date: Earliest First' },
      { value: 'date-desc', label: 'Date: Latest First' },
      { value: 'price-asc', label: 'Price: Low to High' },
      { value: 'price-desc', label: 'Price: High to Low' },
      { value: 'popular', label: 'Most Popular' },
    ]
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    events.forEach(event => {
      if (event.category) cats.add(event.category);
    });
    return ['all', ...Array.from(cats)].sort();
  }, [events]);

  // Process and filter events
  const { filteredEvents, activeFilters } = useMemo(() => {
    if (!events) return { filteredEvents: [], activeFilters: 0 };

    let result = [...events];
    let activeFilterCount = 0;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.organizer?.name?.toLowerCase().includes(term)
      );
      if (searchTerm) activeFilterCount++;
    }

    // Apply category filter
    if (filters.category !== 'all') {
      result = result.filter(event => event.category === filters.category);
      activeFilterCount++;
    }

    // Apply price filter
    if (filters.price !== 'all') {
      const [min, max] = filters.price.split('-').map(Number);
      result = result.filter(event => {
        const price = event.ticketPrice || 0;
        return price >= min && (isNaN(max) || price <= max);
      });
      activeFilterCount++;
    }

    // Apply date filter
    const now = new Date();
    const eventDate = (event) => parseISO(event.startDate);
    
    if (filters.date !== 'all') {
      switch (filters.date) {
        case 'today':
          result = result.filter(event => isToday(eventDate(event)));
          break;
        case 'this-week':
          result = result.filter(event => isThisWeek(eventDate(event)));
          break;
        case 'this-month':
          result = result.filter(event => isThisMonth(eventDate(event)));
          break;
        case 'upcoming':
          result = result.filter(event => isAfter(eventDate(event), now));
          break;
        case 'past':
          result = result.filter(event => isBefore(eventDate(event), now));
          break;
      }
      activeFilterCount++;
    }

    // Sort events
    result = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-asc':
          return eventDate(a) - eventDate(b);
        case 'date-desc':
          return eventDate(b) - eventDate(a);
        case 'price-asc':
          return (a.ticketPrice || 0) - (b.ticketPrice || 0);
        case 'price-desc':
          return (b.ticketPrice || 0) - (a.ticketPrice || 0);
        case 'popular':
          return (b.attendeesCount || 0) - (a.attendeesCount || 0);
        default:
          return 0;
      }
    });

    return { filteredEvents: result, activeFilters: activeFilterCount };
  }, [events, searchTerm, filters]);

  // Fetch events on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadEvents = async () => {
      if (!isMounted) return;
      
      try {
        console.log('Fetching events...');
        // The fetchEvents function from useEvents already handles loading state
        const response = await fetchEvents({ 
          limit: 100,
          includePast: 'true'
        }, { skipLoading: false });
        
        if (!isMounted) return;
        console.log('Events loaded:', response);
        
        // Log the structure of the response
        console.log('Response type:', typeof response);
        if (response) {
          console.log('Response keys:', Object.keys(response));
          if (Array.isArray(response)) {
            console.log('Response is an array with length:', response.length);
          } else if (response.data && Array.isArray(response.data.events)) {
            console.log('Events found in response.data.events:', response.data.events.length);
          } else if (response.events && Array.isArray(response.events)) {
            console.log('Events found in response.events:', response.events.length);
          }
        }
        
        // If no events were returned in the response, log a warning
        if (!response || (Array.isArray(response) && response.length === 0) || 
            (response.data && response.data.events && response.data.events.length === 0)) {
          console.warn('No events found in the API response');
          // The UI will show a "no events" message based on the empty events array
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };
    
    loadEvents();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [fetchEvents]);
  
  // Log events for debugging
  useEffect(() => {
    if (events) {
      console.log('Current events:', events);
      console.log('Filtered events:', filteredEvents);
    }
  }, [events, filteredEvents]);

  // Handle event click
  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      date: 'all',
      category: 'all',
      price: 'all',
      sortBy: 'date-asc',
    });
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            
            {/* Search and Filter Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="h-12 bg-gray-200 rounded-lg w-full md:w-1/3"></div>
              <div className="flex gap-2">
                <div className="h-12 bg-gray-200 rounded-lg w-24"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-32"></div>
              </div>
            </div>
            
            {/* Event Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">
            We couldn't load the events. Please check your connection and try again.
          </p>
          <button
            onClick={fetchEvents}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
              Discover Events
            </h1>
            <p className="mt-3 text-xl text-gray-600">
              Find your next experience in {location?.city || 'your city'}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMobileFilters}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiFilter className="mr-2 h-4 w-4" />
                Filters
                {activeFilters > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full">
                    {activeFilters}
                  </span>
                )}
              </button>
              
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {filterOptions.sort.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <FiChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-gray-500">Filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-600 hover:bg-indigo-200"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.date !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {filterOptions.date.find(d => d.value === filters.date)?.label}
                  <button
                    onClick={() => handleFilterChange('date', 'all')}
                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-600 hover:bg-blue-200"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.price !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {filterOptions.price.find(p => p.value === filters.price)?.label}
                  <button
                    onClick={() => handleFilterChange('price', 'all')}
                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-green-600 hover:bg-green-200"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="ml-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Events Grid */}
        <div className="mt-8">
          {filteredEvents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    className="group bg-white overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                  >
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={event.imageUrl || 'https://source.unsplash.com/random/600x400/?event'}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-4 w-full">
                        <div className="flex justify-between items-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {event.category || 'Event'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-800">
                            <FiMapPin className="mr-1 h-3 w-3 text-gray-500" />
                            {event.location?.city || 'Online'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <FiCalendar className="mr-1.5 h-4 w-4 flex-shrink-0" />
                        {format(parseISO(event.startDate), 'MMM d, yyyy')}
                        {event.endDate && (
                          <>
                            <span className="mx-1">-</span>
                            {format(parseISO(event.endDate), 'MMM d, yyyy')}
                          </>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-lg font-bold text-gray-900">
                          {event.ticketPrice > 0 ? `₹${event.ticketPrice}` : 'Free'}
                        </span>
                        <button
                          onClick={() => handleEventClick(event.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                          View Details
                          <FiArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Pagination */}
              <div className="mt-10 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to{' '}
                      <span className="font-medium">{Math.min(filteredEvents.length, 12)}</span> of{' '}
                      <span className="font-medium">{filteredEvents.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                        <span className="sr-only">Previous</span>
                        <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        aria-current="page"
                        className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        1
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                        2
                      </button>
                      <button className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex">
                        3
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                        ...
                      </span>
                      <button className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex">
                        8
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                        9
                      </button>
                      <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                        <span className="sr-only">Next</span>
                        <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || activeFilters > 0
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Check back later for upcoming events.'}
              </p>
              <div className="mt-6">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <FiRefreshCw className="-ml-0.5 mr-1.5 h-4 w-4" />
                  Reset filters
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Filters Panel */}
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <FiX className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Filters */}
                <form className="mt-4 border-t border-gray-200">
                  <Disclosure as="div" className="border-t border-gray-200 px-4 py-6">
                    {({ open }) => (
                      <>
                        <h3 className="-mx-2 -my-3 flow-root">
                          <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                            <span className="font-medium text-gray-900">Date</span>
                            <span className="ml-6 flex items-center">
                              {open ? (
                                <FiMinus className="h-5 w-5" aria-hidden="true" />
                              ) : (
                                <FiPlus className="h-5 w-5" aria-hidden="true" />
                              )}
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel className="pt-6">
                          <div className="space-y-6">
                            {filterOptions.date.map((option) => (
                              <div key={option.value} className="flex items-center">
                                <input
                                  id={`filter-date-${option.value}`}
                                  name="date"
                                  type="radio"
                                  checked={filters.date === option.value}
                                  onChange={() => handleFilterChange('date', option.value)}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label
                                  htmlFor={`filter-date-${option.value}`}
                                  className="ml-3 min-w-0 flex-1 text-gray-500"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>

                  <Disclosure as="div" className="border-t border-gray-200 px-4 py-6">
                    {({ open }) => (
                      <>
                        <h3 className="-mx-2 -my-3 flow-root">
                          <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                            <span className="font-medium text-gray-900">Price</span>
                            <span className="ml-6 flex items-center">
                              {open ? (
                                <FiMinus className="h-5 w-5" aria-hidden="true" />
                              ) : (
                                <FiPlus className="h-5 w-5" aria-hidden="true" />
                              )}
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel className="pt-6">
                          <div className="space-y-6">
                            {filterOptions.price.map((option) => (
                              <div key={option.value} className="flex items-center">
                                <input
                                  id={`filter-price-${option.value}`}
                                  name="price"
                                  type="radio"
                                  checked={filters.price === option.value}
                                  onChange={() => handleFilterChange('price', option.value)}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label
                                  htmlFor={`filter-price-${option.value}`}
                                  className="ml-3 min-w-0 flex-1 text-gray-500"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>

                  <div className="p-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    >
                      <FiRefreshCw className="mr-2 h-4 w-4" />
                      Reset all filters
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Search and Filters */}
      <div id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Found
              </h2>
              
              <div className="flex space-x-4">
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="date-asc">Date: Earliest First</option>
                    <option value="date-desc">Date: Latest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiFilter className="mr-2 h-4 w-4" />
                  {showFilters ? 'Hide Filters' : 'Filters'}
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-base"
                  placeholder="Search events by name, location, or organizer"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="this-week">This Week</option>
                      <option value="this-month">This Month</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past Events</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                    >
                      <option value="all">All Categories</option>
                      {categories.filter(cat => cat !== 'all').map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                    >
                      <option value="all">All Prices</option>
                      <option value="0-0">Free</option>
                      <option value="1-500">Under ₹500</option>
                      <option value="501-1000">₹501 - ₹1,000</option>
                      <option value="1001-2000">₹1,001 - ₹2,000</option>
                      <option value="2001-5000">₹2,001 - ₹5,000</option>
                      <option value="5001-100000">Over ₹5,000</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => handleEventClick(event._id)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.imageUrl || 'https://via.placeholder.com/400x200?text=Event+Image'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=Event+Image';
                    }}
                  />
                  {event.isFeatured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                      Featured
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div className="flex items-center space-x-2">
                      <div className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {event.category || 'Event'}
                      </div>
                      {event.isFree && (
                        <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                          Free
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{event.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {event.organizer?.name || 'Organizer'}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-lg font-bold text-indigo-600">
                        {event.ticketPrice > 0 ? `₹${event.ticketPrice}` : 'Free'}
                      </div>
                      {event.ticketPrice > 0 && event.earlyBirdPrice && (
                        <div className="text-xs text-gray-500 line-through">
                          ₹{event.earlyBirdPrice}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="mr-2 h-4 w-4" />
                      <span>
                        {format(new Date(event.startDate), 'MMM d, yyyy')}
                        {event.endDate && ` - ${format(new Date(event.endDate), 'MMM d, yyyy')}`}
                      </span>
                    </div>
                    {event.location && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <FiMapPin className="mr-2 h-4 w-4" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {event.attendees && event.attendees.slice(0, 3).map((attendee, idx) => (
                        <img
                          key={idx}
                          className="h-8 w-8 rounded-full border-2 border-white"
                          src={attendee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name)}&background=random`}
                          alt={attendee.name}
                        />
                      ))}
                      {event.attendeesCount > 3 && (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-medium text-indigo-700">
                          +{event.attendeesCount - 3}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event._id);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Details
                      <FiArrowRight className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <div className="mt-6">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Find and book events in just a few simple steps
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Find Events</h3>
                <p className="mt-2 text-gray-600">
                  Browse through our extensive collection of events or use our advanced search to find exactly what you're looking for.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9m11 4v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0V9a2 2 0 00-2-2h-2m-2 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m4 0h6m-6 0h6m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Book Tickets</h3>
                <p className="mt-2 text-gray-600">
                  Select your preferred tickets and complete the secure checkout process in just a few clicks.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Enjoy the Event</h3>
                <p className="mt-2 text-gray-600">
                  Receive your e-tickets via email and get ready to enjoy an amazing experience!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;

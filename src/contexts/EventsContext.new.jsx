import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import eventAPI from '../services/eventService';

// Create context
const EventsContext = createContext();

// Custom hook to use the events context
export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

// Mock data for development
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Tech Conference 2025',
    description: 'Annual technology conference featuring the latest in web development and design.',
    startDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    location: 'Convention Center, New York',
    category: 'conference',
    image: 'https://source.unsplash.com/random/800x600/?conference',
    price: 199,
    capacity: 500,
    availableTickets: 350,
    organizer: { name: 'Tech Events Inc.' }
  },
  {
    id: '2',
    title: 'Blockchain Workshop',
    description: 'Hands-on workshop about blockchain technology and smart contracts.',
    startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 6).toISOString(),
    location: 'Innovation Hub, San Francisco',
    category: 'workshop',
    image: 'https://source.unsplash.com/random/800x600/?blockchain',
    price: 99,
    capacity: 50,
    availableTickets: 25,
    organizer: { name: 'Blockchain Academy' }
  },
  {
    id: '3',
    title: 'Music Festival',
    description: 'Weekend music festival with top artists from around the world.',
    startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 12).toISOString(),
    location: 'Central Park, New York',
    category: 'music',
    image: 'https://source.unsplash.com/random/800x600/?music-festival',
    price: 149,
    capacity: 5000,
    availableTickets: 1200,
    organizer: { name: 'Music Events Worldwide' }
  }
];

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Clear error state
  const clearError = useCallback(() => setError(null), []);

  // Fetch all events
  const fetchEvents = useCallback(async (filters = {}, options = {}) => {
    const { skipLoading = false } = options;
    
    try {
      if (!skipLoading) {
        setLoading(true);
        clearError();
      }

      console.log('Fetching events with filters:', filters);
      
      // In development, use mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock events data in development mode');
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setEvents(MOCK_EVENTS);
        setLoading(false);
        setInitialLoad(false);
        return MOCK_EVENTS;
      }
      
      // In production, make the actual API call
      const response = await eventAPI.getEvents('');
      console.log('API Response:', response);
      
      // Process the response
      let eventsData = [];
      
      if (Array.isArray(response)) {
        eventsData = response;
      } else if (response?.data?.events && Array.isArray(response.data.events)) {
        eventsData = response.data.events;
      } else if (response?.events && Array.isArray(response.events)) {
        eventsData = response.events;
      } else if (response?.data && Array.isArray(response.data)) {
        eventsData = response.data;
      } else if (response && response.id) {
        // Single event object
        eventsData = [response];
      }
      
      console.log(`Extracted ${eventsData.length} events from API response`);
      
      // Set the events in state
      setEvents(eventsData);
      setLoading(false);
      setInitialLoad(false);
      return eventsData;
      
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to fetch events');
      setLoading(false);
      setInitialLoad(false);
      
      // In development, return mock data even on error
      if (process.env.NODE_ENV === 'development') {
        console.log('Falling back to mock data due to error');
        setEvents(MOCK_EVENTS);
        return MOCK_EVENTS;
      }
      
      return [];
    }
  }, []);

  // Load events on component mount
  useEffect(() => {
    if (initialLoad) {
      fetchEvents();
    }
  }, [fetchEvents, initialLoad]);

  // Create the context value
  const value = {
    events,
    loading,
    error,
    fetchEvents,
    clearError
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};

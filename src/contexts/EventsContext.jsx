import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
  useMemo,
} from 'react';
import eventAPI from '../services/eventService';
import { toast } from 'react-toastify';

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
    _id: '1',
    title: 'Tech Conference 2025',
    description: 'Annual technology conference featuring the latest in web development and design.',
    startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    location: 'Convention Center, New York',
    category: 'conference',
    image: 'https://source.unsplash.com/random/800x600/?conference',
    price: 199,
    capacity: 500,
    availableTickets: 350,
    organizer: { name: 'Tech Events Inc.' },
  },
  {
    _id: '2',
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
    organizer: { name: 'Blockchain Academy' },
  },
  {
    _id: '3',
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
    organizer: { name: 'Music Events Worldwide' },
  },
];

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const isMounted = useRef(true);

  // Use auth context if available (optional)
  // const { user, isAuthenticated } = useAuth?.() || {};

  // Mock auth for now
  const user = null;
  const isAuthenticated = false;

  // Success toast helper
  const handleSuccess = useCallback((message) => {
    toast.success(message);
  }, []);

  // Error handling helper
  const handleError = useCallback((error, defaultMessage = 'An error occurred') => {
    const errorMessage =
      error?.response?.data?.message || error?.message || defaultMessage;
    console.error('Error:', errorMessage, error);
    setError(errorMessage);
    toast.error(errorMessage);
    return errorMessage;
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch all events
  const fetchEvents = useCallback(
    async (filters = {}, options = {}) => {
      const { skipLoading = false } = options;

      try {
        if (!skipLoading) {
          setLoading(true);
          clearError();
        }

        // Always fetch from API, even in development
        console.log('Fetching events from API...');
        const response = await eventAPI.getEvents(filters);
        console.log('API response:', response);
        
        let eventsData = extractEventsArray(response);
        
        // If no events found, try with an empty filter to get all events
        if ((!eventsData || eventsData.length === 0) && Object.keys(filters).length > 0) {
          console.log('No events found with filters, trying without filters...');
          const allEventsResponse = await eventAPI.getEvents({});
          eventsData = extractEventsArray(allEventsResponse);
        }

        console.log(`Fetched ${eventsData?.length || 0} events`);
        setEvents(eventsData || []);
        setInitialLoad(false);
        return eventsData || [];
      } catch (error) {
        handleError(error, 'Failed to fetch events');
        setEvents([]);
        return [];
      } finally {
        if (!skipLoading) setLoading(false);
      }
    },
    [handleError],
  );

  // Extract events array from various API response shapes
  const extractEventsArray = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response?.data?.events && Array.isArray(response.data.events)) return response.data.events;
    if (response?.events && Array.isArray(response.events)) return response.events;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response && (response._id || response.id)) return [response];
    return [];
  };

  // Get event by ID
  const getEventById = useCallback(
    async (eventId) => {
      if (!eventId) return null;

      const cached = events.find((e) => e._id === eventId || e.id === eventId);
      if (cached) return cached;

      try {
        const eventData = await eventAPI.getEvent(eventId);
        const event = extractEventsArray(eventData)[0];

        if (event) {
          setEvents((prev) =>
            prev.some((e) => e._id === event._id)
              ? prev.map((e) => (e._id === event._id ? event : e))
              : [...prev, event],
          );
        }
        return event || null;
      } catch (error) {
        handleError(error, 'Failed to fetch event');
        return null;
      }
    },
    [events, handleError],
  );

  // Create new event
  const createEvent = useCallback(
    async (eventData) => {
      try {
        const response = await eventAPI.createEvent(eventData);
        const newEvent = extractEventsArray(response)[0];

        if (!newEvent) throw new Error('Invalid event data');

        setEvents((prev) => [newEvent, ...prev]);
        handleSuccess('Event created successfully');
        return newEvent;
      } catch (error) {
        handleError(error, 'Failed to create event');
        throw error;
      }
    },
    [handleError, handleSuccess],
  );

  // Update event
  const updateEvent = useCallback(
    async (eventId, eventData) => {
      try {
        const response = await eventAPI.updateEvent(eventId, eventData);
        const updatedEvent = extractEventsArray(response)[0] || response.data?.event;

        if (!updatedEvent) throw new Error('Invalid response');

        setEvents((prev) =>
          prev.map((e) => (e._id === eventId ? { ...e, ...updatedEvent } : e)),
        );
        handleSuccess('Event updated successfully');
        return updatedEvent;
      } catch (error) {
        handleError(error, 'Failed to update event');
        throw error;
      }
    },
    [handleError, handleSuccess],
  );

  // Delete event
  const deleteEvent = useCallback(
    async (eventId) => {
      try {
        await eventAPI.deleteEvent(eventId);
        setEvents((prev) => prev.filter((e) => e._id !== eventId));
        handleSuccess('Event deleted successfully');
        return true;
      } catch (error) {
        handleError(error, 'Failed to delete event');
        throw error;
      }
    },
    [handleError, handleSuccess],
  );

  // Fetch user tickets
  const fetchUserTickets = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUserTickets([]);
      return [];
    }

    try {
      const tickets = await eventAPI.getMyTickets();
      const ticketsArray = Array.isArray(tickets) ? tickets : [];

      const sorted = [...ticketsArray].sort((a, b) => {
        const dateA = new Date(a.event?.startDate || a.eventDate || 0);
        const dateB = new Date(b.event?.startDate || b.eventDate || 0);
        return dateB - dateA;
      });

      setUserTickets(sorted);
      return sorted;
    } catch (error) {
      handleError(error, 'Failed to load your tickets');
      setUserTickets([]);
      return [];
    }
  }, [isAuthenticated, user, handleError]);

  // Fetch pending tickets (organizer)
  const fetchPendingTickets = useCallback(
    async (eventId) => {
      if (!isAuthenticated || !user) throw new Error('Login required');
      if (!eventId) throw new Error('Event ID required');

      try {
        const tickets = await eventAPI.getPendingTickets(eventId);
        setPendingTickets(tickets || []);
        return tickets;
      } catch (error) {
        handleError(error, 'Failed to load pending tickets');
        throw error;
      }
    },
    [isAuthenticated, user, handleError],
  );

  // Purchase ticket
  const purchaseTicket = useCallback(
    async (eventId, quantity = 1) => {
      try {
        const response = await eventAPI.purchaseTicket(eventId, { quantity });
        const newTicket = response.ticket || response.data?.ticket || response;

        const ticketsToAdd = Array.isArray(newTicket) ? newTicket : [newTicket];

        setUserTickets((prev) => [...ticketsToAdd, ...prev]);

        setEvents((prev) =>
          prev.map((e) =>
            e._id === eventId
              ? { ...e, availableTickets: Math.max(0, (e.availableTickets || 0) - quantity) }
              : e,
          ),
        );

        await fetchUserTickets();
        handleSuccess('Ticket purchased!');
        return ticketsToAdd;
      } catch (error) {
        handleError(error, 'Failed to purchase ticket');
        throw error;
      }
    },
    [fetchUserTickets, handleError, handleSuccess],
  );

  // Format price
  const formatPrice = useCallback((price) => {
    if (price === 0 || price === '0') return 'Free';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  // Load initial data
  useEffect(() => {
    if (!isMounted.current) return;

    const load = async () => {
      await fetchEvents({}, { skipLoading: true });
      if (isAuthenticated) await fetchUserTickets();
      setLoading(false);
    };

    load();

    return () => {
      isMounted.current = false;
    };
  }, [fetchEvents, fetchUserTickets, isAuthenticated]);

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      events,
      userTickets,
      pendingTickets,
      loading,
      error,
      fetchEvents,
      getEventById,
      createEvent,
      updateEvent,
      deleteEvent,
      fetchUserTickets,
      fetchPendingTickets,
      purchaseTicket,
      formatPrice,
      clearError,
    }),
    [
      events,
      userTickets,
      pendingTickets,
      loading,
      error,
      fetchEvents,
      getEventById,
      createEvent,
      updateEvent,
      deleteEvent,
      fetchUserTickets,
      fetchPendingTickets,
      purchaseTicket,
      formatPrice,
      clearError,
    ],
  );

  return <EventsContext.Provider value={contextValue}>{children}</EventsContext.Provider>;
};
import React, { createContext, useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import eventAPI from '../services/eventService';
import { useAuth } from './AuthContext';
import useApiErrorHandler from '../hooks/useApiErrorHandler';
import useErrorHandler from '../hooks/useErrorHandler';

const EventsContext = createContext();

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, isAuthenticated, isInitialized } = useAuth() || {};
  const isMounted = useRef(true);
  
  // Use the error handler hooks
  const { handleError, handleSuccess } = useErrorHandler();
  const { 
    handleApiCall: handleApiRequest, 
    isLoading: apiLoading, 
    error: apiError, 
    clearError: clearApiError 
  } = useApiErrorHandler();

  // Clear error state
  const clearError = useCallback(() => setError(null), []);

  // Set loading state
  const setLoadingState = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  // Fetch all events with optional filters and pagination
  const fetchEvents = useCallback(async (filters = {}, options = {}) => {
    const { skipLoading = false } = options; // Remove requireAuth as it's no longer needed
    
    try {
      if (!skipLoading) {
        setLoading(true);
        clearError();
      }
      
      console.log('Fetching public events with filters:', filters);
      
      // Create a clean filters object with only valid values
      const cleanFilters = {
        limit: 100, // Increase limit to ensure we get all events
        includePast: 'true' // Always include past events
      };
      
      // Add user-provided filters, overriding defaults if needed
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanFilters[key] = value;
        }
      });
      
      // Add cache buster as a query parameter
      const queryString = new URLSearchParams({
        ...cleanFilters,
        _t: Date.now() // Cache buster
      }).toString();
      
      console.log('Making API request with params:', queryString);
      const response = await handleApiRequest(() => 
        eventAPI.getEvents(queryString ? `?${queryString}` : '')
      );
      
      console.log('Raw API response:', response);
      
      // Safely extract events array from response
      const eventsArray = getEventsArrayFromResponse(response);
      
      if (!Array.isArray(eventsArray)) {
        console.error('Invalid events data received:', { 
          responseType: typeof response,
          responseKeys: response ? Object.keys(response) : 'no response',
          eventsArray,
          isArray: Array.isArray(eventsArray)
        });
        throw new Error('Invalid events data received from server');
      }
      
      console.log(`Processed ${eventsArray.length} events`);
      
      // Update events state
      setEvents(eventsArray);
      
      if (import.meta.env.DEV) {
        console.log(`Fetched ${eventsArray.length} events`);
        if (eventsArray.length > 0) {
          console.log('Sample event:', eventsArray[0]);
        } else {
          console.warn('No events found in the response');
        }
      }
      
      return eventsArray;
    } catch (error) {
      console.error('Error fetching events:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch events';
      setError(errorMessage);
      handleError(error, 'Failed to fetch events');
      return [];
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  }, [handleApiRequest, handleError, clearError]);

  // Get a single event by ID
  const getEventById = useCallback(async (eventId) => {
    if (!eventId) {
      console.error('No event ID provided to getEventById');
      return null;
    }

    try {
      // Check if we already have the event in our cache
      const cachedEvent = events.find(event => event._id === eventId);
      if (cachedEvent) {
        return cachedEvent;
      }
      
      // Fetch the event from the API
      const eventData = await handleApiRequest(() => 
        eventAPI.getEvent(eventId)
      );
      
      if (!eventData) {
        console.warn(`Event not found: ${eventId}`);
        return null;
      }
      
      // Update the events array with the new event
      setEvents(prevEvents => {
        const exists = prevEvents.some(e => e._id === eventData._id);
        return exists 
          ? prevEvents.map(e => e._id === eventData._id ? eventData : e)
          : [...prevEvents, eventData];
      });
      
      return eventData;
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      setError(`Failed to fetch event: ${error.message}`);
      handleError(error, 'Failed to fetch event details');
      return null;
    }
  }, [events, handleApiRequest, handleError]);

  // Helper function to safely get an array from various response formats
  const getEventsArrayFromResponse = (response) => {
    console.group('Processing API response');
    console.log('Raw response:', response);
    
    try {
      // If response is falsy, return empty array
      if (!response) {
        console.warn('Empty response received');
        return [];
      }
      
      // If response is already an array, return it
      if (Array.isArray(response)) {
        console.log('Response is already an array, returning as is');
        return response;
      }
      
      // Log the response structure for debugging
      console.log('Response structure:', {
        isArray: Array.isArray(response),
        isObject: typeof response === 'object',
        keys: response ? Object.keys(response) : 'no keys',
        response: response
      });
      
      // Handle the current backend format: { status: 'success', data: { events: [...] } }
      if (response.status === 'success' && response.data && response.data.events && Array.isArray(response.data.events)) {
        console.log('Found events array in response.data.events');
        return response.data.events;
      }
      
      // Handle the case where the response has a 'data' object with an 'events' array
      // This matches the format: { status: 'success', data: { events: [...] } }
      if (response.data?.events && Array.isArray(response.data.events)) {
        console.log('Found events array in response.data.events');
        return response.data.events;
      }
      
      // Handle the case where the response has a 'data' property that's an array
      if (response.data && Array.isArray(response.data)) {
        console.log('Found events array in response.data');
        return response.data;
      }
      
      // Handle the case where the response has an 'events' property that's an array
      if (response.events && Array.isArray(response.events)) {
        console.log('Found events array in response.events');
        return response.events;
      }
      
      // Handle the case where the response is an object with an array of events
      const possibleArrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]));
      if (possibleArrayKeys.length > 0) {
        console.log(`Found potential array in response.${possibleArrayKeys[0]}`);
        return response[possibleArrayKeys[0]];
      }
      
      // Handle direct data array: { data: [...] }
      if (response?.data !== undefined) {
        if (Array.isArray(response.data)) {
          console.log('Found data array in response.data');
          return response.data;
        } else if (response.data) {
          console.log('Found non-array data in response.data, wrapping in array');
          return [response.data];
        }
      }
      
      // Handle direct events array at root: { events: [...] }
      if (response?.events !== undefined) {
        if (Array.isArray(response.events)) {
          console.log('Found events array directly in response');
          return response.events;
        } else if (response.events) {
          console.log('Found non-array events in response, wrapping in array');
          return [response.events];
        }
      }
      
      // Handle single event object
      if (response && typeof response === 'object' && (response._id || response.id)) {
        console.log('Found single event object, wrapping in array');
        return [response];
      }
      
      // If we have a response object but couldn't find events, log the structure
      if (response && typeof response === 'object') {
        console.warn('Could not find events array in response, checking for any array properties');
        // Check if any property is an array
        const arrayProp = Object.values(response).find(prop => Array.isArray(prop));
        if (arrayProp) {
          console.log(`Found array property: ${Object.keys(response).find(key => response[key] === arrayProp)}`);
          return arrayProp;
        }
      }
      
      // If we get here, we couldn't find any events
      console.warn('No events found in response, returning empty array');
      return [];
    } catch (error) {
      console.error('Error processing API response:', error);
      return [];
    } finally {
      console.groupEnd();
    }
  };

  // Create a new event
  const createEvent = useCallback(async (eventData) => {
    try {
      const eventWithOrganizer = user 
        ? { ...eventData, organizer: user.id }
        : eventData;
      
      const response = await eventAPI.createEvent(eventWithOrganizer);
      
      // Handle the nested response format: { success: true, data: { event: {...} } }
      const newEvent = response.data?.event || response;
      
      if (!newEvent) {
        throw new Error('Failed to create event: Invalid response from server');
      }
      
      // Add the new event to the events array
      setEvents(prevEvents => [...prevEvents, newEvent]);
      
      handleSuccess('Event created successfully');
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      handleError(error, 'Failed to create event');
      throw error;
    }
  }, [user, handleError, handleSuccess]);

  // Update an event
  const updateEvent = useCallback(async (eventId, eventData) => {
    try {
      const response = await eventAPI.updateEvent(eventId, eventData);
      
      // Handle the nested response format: { success: true, data: { event: {...} } }
      const updatedEvent = response.data?.event || response;
      
      if (!updatedEvent) {
        throw new Error('Failed to update event: Invalid response from server');
      }
      
      // Update the events list
      setEvents(prev => 
        prev.map(event => event._id === eventId ? { ...event, ...updatedEvent } : event)
      );
      
      handleSuccess('Event updated successfully');
      return updatedEvent;
    } catch (error) {
      console.error(`Error updating event ${eventId}:`, error);
      handleError(error, 'Failed to update event');
      throw error;
    }
  }, [handleError, handleSuccess]);

  // Delete an event
  const deleteEvent = useCallback(async (eventId) => {
    try {
      const response = await eventAPI.deleteEvent(eventId);
      
      // Handle the nested response format: { success: true, data: { event: {...} } }
      const deletedEvent = response.data?.event || response;
      
      if (!deletedEvent) {
        throw new Error('Failed to delete event: Invalid response from server');
      }
      
      // Remove the event from the events list
      setEvents(prev => prev.filter(event => event._id !== eventId));
      
      handleSuccess('Event deleted successfully');
      return deletedEvent;
    } catch (error) {
      console.error(`Error deleting event ${eventId}:`, error);
      handleError(error, 'Failed to delete event');
      throw error;
    }
  }, [handleError, handleSuccess]);

  // Fetch user's tickets
  const fetchUserTickets = useCallback(async () => {
    if (!user) {
      setUserTickets([]);
      return [];
    }
    
    try {
      const tickets = await eventAPI.getMyTickets();
      
      // Ensure we're working with an array
      const ticketsArray = Array.isArray(tickets) ? tickets : [];
      
      // Update state with the tickets
      setUserTickets(ticketsArray);
      return ticketsArray;
    } catch (error) {
      console.error('Error in fetchUserTickets:', error);
      setUserTickets([]);
      handleError(error, 'Failed to load your tickets');
      return [];
    }
  }, [handleError, user]);

  // Fetch pending tickets for a specific event (for organizers)
  const fetchPendingTickets = useCallback(async (eventId) => {
    if (!user) {
      throw new Error('You must be logged in to fetch pending tickets');
    }
    
    if (!eventId) {
      throw new Error('Event ID is required to fetch pending tickets');
    }
    
    try {
      const tickets = await eventAPI.getPendingTickets(eventId);
      setPendingTickets(tickets);
      return tickets;
    } catch (error) {
      handleError(error, 'Failed to load pending tickets');
      throw error;
    }
  }, [handleError, user]);

  // Submit ticket for approval
  const submitTicketForApproval = useCallback(async (ticketData) => {
    if (!user) {
      const error = new Error('You must be logged in to submit a ticket');
      handleError(error);
      throw error;
    }
    
    try {
      const ticket = await eventAPI.createTicket(ticketData.eventId, {
        ...ticketData,
        status: 'pending',
        owner: user.id,
      });
      
      // Update the user's tickets
      setUserTickets(prev => [ticket, ...prev]);
      
      // If this is the current user's own event, add to pending tickets
      if (ticket.event.organizer === user.id) {
        setPendingTickets(prev => [ticket, ...prev]);
      }
      
      handleSuccess('Ticket submitted for approval');
      return ticket;
    } catch (error) {
      handleError(error, 'Failed to submit ticket for approval');
      throw error;
    }
  }, [handleError, handleSuccess, user]);

  // Approve ticket (for organizers)
  const approveTicket = useCallback(async (ticketId) => {
    try {
      const ticket = await eventAPI.approveTicket(ticketId);
      
      // Update the ticket in the pending tickets list
      setPendingTickets(prev => 
        prev.filter(t => t._id !== ticketId)
      );
      
      // Update the ticket in the user's tickets list if it exists there
      setUserTickets(prev => 
        prev.map(t => t._id === ticketId ? { ...t, status: 'approved' } : t)
      );
      
      handleSuccess('Ticket approved successfully');
      return ticket;
    } catch (error) {
      handleError(error, 'Failed to approve ticket');
      throw error;
    }
  }, [handleError, handleSuccess]);

  // Reject ticket (for organizers)
  const rejectTicket = useCallback(async (ticketId, reason) => {
    try {
      const ticket = await eventAPI.rejectTicket(ticketId, { reason });
      
      // Update the ticket in the pending tickets list
      setPendingTickets(prev => 
        prev.filter(t => t._id !== ticketId)
      );
      
      // Update the ticket in the user's tickets list if it exists there
      setUserTickets(prev => 
        prev.map(t => t._id === ticketId ? { ...t, status: 'rejected', rejectionReason: reason } : t)
      );
      
      handleSuccess('Ticket rejected successfully');
      return ticket;
    } catch (error) {
      handleError(error, 'Failed to reject ticket');
      throw error;
    }
  }, [handleError, handleSuccess]);

  // Validate ticket (for organizers)
  const validateTicket = useCallback(async (ticketId) => {
    try {
      const validation = await eventAPI.validateTicket(ticketId);
      
      // Update the ticket in the user's tickets list if it exists there
      setUserTickets(prev => 
        prev.map(t => t._id === ticketId ? { ...t, status: 'used', usedAt: new Date() } : t)
      );
      
      handleSuccess('Ticket validated successfully');
      return validation;
    } catch (error) {
      handleError(error, 'Failed to validate ticket');
      throw error;
    }
  }, [handleError, handleSuccess]);

  // List ticket for resale
  const listTicketForResale = useCallback(async (ticketId, price) => {
    try {
      const ticket = await eventAPI.listTicketForResale(ticketId, { price });
      
      // Update the ticket in the user's tickets list
      setUserTickets(prev => 
        prev.map(t => t._id === ticketId ? { ...t, status: 'resale', resalePrice: price } : t)
      );
      
      handleSuccess('Ticket listed for resale successfully');
      return ticket;
    } catch (error) {
      handleError(error, 'Failed to list ticket for resale');
      throw error;
    }
  }, [handleError, handleSuccess]);

  // Purchase resale ticket
  const purchaseResaleTicket = useCallback(async (ticketId) => {
    try {
      const result = await eventAPI.purchaseResaleTicket(ticketId);
      
      if (result.success) {
        // Remove the ticket from the current user's tickets (if it was in resale)
        setUserTickets(prev => 
          prev.filter(t => t._id !== ticketId)
        );
        
        // Add the ticket to the current user's tickets
        setUserTickets(prev => [result.ticket, ...prev]);
        
        handleSuccess('Ticket purchased successfully');
        return result;
      } else {
        throw new Error(result.error || 'Failed to purchase ticket');
      }
    } catch (error) {
      handleError(error, 'Failed to purchase ticket');
      return { success: false, error: error.message };
    }
  }, [handleError, handleSuccess]);

  // Cancel ticket
  const cancelTicket = useCallback(async (ticketId) => {
    try {
      await eventAPI.cancelTicket(ticketId);
      
      // Remove the ticket from the user's tickets list
      setUserTickets(prev => 
        prev.filter(t => t._id !== ticketId)
      );
      
      // Also remove from pending tickets if it's there
      setPendingTickets(prev => 
        prev.filter(t => t._id !== ticketId)
      );
      
      handleSuccess('Ticket cancelled successfully');
      return true;
    } catch (error) {
      handleError(error, 'Failed to cancel ticket');
      throw error;
    }
  }, [handleError, handleSuccess]);

  // Mark ticket as used
  const markTicketAsUsed = useCallback(async (ticketId) => {
    try {
      const ticket = await eventAPI.validateTicket(ticketId, { markAsUsed: true });
      
      // Update the ticket in the user's tickets list if it exists there
      setUserTickets(prev => 
        prev.map(t => t._id === ticketId ? { ...t, status: 'used', usedAt: new Date() } : t)
      );
      
      handleSuccess('Ticket marked as used');
      return ticket;
    } catch (error) {
      handleError(error, 'Failed to mark ticket as used');
      throw error;
    }
  }, [handleError, handleSuccess]);

  // Load events on component mount and when auth state changes
  useEffect(() => {
    const loadData = async () => {
      // Only try to load events if auth is initialized
      if (!isInitialized) {
        console.log('Auth not initialized yet, skipping event load');
        return;
      }
      
      // Only try to load events if user is authenticated
      if (!isAuthenticated()) {
        console.log('User not authenticated, skipping event load');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Loading events...');
        await fetchEvents({}, { skipLoading: true });
      } catch (error) {
        console.error('Error in loadData:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isMounted.current) {
      loadData();
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchEvents, fetchUserTickets, user]);
  
  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearApiError();
    };
  }, [clearApiError]);

  // Handle error dismissal
  const dismissError = useCallback(() => {
    clearApiError();
  }, [clearApiError]);

  // Purchase a ticket for an event
  const purchaseTicket = useCallback(async (eventId, quantity = 1) => {
    try {
      const response = await eventAPI.purchaseTicket(eventId, { quantity });
      
      // Update the user's tickets list
      if (response && response.data) {
        const newTicket = response.data.ticket || response.data;
        setUserTickets(prevTickets => [...prevTickets, newTicket]);
        
        // Also update the event's available tickets count
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event._id === eventId 
              ? { ...event, availableTickets: event.availableTickets - quantity }
              : event
          )
        );
        
        handleSuccess('Ticket purchased successfully!');
        return newTicket;
      }
      
      throw new Error('Failed to purchase ticket');
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      handleError(error, 'Failed to purchase ticket');
      throw error;
    }
  }, [handleError, handleSuccess]);

  // Format price with 2 decimal places and currency symbol
  const formatPrice = (price) => {
    if (price === 0 || price === '0') return 'Free';
    return `$${Number(price).toFixed(2)}`;
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    events,
    userTickets,
    pendingTickets,
    loading,
    error,
    dismissError,
    fetchEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchUserTickets,
    fetchPendingTickets,
    submitTicketForApproval,
    approveTicket,
    rejectTicket,
    validateTicket,
    listTicketForResale,
    purchaseResaleTicket,
    purchaseTicket,
    cancelTicket,
    markTicketAsUsed,
    formatPrice, // Add the formatPrice function to the context value
  }), [
    events,
    userTickets,
    pendingTickets,
    loading,
    error,
    dismissError,
    fetchEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchUserTickets,
    fetchPendingTickets,
    submitTicketForApproval,
    approveTicket,
    rejectTicket,
    validateTicket,
    listTicketForResale,
    purchaseResaleTicket,
    cancelTicket,
    markTicketAsUsed,
    formatPrice,
  ]);

  return (
    <EventsContext.Provider value={contextValue}>
      {children}
    </EventsContext.Provider>
  );
};
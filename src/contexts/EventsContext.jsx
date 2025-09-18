import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import eventAPI from '../services/eventService';
import { useAuth } from './AuthContext';
import useApiErrorHandler from '../hooks/useApiErrorHandler';
import useErrorHandler from '../hooks/useErrorHandler';

const EventsContext = createContext();

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const { user } = useAuth() || {};
  
  // Use the error handler hooks
  const { handleError, handleSuccess } = useErrorHandler();
  const { 
    handleApiCall, 
    isLoading: loading, 
    error, 
    clearError 
  } = useApiErrorHandler();

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
        console.log('Returning cached event:', cachedEvent._id);
        return cachedEvent;
      }
      
      console.log('Fetching event from API:', eventId);
      const eventData = await eventAPI.getEvent(eventId);
      
      // If event is not found, return null
      if (!eventData) {
        console.warn(`Event not found: ${eventId}`);
        return null;
      }
      
      console.log('Fetched event:', eventData._id);
      
      // Update the events array with the new event
      setEvents(prevEvents => {
        const exists = prevEvents.some(e => e._id === eventData._id);
        const updatedEvents = exists 
          ? prevEvents.map(e => e._id === eventData._id ? eventData : e)
          : [...prevEvents, eventData];
        
        console.log('Updated events list with new event');
        return updatedEvents;
      });
      
      return eventData;
    } catch (error) {
      console.error('Error in getEventById:', {
        eventId,
        error: error.message,
        stack: error.stack
      });
      console.error('Error fetching event:', error);
      handleError(error, 'Failed to fetch event details');
      throw error;
    }
  }, [events, handleError]);

  // Fetch all events with optional filters
  const fetchEvents = useCallback(async (filters = {}) => {
    try {
      const response = await eventAPI.getEvents(filters);
      
      // Handle the nested response format: { success: true, results: number, data: { events: [...] } }
      if (response && response.data && Array.isArray(response.data.events)) {
        setEvents(response.data.events);
        return response.data.events;
      } 
      // Fallback to direct array if the nested format changes
      else if (Array.isArray(response)) {
        setEvents(response);
        return response;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
      handleError(error, 'Failed to fetch events');
      throw error;
    }
  }, [handleError]);


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

  // Fetch pending tickets (for organizers)
  const fetchPendingTickets = useCallback(async () => {
    if (!user) return;
    
    try {
      const tickets = await eventAPI.getPendingTickets();
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

  // Load initial data when the user is authenticated
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        await fetchEvents();
        
        if (user) {
          await fetchUserTickets();
          
          // If user is an organizer, fetch pending tickets
          if (user.role === 'organizer') {
            await fetchPendingTickets();
          }
        }
      } catch (error) {
        // Errors are already handled by the individual fetch functions
        console.error('Failed to load initial data:', error);
      }
    };

    if (isMounted) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchEvents, fetchUserTickets, fetchPendingTickets, user]);
  
  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Handle error dismissal
  const dismissError = useCallback(() => {
    clearError();
  }, [clearError]);

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
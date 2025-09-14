import React, { createContext, useContext, useState, useEffect } from 'react';

const EventsContext = createContext();

export const useEvents = () => useContext(EventsContext);

// Helper function to format price in INR
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

// Production: No mock event data
const mockEvents = [];

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents([]);
        
        const storedTickets = localStorage.getItem('scantyx_user_tickets');
        if (storedTickets) {
          setUserTickets(JSON.parse(storedTickets));
        }

        const storedPendingTickets = localStorage.getItem('scantyx_pending_tickets');
        if (storedPendingTickets) {
          setPendingTickets(JSON.parse(storedPendingTickets));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getEventById = (eventId) => {
    return events.find(event => event.id === eventId);
  };

  const createEvent = (eventData) => {
    const newEvent = {
      id: 'evt_' + Math.random().toString(36).substr(2, 9),
      ...eventData,
      availableTickets: parseInt(eventData.availableTickets, 10),
      price: parseInt(eventData.price, 10),
      date: new Date(eventData.date).toISOString(),
      status: 'pending'
    };
    
    setEvents(prevEvents => [newEvent, ...prevEvents]);
    return newEvent;
  };

  const updateEvent = (eventId, updatedData) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId
          ? { ...event, ...updatedData }
          : event
      )
    );
  };

  const deleteEvent = (eventId) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
  };

  const submitTicketForApproval = (eventId, userId, quantity) => {
    const event = getEventById(eventId);
    if (!event || event.availableTickets < quantity) {
      return { success: false, message: 'Tickets not available' };
    }

    const pendingTicket = {
      id: 'tkt_' + Math.random().toString(36).substr(2, 9),
      eventId,
      eventTitle: event.title,
      userId,
      quantity,
      price: event.price,
      submissionDate: new Date().toISOString(),
      status: 'pending'
    };

    setPendingTickets(prev => [...prev, pendingTicket]);
    localStorage.setItem('scantyx_pending_tickets', JSON.stringify([...pendingTickets, pendingTicket]));

    return { success: true, ticket: pendingTicket };
  };

  const approveTicket = (ticketId) => {
    const pendingTicket = pendingTickets.find(t => t.id === ticketId);
    if (!pendingTicket) return { success: false, message: 'Ticket not found' };

    const event = getEventById(pendingTicket.eventId);
    if (!event || event.availableTickets < pendingTicket.quantity) {
      return { success: false, message: 'Not enough tickets available' };
    }

    const approvedTicket = {
      ...pendingTicket,
      approvalDate: new Date().toISOString(),
      qrData: `SCANTYX-${pendingTicket.eventId}-${Math.random().toString(36).substr(2, 16)}`,
      isUsed: false,
      isForSale: false,
      status: 'approved'
    };

    updateEvent(pendingTicket.eventId, {
      availableTickets: event.availableTickets - pendingTicket.quantity
    });

    setPendingTickets(prev => prev.filter(t => t.id !== ticketId));
    setUserTickets(prev => [...prev, approvedTicket]);

    localStorage.setItem('scantyx_pending_tickets', JSON.stringify(pendingTickets.filter(t => t.id !== ticketId)));
    localStorage.setItem('scantyx_user_tickets', JSON.stringify([...userTickets, approvedTicket]));

    return { success: true, ticket: approvedTicket };
  };

  const rejectTicket = (ticketId) => {
    setPendingTickets(prev => prev.filter(t => t.id !== ticketId));
    localStorage.setItem('scantyx_pending_tickets', JSON.stringify(pendingTickets.filter(t => t.id !== ticketId)));
    return { success: true };
  };

  const purchaseTicket = (eventId, quantity = 1) => {
    const event = getEventById(eventId);
    if (!event || event.availableTickets < quantity) {
      return { success: false, message: 'Tickets not available' };
    }

    const newTicket = {
      id: 'tkt_' + Math.random().toString(36).substr(2, 9),
      eventId,
      eventTitle: event.title,
      purchaseDate: new Date().toISOString(),
      price: event.price,
      qrData: `SCANTYX-${eventId}-${Math.random().toString(36).substr(2, 16)}`,
      isUsed: false,
      isForSale: false,
      resalePrice: null
    };

    setEvents(prevEvents => 
      prevEvents.map(e => 
        e.id === eventId 
          ? { ...e, availableTickets: e.availableTickets - quantity } 
          : e
      )
    );

    const updatedTickets = [...userTickets, newTicket];
    setUserTickets(updatedTickets);
    
    localStorage.setItem('scantyx_user_tickets', JSON.stringify(updatedTickets));

    return { success: true, ticket: newTicket };
  };

  const validateTicket = (qrData) => {
    const ticket = userTickets.find(t => t.qrData === qrData);
    
    if (!ticket) {
      return { success: false, message: 'Invalid ticket' };
    }
    
    if (ticket.isUsed) {
      return { success: false, message: 'Ticket already used' };
    }
    
    const updatedTickets = userTickets.map(t => 
      t.id === ticket.id ? { ...t, isUsed: true } : t
    );
    
    setUserTickets(updatedTickets);
    localStorage.setItem('scantyx_user_tickets', JSON.stringify(updatedTickets));
    
    return { 
      success: true, 
      message: 'Ticket validated successfully',
      ticket
    };
  };

  const listTicketForResale = (ticketId, resalePrice) => {
    const ticket = userTickets.find(t => t.id === ticketId);
    
    if (!ticket || ticket.isUsed) {
      return { success: false, message: 'Cannot resell this ticket' };
    }
    
    const updatedTickets = userTickets.map(t => 
      t.id === ticketId 
        ? { ...t, isForSale: true, resalePrice: parseInt(resalePrice, 10) } 
        : t
    );
    
    setUserTickets(updatedTickets);
    localStorage.setItem('scantyx_user_tickets', JSON.stringify(updatedTickets));
    
    return { success: true, message: 'Ticket listed for resale' };
  };

  const purchaseResaleTicket = (ticketId) => {
    const ticket = userTickets.find(t => t.id === ticketId && t.isForSale);
    
    if (!ticket) {
      return { success: false, message: 'Ticket not available for purchase' };
    }
    
    const updatedTickets = userTickets.map(t => 
      t.id === ticketId 
        ? { 
            ...t, 
            isForSale: false, 
            resalePrice: null,
            qrData: `SCANTYX-${t.eventId}-${Math.random().toString(36).substr(2, 16)}`,
          } 
        : t
    );
    
    setUserTickets(updatedTickets);
    localStorage.setItem('scantyx_user_tickets', JSON.stringify(updatedTickets));
    
    return { 
      success: true, 
      message: 'Resale ticket purchased successfully',
      ticket: updatedTickets.find(t => t.id === ticketId)
    };
  };

  const value = {
    events,
    loading,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    purchaseTicket,
    validateTicket,
    userTickets,
    listTicketForResale,
    purchaseResaleTicket,
    formatPrice,
    submitTicketForApproval,
    approveTicket,
    rejectTicket,
    pendingTickets
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};
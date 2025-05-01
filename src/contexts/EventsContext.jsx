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

// Mock event data
const mockEvents = [
  {
    id: 'evt_1',
    title: 'TechFest 2025',
    description: 'The biggest tech conference in India featuring the latest innovations and industry leaders.',
    date: '2025-03-15T09:00:00',
    location: 'Bangalore International Exhibition Centre',
    price: 1499,
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
    organizer: 'TechCorp India',
    availableTickets: 250,
    category: 'Technology',
    status: 'approved'
  },
  {
    id: 'evt_2',
    title: 'Music Fusion Festival',
    description: 'Experience the blend of classical and modern music with top artists from around the country.',
    date: '2025-04-22T18:30:00',
    location: 'JLN Stadium, Delhi',
    price: 999,
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
    organizer: 'Harmony Productions',
    availableTickets: 500,
    category: 'Music',
    status: 'approved'
  },
  {
    id: 'evt_3',
    title: 'Startup Summit 2025',
    description: 'Connect with investors, entrepreneurs and innovators at this premier startup event.',
    date: '2025-05-10T10:00:00',
    location: 'Hyderabad Convention Centre',
    price: 2499,
    image: 'https://images.pexels.com/photos/2182973/pexels-photo-2182973.jpeg',
    organizer: 'Venture Network',
    availableTickets: 150,
    category: 'Business',
    status: 'approved'
  },
  {
    id: 'evt_4',
    title: 'Culinary Masterclass',
    description: 'Learn from celebrity chefs and discover the secrets of Indian and international cuisines.',
    date: '2025-06-05T11:00:00',
    location: 'Grand Hyatt, Mumbai',
    price: 3999,
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
    organizer: 'Gourmet India',
    availableTickets: 75,
    category: 'Food',
    status: 'approved'
  },
  {
    id: 'evt_5',
    title: 'Yoga & Wellness Retreat',
    description: 'A weekend of mindfulness, yoga, and holistic wellness practices in a serene environment.',
    date: '2025-07-18T08:00:00',
    location: 'Rishikesh Retreat Centre',
    price: 5999,
    image: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg',
    organizer: 'Mindful Living',
    availableTickets: 40,
    category: 'Wellness',
    status: 'approved'
  },
  {
    id: 'evt_6',
    title: 'Digital Marketing Conference',
    description: 'Stay ahead of the curve with insights from digital marketing experts and industry leaders.',
    date: '2025-08-12T09:30:00',
    location: 'Leela Palace, Chennai',
    price: 1799,
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
    organizer: 'DigitalEdge',
    availableTickets: 200,
    category: 'Marketing',
    status: 'approved'
  }
];

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents(mockEvents);
        
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
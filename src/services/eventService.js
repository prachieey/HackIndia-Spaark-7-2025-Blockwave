import apiRequest from '../utils/api';

// Event API
export const eventAPI = {
  // Event endpoints
  getEvents: async (queryParams = {}) => {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await apiRequest(`/events?${queryString}`);
    // Return the nested events array if it exists, otherwise return the response as is
    return response?.data?.events || response || [];
  },

  getEvent: async (eventId) => {
    if (!eventId) {
      console.error('No event ID provided to getEvent');
      return null;
    }

    try {
      const response = await apiRequest(`/events/${eventId}`);
      
      // If response is null or undefined, the event doesn't exist
      if (!response) {
        console.warn(`Event not found: ${eventId}`);
        return null;
      }
      
      // Handle different response formats
      const eventData = response?.data?.event || response?.data || response;
      
      // If we still don't have valid event data, return null
      if (!eventData || !eventData._id) {
        console.warn('Invalid event data format:', { eventId, response });
        return null;
      }
      
      return eventData;
    } catch (error) {
      console.error('Error fetching event:', {
        eventId,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      
      // If the error is a 404, return null (event not found)
      if (error.response?.status === 404) {
        console.warn(`Event not found (404): ${eventId}`);
        return null;
      }
      
      // For other errors, re-throw to be handled by the caller
      throw error;
    }
  },

  createEvent: async (eventData) => {
    const response = await apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    // Return the nested event object if it exists, otherwise return the response as is
    return response?.data?.event || response || null;
  },

  updateEvent: async (eventId, eventData) => {
    const response = await apiRequest(`/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(eventData),
    });
    // Return the nested event object if it exists, otherwise return the response as is
    return response?.data?.event || response || null;
  },

  deleteEvent: async (eventId) => {
    const response = await apiRequest(`/events/${eventId}`, {
      method: 'DELETE',
    });
    // Return the nested event object if it exists, otherwise return the response as is
    return response?.data?.event || response || null;
  },

  getEventsByCategory: async (category) => {
    const response = await apiRequest(`/events/category/${category}`);
    // Return the nested events array if it exists, otherwise return the response as is
    return response?.data?.events || response || [];
  },

  getEventsByOrganizer: async (organizerId) => {
    const response = await apiRequest(`/events/organizer/${organizerId}`);
    // Return the nested events array if it exists, otherwise return the response as is
    return response?.data?.events || response || [];
  },

  getMyRegisteredEvents: async () => {
    const response = await apiRequest('/events/me/registered');
    // Return the nested events array if it exists, otherwise return the response as is
    return response?.data?.events || response || [];
  },

  getMyOrganizedEvents: async () => {
    const response = await apiRequest('/events/me/organizing');
    // Return the nested events array if it exists, otherwise return the response as is
    return response?.data?.events || response || [];
  },

  // Ticket endpoints
  createTicket: async (eventId, ticketData) => {
    const response = await apiRequest(`/events/${eventId}/tickets`, {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
    // Return the nested ticket object if it exists, otherwise return the response as is
    return response?.data?.ticket || response || null;
  },

  getTicket: async (ticketId) => {
    const response = await apiRequest(`/tickets/${ticketId}`);
    // Return the nested ticket object if it exists, otherwise return the response as is
    return response?.data?.ticket || response || null;
  },

  getMyTickets: async () => {
    try {
      console.log('Fetching user tickets...');
      const response = await apiRequest('/api/v1/tickets/my-tickets');
      console.log('Tickets API response:', response);
      
      // Handle different response formats
      if (response?.data?.tickets && Array.isArray(response.data.tickets)) {
        return response.data.tickets;
      } else if (response?.data?.data?.tickets) {
        return response.data.data.tickets;
      } else if (Array.isArray(response?.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      } else if (response?.data) {
        return [response.data];
      }
      console.warn('Unexpected response format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching user tickets:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return [];
    }
  },

  getPendingTickets: async () => {
    const response = await apiRequest('/tickets/pending');
    // Return the nested tickets array if it exists, otherwise return the response as is
    return response?.data?.tickets || response || [];
  },

  approveTicket: async (ticketId) => {
    const response = await apiRequest(`/tickets/${ticketId}/approve`, {
      method: 'PATCH',
    });
    // Return the nested ticket object if it exists, otherwise return the response as is
    return response?.data?.ticket || response || null;
  },

  rejectTicket: async (ticketId) => {
    const response = await apiRequest(`/tickets/${ticketId}/reject`, {
      method: 'PATCH',
    });
    // Return the nested ticket object if it exists, otherwise return the response as is
    return response?.data?.ticket || response || null;
  },

  validateTicket: async (ticketId, options = {}) => {
    const response = await apiRequest(`/tickets/${ticketId}/validate`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
    // Return the nested validation result if it exists, otherwise return the response as is
    return response?.data?.validation || response || null;
  },

  listTicketForResale: async (ticketId, resaleData) => {
    const response = await apiRequest(`/tickets/${ticketId}/resell`, {
      method: 'POST',
      body: JSON.stringify(resaleData),
    });
    // Return the nested resale result if it exists, otherwise return the response as is
    return response?.data?.resale || response || null;
  },

  purchaseResaleTicket: async (ticketId) => {
    const response = await apiRequest(`/tickets/${ticketId}/purchase-resale`, {
      method: 'POST',
    });
    // Return the nested resale result if it exists, otherwise return the response as is
    return response?.data?.resale || response || null;
  },

  cancelTicket: async (ticketId) => {
    const response = await apiRequest(`/tickets/${ticketId}`, {
      method: 'DELETE',
    });
    // Return the nested result if it exists, otherwise return the response as is
    return response?.data?.success || response || false;
  },

  // Event search
  searchEvents: async (query, filters = {}) => {
    const response = await apiRequest('/events/search', {
      method: 'POST',
      body: JSON.stringify({ query, ...filters }),
    });
    // Return the nested events array if it exists, otherwise return the response as is
    return response?.data?.events || response || [];
  },

  // Event registration
  registerForEvent: async (eventId, registrationData) => {
    const response = await apiRequest(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
    // Return the nested registration result if it exists, otherwise return the response as is
    return response?.data?.registration || response || null;
  },

  // Event favorites
  getFavoriteEvents: async () => {
    const response = await apiRequest('/events/favorites');
    // Return the nested events array if it exists, otherwise return the response as is
    return response?.data?.events || response || [];
  },

  addEventToFavorites: async (eventId) => {
    const response = await apiRequest(`/events/${eventId}/favorite`, {
      method: 'POST',
    });
    // Return the nested favorite result if it exists, otherwise return the response as is
    return response?.data?.favorite || response || null;
  },

  removeEventFromFavorites: async (eventId) => {
    const response = await apiRequest(`/events/${eventId}/favorite`, {
      method: 'DELETE',
    });
    // Return the nested result if it exists, otherwise return the response as is
    return response?.data?.success || response || false;
  },
};

export default eventAPI;

import api from '../utils/api';
import { format, isAfter, parseISO } from 'date-fns';

// Use the events API from the imported api object
const { events } = api;

// Helper function to handle API responses
const handleApiResponse = (response) => {
  console.group('Processing API Response');
  console.log('Raw response:', response);
  
  if (!response) {
    console.warn('Empty response received');
    console.groupEnd();
    return [];
  }

  // If response has a data.events array, return it (new API format)
  if (response.data && response.data.events && Array.isArray(response.data.events)) {
    console.log('Response has data.events array, returning events');
    console.groupEnd();
    return response.data.events;
  }

  // If response is an array, return it
  if (Array.isArray(response)) {
    console.log('Response is an array, returning as is');
    console.groupEnd();
    return response;
  }

  // If response has a data property that's an array, return it
  if (response.data && Array.isArray(response.data)) {
    console.log('Response has data array, returning data');
    console.groupEnd();
    return response.data;
  }

  // If response has a data property that's an object, return it as an array with one item
  if (response.data && typeof response.data === 'object') {
    console.log('Response has data object, returning as array');
    console.groupEnd();
    return [response.data];
  }
  
  console.warn('Unexpected response format, returning empty array');
  console.warn('Response type:', typeof response);
  if (response && typeof response === 'object') {
    console.warn('Response keys:', Object.keys(response));
  }
  console.groupEnd();
  
  return [];
};

// Helper function to process events array
// Map of event titles to unique Unsplash image categories
const EVENT_IMAGES = {
  'Tech Conference 2025': 'tech-conference',
  'Summer Music Festival 2025': 'music-festival',
  'Blockchain Workshop': 'blockchain',
  'Marathon 2025': 'marathon',
  'Contemporary Art Exhibition': 'art-exhibition',
  'Annual Charity Gala': 'charity-gala',
  'Community Yoga in the Park': 'yoga-park',
  'Blockchain & Web3 Masterclass': 'web3',
  'Winter Tech Symposium 2024': 'tech-symposium',
  'AI & Machine Learning Summit': 'ai-ml',
  'Startup Pitch Competition': 'startup-pitch',
  'Digital Marketing Workshop': 'digital-marketing',
  'Health & Wellness Expo': 'wellness-expo',
  'Culinary Arts Festival': 'culinary-arts',
  'Film Premiere Night': 'film-premiere',
  'Jazz & Blues Night': 'jazz-blues'
};

const processEvents = (events, filters = {}) => {
  const now = new Date();
  
  // Ensure events is an array
  if (!Array.isArray(events)) {
    console.warn('processEvents called with non-array input:', events);
    return [];
  }
  
  return events
    .filter(event => event) // Filter out any null/undefined events
    .map(event => {
      try {
        // Handle different event structures
        const eventData = event.data || event;
        
        // Extract basic event info
        const title = eventData.title || 'Untitled Event';
        const eventId = eventData._id || eventData.id || Math.random().toString(36).substring(7);
        
        // Parse dates with proper error handling
        let startDate, endDate;
        try {
          startDate = eventData.startDate ? new Date(eventData.startDate) : null;
          endDate = eventData.endDate ? new Date(eventData.endDate) : null;
          
          // If startDate is invalid, use current date as fallback
          if (!startDate || isNaN(startDate.getTime())) {
            console.warn(`Invalid startDate for event ${eventId}, using current date`);
            startDate = new Date();
          }
          
          // If endDate is not provided or invalid, set it to 2 hours after startDate
          if (!endDate || isNaN(endDate.getTime())) {
            endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
          }
        } catch (dateError) {
          console.error('Error parsing dates:', dateError);
          startDate = new Date();
          endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
        }
        
        const isUpcoming = startDate > now;
        const isPast = endDate < now;
        
        // Get a unique image for this event based on its title
        const imageCategory = EVENT_IMAGES[title] || 'event';
        const bannerImage = eventData.bannerImage || 
                          eventData.images?.[0] || 
                          `https://source.unsplash.com/random/800x400/?${imageCategory}&sig=${eventId}`;
        
        // Construct the processed event object
        return {
          id: eventId,
          _id: eventId,
          title,
          description: eventData.description || '',
          summary: eventData.summary || '',
          category: eventData.category || 'general',
          bannerImage,
          gallery: eventData.gallery || eventData.images || [],
          venue: eventData.venue || {},
          startDate,
          endDate,
          timezone: eventData.timezone || 'UTC',
          ticketTypes: eventData.ticketTypes || [],
          status: eventData.status || 'upcoming',
          tags: eventData.tags || [],
          ratingsAverage: eventData.ratingsAverage || 0,
          ratingsQuantity: eventData.ratingsQuantity || 0,
          views: eventData.views || 0,
          favorites: eventData.favorites || [],
          createdAt: eventData.createdAt || new Date().toISOString(),
          updatedAt: eventData.updatedAt || new Date().toISOString(),
          organizer: eventData.organizer || {},
          isUpcoming,
          isPast
        };
      } catch (error) {
        console.error('Error processing event:', error);
        return null; // Will be filtered out
      }
    })
    .filter(Boolean) // Remove any null events from the array
    .sort((a, b) => {
      // Sort by: 1) Upcoming first, then past
      //          2) Soonest first for upcoming, most recent first for past
      if (a.isUpcoming && !b.isUpcoming) return -1;
      if (!a.isUpcoming && b.isUpcoming) return 1;
      
      if (a.isUpcoming) {
        // For upcoming events, sort by start date (soonest first)
        return a.startDate - b.startDate;
      } else {
        // For past events, sort by start date (most recent first)
        return b.startDate - a.startDate;
      }
    })
    .filter(event => {
      // Always include all events if includePast is true
      if (filters.includePast === 'true') return true;
      // Otherwise, only include upcoming events
      return event.isUpcoming;
    });
};

// Event API
export const eventAPI = {
  // Get all events with optional filters
  getEvents: async (queryParams = '') => {
    try {
      console.log('Fetching events from API...');
      
      // Parse query params if it's a string
      let filters = {
        limit: 100, // Default limit to 100 events
        includePast: 'true' // Include past events by default
      };
      
      if (typeof queryParams === 'string' && queryParams) {
        const params = new URLSearchParams(queryParams);
        params.forEach((value, key) => {
          // Handle date filters specially
          if (key === 'startDate' || key === 'endDate') {
            filters[key] = new Date(value);
          } else {
            filters[key] = value;
          }
        });
      } else if (typeof queryParams === 'object') {
        filters = { ...filters, ...queryParams }; // Merge with defaults
      }
      
      console.log('Fetching events with filters:', JSON.stringify(filters, null, 2));
      const response = await events.getEvents(filters);
      console.log('API Response:', response);
      
      // Handle different response formats
      let eventsData = [];
      
      // Handle nested response format: { status: 'success', data: { events: [...] } }
      if (response?.data?.events && Array.isArray(response.data.events)) {
        eventsData = response.data.events;
      } 
      // Handle array response
      else if (Array.isArray(response)) {
        eventsData = response;
      } 
      // Handle response with data array
      else if (response?.data && Array.isArray(response.data)) {
        eventsData = response.data;
      }
      // Handle response with events array
      else if (response?.events && Array.isArray(response.events)) {
        eventsData = response.events;
      }
      // Handle single event object
      else if (response && typeof response === 'object' && (response._id || response.id)) {
        eventsData = [response];
      }
      
      console.log(`Extracted ${eventsData.length} events from API response`);
      
      // Process and return events from API
      if (eventsData.length > 0) {
        const processedEvents = processEvents(eventsData, filters);
        console.log(`Successfully processed ${processedEvents.length} events`);
        return processedEvents;
      }
      
      console.warn('No events found in API response');
      return [];
    } catch (error) {
      console.error('Error fetching events:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      return [];
    }
  },
  
  // Get a single event by ID
  getEvent: async (eventId) => {
    try {
      console.log(`Fetching event with ID: ${eventId}`);
      
      if (!eventId) {
        console.error('No event ID provided');
        return createGenericEvent('no-id');
      }
      
      // First, try to get the event from the API
      try {
        const response = await events.getEvent(eventId);
        const eventsList = handleApiResponse(response);
        
        if (eventsList && eventsList.length > 0) {
          console.log(`Successfully fetched event with ID: ${eventId}`);
          return eventsList[0];
        }
      } catch (apiError) {
        console.warn(`API error fetching event ${eventId}:`, apiError.message);
        // Continue to fallback to generic event
      }
      
      // If we get here, either the API call failed or returned no results
      console.warn(`Event ${eventId} not found in API, creating generic event`);
      return createGenericEvent(eventId);
    } catch (error) {
      console.error(`Unexpected error in getEvent for ID ${eventId}:`, error);
      throw error;
    }
  },
  
  // Create a new event
  createEvent: async (eventData) => {
    try {
      console.log('Creating new event:', eventData);
      const response = await events.createEvent(eventData);
      return response;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },
  
  // Update an existing event
  updateEvent: async (eventId, eventData) => {
    try {
      console.log(`Updating event ${eventId}:`, eventData);
      const response = await events.updateEvent(eventId, eventData);
      return response;
    } catch (error) {
      console.error(`Error updating event ${eventId}:`, error);
      throw error;
    }
  },
  
  // Delete an event
  deleteEvent: async (eventId) => {
    try {
      console.log(`Deleting event ${eventId}`);
      const response = await events.deleteEvent(eventId);
      return response;
    } catch (error) {
      console.error(`Error deleting event ${eventId}:`, error);
      throw error;
    }
  },
  
  // Search events
  searchEvents: async (query, filters = {}) => {
    try {
      console.log(`Searching events for: ${query}`, filters);
      const response = await events.getEvents({ q: query, ...filters });
      return handleApiResponse(response);
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  },
  
  // Get events by category
  getEventsByCategory: async (category) => {
    try {
      console.log(`Fetching events in category: ${category}`);
      const response = await events.getEvents({ category });
      return handleApiResponse(response);
    } catch (error) {
      console.error(`Error fetching events for category ${category}:`, error);
      throw error;
    }
  },
  
  // Get user's registered events
  getMyRegisteredEvents: async () => {
    try {
      console.log('Fetching user\'s registered events');
      const response = await events.getMyTickets();
      return handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching registered events:', error);
      throw error;
    }
  },
  
  // Get user's organized events
  getMyOrganizedEvents: async () => {
    try {
      console.log('Fetching user\'s organized events');
      const response = await events.getEvents({ organizer: 'me' });
      return handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching organized events:', error);
      throw error;
    }
  },
  
  // Register for an event
  registerForEvent: async (eventId, registrationData = {}) => {
    try {
      console.log(`Registering for event ${eventId}:`, registrationData);
      const response = await events.registerForEvent(eventId, registrationData);
      return response;
    } catch (error) {
      console.error(`Error registering for event ${eventId}:`, error);
      throw error;
    }
  },
  
  // Get event attendees
  getEventAttendees: async (eventId) => {
    try {
      console.log(`Fetching attendees for event ${eventId}`);
      const response = await events.getEventAttendees(eventId);
      return response?.attendees || [];
    } catch (error) {
      console.error(`Error fetching attendees for event ${eventId}:`, error);
      throw error;
    }
  },
  
  // Get user's tickets
  getMyTickets: async (filters = {}) => {
    try {
      console.log('Fetching user\'s tickets with filters:', filters);
      const response = await events.getMyTickets(filters);
      return response?.tickets || [];
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  },
  
  // Get pending tickets for an event
  getPendingTickets: async (eventId) => {
    if (!eventId) {
      throw new Error('Event ID is required to fetch pending tickets');
    }
    try {
      console.log(`Fetching pending tickets for event ${eventId}`);
      const response = await events.getPendingTickets(eventId);
      return response?.tickets || [];
    } catch (error) {
      console.error(`Error fetching pending tickets for event ${eventId}:`, error);
      
      // If 404, try the fallback endpoint
      if (error.response && error.response.status === 404) {
        console.log('Tickets endpoint not found, trying fallback endpoint...');
        try {
          // Try to get tickets through the my-tickets endpoint
          const tickets = await api.events.getMyTickets();
          if (tickets && Array.isArray(tickets)) {
            return tickets;
          }
          return [];
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          return []; // Return empty array as fallback
        }
      }
      
      throw error;
    }
  }
};

export default eventAPI;

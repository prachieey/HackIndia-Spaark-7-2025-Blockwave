import api from '../utils/api';
import { format, isAfter, parseISO } from 'date-fns';

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
  if (response.data?.events && Array.isArray(response.data.events)) {
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
  
  console.warn('Unexpected response format, returning empty array');
  console.groupEnd();
  return [];
};

// Create a generic event when the API doesn't return one
const createGenericEvent = (eventId) => ({
  _id: eventId,
  id: eventId,
  title: `Event ${eventId}`,
  description: 'Event details not available',
  startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  endDate: new Date(Date.now() + 9000000).toISOString(),
  location: 'Location not specified',
  category: 'General',
  image: 'https://source.unsplash.com/random/800x600/?event',
  price: 0,
  capacity: 100,
  availableTickets: 100,
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

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
  'Culinary Arts Festival': 'culinary-arts'
};

// Process events array and apply filters
const processEvents = (events = [], filters = {}) => {
  if (!Array.isArray(events)) {
    console.warn('processEvents: Expected an array of events, got:', events);
    return [];
  }

  return events.map(event => {
    if (!event) return null;
    
    // Generate a random image if not provided
    const image = event.image || 
      `https://source.unsplash.com/random/800x600/?${EVENT_IMAGES[event.title] || 'event'}`;
    
    return {
      id: event.id || event._id || Math.random().toString(36).substr(2, 9),
      title: event.title || 'Untitled Event',
      description: event.description || '',
      startDate: event.startDate || event.start_date || new Date().toISOString(),
      endDate: event.endDate || event.end_date || new Date(Date.now() + 3600000).toISOString(),
      location: event.location || 'Location not specified',
      category: event.category || 'general',
      ticketPrice: typeof event.ticketPrice === 'number' ? event.ticketPrice : 
                  event.price || event.cost || 0,
      image,
      attendeesCount: event.attendeesCount || event.attendees_count || 
                     (event.attendees ? event.attendees.length : 0),
      capacity: event.capacity || 100,
      organizer: event.organizer || { 
        name: event.organizerName || 'Organizer', 
        id: event.organizerId 
      },
      ...event
    };
  }).filter(Boolean);
};

// Event API
// Export as both default and named export for compatibility
export const eventAPI = {
  // Get all events with optional filters
  getEvents: async (queryParams = '') => {
    try {
      console.log('Fetching events with query params:', queryParams);
      
      // Handle both string query params and object filters
      let filters = {
        // Default pagination to get all events
        limit: 100,  // Increase limit to get more events
        page: 1,
        sort: 'startDate',
        order: 'asc'
      };
      
      if (typeof queryParams === 'string') {
        // Remove leading ? if present
        const queryString = queryParams.startsWith('?') ? queryParams.substring(1) : queryParams;
        // Parse query string to object
        new URLSearchParams(queryString).forEach((value, key) => {
          if (key in filters) {
            if (Array.isArray(filters[key])) {
              filters[key].push(value);
            } else {
              filters[key] = [filters[key], value];
            }
          } else {
            filters[key] = value;
          }
        });
      } else if (typeof queryParams === 'object') {
        filters = { ...filters, ...queryParams };
      }
      
      console.log('Fetching events with filters:', JSON.stringify(filters, null, 2));
      
      // Always fetch from the API, even in development
      const endpoint = '/api/v1/events';
      console.log('Fetching events from API endpoint:', endpoint);
      
      // Convert filters to query string
      const queryString = Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
          }
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .join('&');
      
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      console.log('Final API URL:', url);
      
      try {
        // Use the full URL for the API request
        console.log('Making API request to:', 'http://localhost:5002' + url);
        const response = await fetch('http://localhost:5002' + url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          credentials: 'include'
        });
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            error: errorText
          });
          throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('API Response data:', responseData);
        
        // Process the response
        const eventsData = handleApiResponse(responseData);
        console.log(`Extracted ${eventsData.length} events from API response`);
        
        // Process and return events from API
        if (eventsData.length > 0) {
          const processedEvents = processEvents(eventsData, filters);
          console.log(`Successfully processed ${processedEvents.length} events`);
          return processedEvents;
        }
        
        // If no events found, return an empty array
        console.warn('No events found in the API response');
        return [];
      } catch (error) {
        console.error('Error in getEvents:', {
          message: error.message,
          stack: error.stack,
          error: error
        });
        throw error; // Re-throw to be handled by the caller
      }
      
    } catch (error) {
      console.error('Error in getEvents:', {
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
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      
      console.log(`Fetching event with ID: ${eventId}`);
      
      // In development, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock event data in development mode');
        return {
          id: eventId,
          title: 'Sample Event',
          description: 'This is a sample event for development',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3600000).toISOString(),
          location: 'Virtual',
          category: 'workshop',
          ticketPrice: 0,
          image: 'https://source.unsplash.com/random/800x600/?meeting',
          attendeesCount: 10,
          capacity: 100,
          organizer: { name: 'Event Organizer' }
        };
      }
      
      // In production, make the actual API call
      const response = await api.get(`/events/${eventId}`);
      
      if (!response) {
        throw new Error('No event found with the specified ID');
      }
      
      // Process the single event
      const events = processEvents([response]);
      return events.length > 0 ? events[0] : null;
      
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      
      // If we're in development, return a mock event
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock event data in development mode after error');
        return createGenericEvent(eventId);
      }
      
      throw error;
    }
  },
  
  // Other API methods can be added here
  createEvent: async (eventData) => {
    // Implementation for creating an event
  },
  
  updateEvent: async (eventId, eventData) => {
    // Implementation for updating an event
  },
  
  deleteEvent: async (eventId) => {
    // Implementation for deleting an event
  },
  
  // Add other event-related API methods as needed
};

// Default export
export default eventAPI;

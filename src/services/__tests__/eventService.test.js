import eventAPI, { handleApiResponse } from '../eventService';
import api from '../../utils/api';

// Mock the API module
jest.mock('../../utils/api');

describe('EventService', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleApiResponse', () => {
    it('should handle direct array response', () => {
      const mockResponse = [{ id: 1, name: 'Test Event' }];
      const result = handleApiResponse(mockResponse);
      expect(result).toEqual(mockResponse);
    });

    it('should handle response with data property', () => {
      const mockResponse = { data: [{ id: 1, name: 'Test Event' }] };
      const result = handleApiResponse(mockResponse);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle single event object', () => {
      const mockResponse = { id: '123', name: 'Single Event' };
      const result = handleApiResponse(mockResponse);
      expect(result).toEqual(mockResponse);
    });

    it('should handle response with results property', () => {
      const mockResponse = { results: [{ id: 1, name: 'Test Event' }] };
      const result = handleApiResponse(mockResponse);
      expect(result).toEqual(mockResponse.results);
    });

    it('should handle response with events property', () => {
      const mockResponse = { events: [{ id: 1, name: 'Test Event' }] };
      const result = handleApiResponse(mockResponse);
      expect(result).toEqual(mockResponse.events);
    });
  });

  describe('getEvents', () => {
    it('should fetch events with query parameters', async () => {
      const mockEvents = [{ id: 1, name: 'Test Event' }];
      api.events.getEvents.mockResolvedValue(mockEvents);

      const queryParams = { category: 'music', limit: 10 };
      const result = await eventAPI.getEvents(queryParams);

      expect(api.events.getEvents).toHaveBeenCalledWith('?category=music&limit=10');
      expect(result).toEqual(mockEvents);
    });

    it('should handle errors when fetching events', async () => {
      const error = new Error('Network error');
      api.events.getEvents.mockRejectedValue(error);
      
      await expect(eventAPI.getEvents({})).rejects.toThrow('Network error');
    });
  });

  describe('getEvent', () => {
    it('should fetch a single event by ID', async () => {
      const mockEvent = { id: '123', name: 'Single Event' };
      api.events.getEvent.mockResolvedValue(mockEvent);

      const result = await eventAPI.getEvent('123');

      expect(api.events.getEvent).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockEvent);
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const newEvent = { name: 'New Event', date: '2025-12-31' };
      const mockResponse = { id: 'new123', ...newEvent };
      api.events.createEvent.mockResolvedValue(mockResponse);

      const result = await eventAPI.createEvent(newEvent);

      expect(api.events.createEvent).toHaveBeenCalledWith(newEvent);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchEvents', () => {
    it('should search events with query and filters', async () => {
      const mockEvents = [{ id: 1, name: 'Music Festival' }];
      api.events.getEvents.mockResolvedValue(mockEvents);

      const result = await eventAPI.searchEvents('music', { category: 'concert' });
      
      expect(api.events.getEvents).toHaveBeenCalledWith('?q=music');
      expect(result).toEqual(mockEvents);
    });
  });
});

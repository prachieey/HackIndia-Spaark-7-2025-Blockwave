import { jest } from '@jest/globals';
import { auth, events, isAuthenticated, cleanAuthData } from '../api';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

describe('API Utility - Simple Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('cleanAuthData', () => {
    it('should clear all auth-related data from localStorage', () => {
      // Set up test data
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('refreshToken', 'test-refresh-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));

      // Call the function
      cleanAuthData();

      // Check that all auth-related data was removed
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      localStorage.removeItem('token');
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true when a valid token exists', () => {
      // Mock a future expiration date
      const token = 'header.' + 
        Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64') + 
        '.signature';
      
      localStorage.setItem('token', token);
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('auth.login', () => {
    it('should make a POST request to /auth/login and store tokens', async () => {
      const mockResponse = {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        user: { id: 1, name: 'Test User' },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await auth.login(credentials);

      // Check that fetch was called with the correct arguments
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        })
      );

      // Check that tokens and user data were stored
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockResponse.token);
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', mockResponse.refreshToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.user));

      // Check that the response is returned
      expect(result).toEqual(mockResponse);
    });
  });

  describe('events.getEvents', () => {
    it('should fetch events with filters', async () => {
      const mockEvents = [
        { id: 1, title: 'Event 1' },
        { id: 2, title: 'Event 2' },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents,
      });

      const filters = {
        category: 'music',
        date: '2023-01-01',
      };

      const result = await events.getEvents(filters);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events?category=music&date=2023-01-01'),
        expect.any(Object)
      );

      expect(result).toEqual(mockEvents);
    });
  });
});

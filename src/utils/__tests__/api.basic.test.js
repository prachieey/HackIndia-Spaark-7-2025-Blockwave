// Simple test file that doesn't require any React dependencies
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

describe('API Utility - Basic Tests', () => {
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
});

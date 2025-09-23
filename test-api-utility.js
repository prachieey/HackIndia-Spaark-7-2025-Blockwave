// Simple test script for API utility
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { auth, events, isAuthenticated } from './src/utils/api.js';

// The cleanAuthData function is not exported, so we'll test the public API only

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock;

// Test auth functionality
console.log('=== Testing Auth API ===');
console.log('Auth methods available:', Object.keys(auth));

// Test isAuthenticated
console.log('\n=== Testing isAuthenticated ===');
localStorage.clear();
console.log('No token - isAuthenticated:', isAuthenticated());

// Create a token that expires in 1 hour
const payload = {
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  userId: 123
};

const token = 'header.' + Buffer.from(JSON.stringify(payload)).toString('base64') + '.signature';
localStorage.setItem('token', token);
console.log('With valid token - isAuthenticated:', isAuthenticated());

console.log('\nTest completed successfully!');

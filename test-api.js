// Test script for the API utility
import { auth, events } from './src/utils/api.js';

// Simple test runner
const test = (name, fn) => {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(error);
  }
};

// Test suite
console.log('=== Starting API Utility Tests ===\n');

// Test 1: Check if auth methods are available
test('Auth methods should be available', () => {
  const expectedMethods = [
    'login', 'register', 'logout', 'getCurrentUser',
    'forgotPassword', 'resetPassword', 'updatePassword',
    'verifyEmail', 'resendVerificationEmail'
  ];
  
  expectedMethods.forEach(method => {
    if (typeof auth[method] !== 'function') {
      throw new Error(`Missing auth method: ${method}`);
    }
  });
  
  console.log('Available auth methods:', Object.keys(auth));
});

// Test 2: Check if events methods are available
test('Events methods should be available', () => {
  const expectedMethods = [
    'createEvent', 'getEvents', 'getEvent', 'updateEvent', 'deleteEvent'
  ];
  
  expectedMethods.forEach(method => {
    if (typeof events[method] !== 'function') {
      throw new Error(`Missing events method: ${method}`);
    }
  });
  
  console.log('Available events methods:', Object.keys(events));
});

// Test 3: Test login with invalid credentials
test('Login with invalid credentials should fail', async () => {
  // Mock fetch
  const originalFetch = global.fetch;
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: false,
    status: 401,
    json: async () => ({
      status: 'error',
      message: 'Invalid email or password'
    })
  });

  try {
    await auth.login({
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
    throw new Error('Login should have failed with invalid credentials');
  } catch (error) {
    if (error.message !== 'Invalid email or password') {
      throw error;
    }
    console.log('Login with invalid credentials failed as expected');
  } finally {
    global.fetch = originalFetch;
  }
});

// Test 4: Test getting events
test('Get events should return a list of events', async () => {
  // Mock fetch
  const mockEvents = [
    { id: 1, title: 'Test Event 1' },
    { id: 2, title: 'Test Event 2' }
  ];
  
  const originalFetch = global.fetch;
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => mockEvents
  });

  try {
    const result = await events.getEvents();
    if (!Array.isArray(result)) {
      throw new Error('Expected an array of events');
    }
    console.log('Successfully fetched events:', result);
  } finally {
    global.fetch = originalFetch;
  }
});

console.log('\n=== Test Summary ===');

// Test script to verify authentication
const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    console.log('API Base URL:', API_BASE_URL);
    
    // Test with sample credentials (replace with actual test user)
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Login successful!');
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response',
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    throw error;
  }
}

// Run the test
testLogin()
  .then(() => console.log('Test completed successfully'))
  .catch(() => console.error('Test failed'));

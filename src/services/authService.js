import http, { setAuthTokens, clearAuthTokens } from './httpService';
import { API_BASE_URL } from '../config';

const apiEndpoint = '/auth';

// Get current user from localStorage
export function getCurrentUser() {
  try {
    const user = localStorage.getItem('scantyx_user');
    return user ? JSON.parse(user) : null;
  } catch (ex) {
    console.error('Error getting current user:', ex);
    return null;
  }
}

// Login user
export async function login(email, password) {
  try {
    console.log('Attempting login with:', { email });
    
    const response = await http.post(`${apiEndpoint}/login`, { email, password });
    console.log('Login response:', response);
    
    const { token, refreshToken, user } = response.data;
    
    if (token && user) {
      console.log('Login successful, storing tokens');
      // Store tokens using the correct keys
      setAuthTokens(token, refreshToken);
      
      // Store user data
      localStorage.setItem('scantyx_user', JSON.stringify(user));
      
      console.log('Login successful, tokens stored');
      return { token, refreshToken, user };
    }
    
    console.error('Invalid response format from server:', response);
    throw new Error('Invalid response from server: Missing token or user data');
  } catch (error) {
    console.error('Login failed with error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'No response data',
      stack: error.stack
    });
    
    // Clear any partial auth data on error
    if (typeof clearAuthTokens === 'function') {
      clearAuthTokens();
    }
    localStorage.removeItem('scantyx_user');
    
    // Check if this is a connection error
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
    
    // Extract and throw a more user-friendly error message
    let errorMessage = 'Login failed. Please check your credentials.';
    
    if (error.response) {
      // Handle specific HTTP error statuses
      if (error.response.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    throw new Error(errorMessage);
  }
}

// Logout user
export function logout() {
  // Clear all auth data
  clearAuthTokens();
  localStorage.removeItem('scantyx_user');
  
  console.log('User logged out and all auth data cleared');
  return Promise.resolve();
}

// Register new user
export async function register(userData) {
  try {
    const response = await http.post(`${apiEndpoint}/register`, userData);
    const { token, refreshToken, user } = response.data;
    
    if (token && user) {
      // Store tokens using the correct keys
      setAuthTokens(token, refreshToken);
      
      // Store user data
      localStorage.setItem('scantyx_user', JSON.stringify(user));
      
      console.log('Registration successful, tokens stored');
      return { token, refreshToken, user };
    }
    
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Registration failed:', error);
    // Clear any partial auth data on error
    clearAuthTokens();
    
    // Extract and throw a more user-friendly error message
    const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
    throw new Error(errorMessage);
  }
}

// Get user profile
export async function getProfile() {
  const { data } = await http.get(`${apiEndpoint}/profile`);
  return data;
}

// Update user profile
export async function updateProfile(profileData) {
  const { data } = await http.patch(`${apiEndpoint}/profile`, profileData);
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

// Request password reset
export async function forgotPassword(email) {
  const { data } = await http.post(`${apiEndpoint}/forgot-password`, { email });
  return data;
}

// Reset password with token
export async function resetPassword(token, password) {
  const { data } = await http.post(`${apiEndpoint}/reset-password`, { token, password });
  return data;
}

export default {
  login,
  logout,
  register,
  getCurrentUser,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword
};

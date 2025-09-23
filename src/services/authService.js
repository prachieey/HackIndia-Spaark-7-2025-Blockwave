import http from './httpService';
import { API_BASE_URL } from '../config';

const apiEndpoint = '/auth';

// Get current user from localStorage
export function getCurrentUser() {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (ex) {
    return null;
  }
}

// Login user
export async function login(email, password) {
  try {
    const { data } = await http.post(`${apiEndpoint}/login`, { email, password });
    
    if (data.token) {
      // Store token in multiple locations for redundancy
      localStorage.setItem('token', data.token);
      localStorage.setItem('auth_token', data.token);
      document.cookie = `token=${data.token}; path=/; max-age=86400`; // 24 hours
      
      // Store user data
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      console.log('Login successful, token stored');
    } else {
      console.warn('Login successful but no token received');
    }
    
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    // Clear any partial auth data on error
    logout();
    throw error;
  }
}

// Logout user
export function logout() {
  // Clear all auth tokens from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  
  // Clear auth cookies
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  
  console.log('User logged out and all auth data cleared');
}

// Register new user
export async function register(userData) {
  const { data } = await http.post(`${apiEndpoint}/register`, userData);
  return data;
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

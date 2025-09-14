import http from './httpService';
import { API_BASE_URL } from '../config';

const apiEndpoint = '/api/v1/auth';

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
  const { data } = await http.post(`${apiEndpoint}/login`, { email, password });
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

// Logout user
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
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

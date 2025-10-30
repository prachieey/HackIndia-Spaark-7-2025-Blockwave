import { jwtDecode } from 'jwt-decode';

/**
 * Check if a JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is expired or invalid, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch (e) {
    console.error('Error decoding token:', e);
    return true;
  }
};

/**
 * Get user info from token
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
export const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (e) {
    console.error('Error decoding user token:', e);
    return null;
  }
};

/**
 * Get the token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null if invalid token
 */
export const getTokenExpiration = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return new Date(decoded.exp * 1000);
  } catch (e) {
    console.error('Error getting token expiration:', e);
    return null;
  }
};

/**
 * Check if token will expire soon (within 5 minutes)
 * @param {string} token - JWT token
 * @returns {boolean} - True if token will expire soon, false otherwise
 */
export const isTokenExpiringSoon = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    const fiveMinutes = 5 * 60; // 5 minutes in seconds
    return decoded.exp - now < fiveMinutes;
  } catch (e) {
    console.error('Error checking token expiration:', e);
    return true;
  }
};

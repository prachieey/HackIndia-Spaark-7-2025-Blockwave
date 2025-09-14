// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Other configuration constants
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

// Local storage keys
export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';

// Date and time formats
export const DATE_FORMAT = 'MMM d, yyyy';
export const DATETIME_FORMAT = 'MMM d, yyyy h:mm a';

export default {
  API_BASE_URL,
  DEFAULT_PAGE_SIZE,
  MAX_UPLOAD_SIZE,
  AUTH_TOKEN_KEY,
  USER_DATA_KEY,
  DATE_FORMAT,
  DATETIME_FORMAT,
};

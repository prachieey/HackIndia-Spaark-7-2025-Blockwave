// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  `http://localhost:${import.meta.env.VITE_BACKEND_PORT || 3001}/api/${import.meta.env.VITE_API_VERSION || 'v1'}`;

// WebSocket Configuration
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 
  `ws://localhost:${import.meta.env.VITE_BACKEND_PORT || 3001}`;

// Other configuration constants
export const APP_NAME = 'Scantyx';
export const DEFAULT_PAGE_SIZE = 10;

// Local storage keys
export const TOKEN_KEY = 'scantyx_token';
export const USER_KEY = 'scantyx_user';

// Default settings
export const DEFAULT_THEME = 'light';

export default {
  API_BASE_URL,
  WS_BASE_URL,
  APP_NAME,
  DEFAULT_PAGE_SIZE,
  TOKEN_KEY,
  USER_KEY,
  DEFAULT_THEME
};

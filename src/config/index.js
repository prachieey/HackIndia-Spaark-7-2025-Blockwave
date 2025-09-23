// Environment detection
const isBrowser = typeof window !== 'undefined';

// API Configuration
const getEnvVar = (key, defaultValue) => {
  if (isBrowser) {
    // In browser, use import.meta.env
    return import.meta.env[`VITE_${key}`] || defaultValue;
  } else {
    // In Node.js, use process.env
    return process.env[key] || defaultValue;
  }
};

const API_BASE_URL = getEnvVar('API_URL', 'http://localhost:54321/api');
const WS_BASE_URL = getEnvVar('WS_URL', 'ws://localhost:5001');

// Other configuration constants
const DEFAULT_PAGE_SIZE = 10;
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

// Local storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Date and time formats
const DATE_FORMAT = 'MMM d, yyyy';
const DATETIME_FORMAT = 'MMM d, yyyy h:mm a';

// Logging configuration
const logging = {
  level: getEnvVar('LOG_LEVEL', 'info'),
  file: {
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true
  }
};

// Export all named exports
export {
  API_BASE_URL,
  WS_BASE_URL,
  DEFAULT_PAGE_SIZE,
  MAX_UPLOAD_SIZE,
  AUTH_TOKEN_KEY,
  USER_DATA_KEY,
  DATE_FORMAT,
  DATETIME_FORMAT,
  logging
};

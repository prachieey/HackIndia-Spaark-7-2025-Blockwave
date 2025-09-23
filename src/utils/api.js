// api.js
// ============================================================================
// Base API configuration
// ============================================================================
import { jwtDecode } from 'jwt-decode';

const DEFAULT_BACKEND_PORT = '5001';
const DEFAULT_API_VERSION = 'v1';

// Get the base URL from environment variables or use default
const getBackendUrl = () => {
  // Use Vite environment variable if set
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Default to current host with default port
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = DEFAULT_BACKEND_PORT;
  
  // If we're on the same host as the frontend, use the default port
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${port}`;
  }
  
  // For production, assume API is on the same host
  return `${protocol}//${hostname}${port ? ':' + port : ''}`;
};

// Get base URL without API version
const getApiBaseUrl = () => {
  const baseUrl = getBackendUrl();
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

// Get versioned API URL
const getVersionedApiUrl = () => {
  // For development, use the direct backend URL
  if (import.meta.env.DEV) {
    // Ensure we're using the correct port (5001) for the backend
    return 'http://localhost:5001';
  }
  
  // For production, use the configured backend URL
  const baseUrl = getBackendUrl();
  // Remove any trailing slashes and /api/v1 if present
  return baseUrl.replace(/\/api\/v\d+$/, '').replace(/\/+$/, '');
};

// Helper to build API URLs
const buildApiUrl = (endpoint) => {
  // If no endpoint is provided, return the base API URL
  if (!endpoint) {
    return getVersionedApiUrl();
  }
  
  // Remove leading/trailing slashes from endpoint
  const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
  
  // If the endpoint already includes the full URL, use it as is
  if (cleanEndpoint.startsWith('http')) {
    return cleanEndpoint;
  }
  
  // Get the base URL (without trailing slash)
  const baseUrl = getVersionedApiUrl().replace(/\/+$/, '');
  
  // If the endpoint starts with 'api/', use it as is
  if (cleanEndpoint.startsWith('api/')) {
    return `${baseUrl}/${cleanEndpoint}`;
  }
  
  // For all other endpoints, prepend '/api/v1/'
  return `${baseUrl}/api/v1/${cleanEndpoint}`;
};

const API_BASE_URL = getBackendUrl();
console.log('Using API base URL:', API_BASE_URL);
console.log('Versioned API URL:', getVersionedApiUrl());

// ============================================================================
// Helper function: Clean up all auth data
// ============================================================================
const cleanAuthData = () => {
  console.log('Cleaning up all auth data');

  // Clear all possible token storage locations
  const tokenKeys = [
    'token',
    'jwt',
    'refreshToken',
    'scantyx_token',
    'scantyx_refresh_token',
    'auth_token',
    'auth_refresh_token',
    'user'
  ];

  // Clear all token-related items from localStorage and sessionStorage
  tokenKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  // Clear any cookies that might store tokens
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.split('=').map(c => c.trim());
    if (tokenKeys.includes(name)) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });

  // Clear any in-memory tokens
  if (window.authTokens) {
    delete window.authTokens;
  }
};

// ============================================================================
// Helper function: Check if token is expired
// ============================================================================
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // If we can't decode the token, consider it expired
  }
};

// ============================================================================
// Helper function: Refresh access token
// ============================================================================
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    console.log('No refresh token available');
    cleanAuthData();
    return null;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return data.token;
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    cleanAuthData();
    return null;
  }
};

// ============================================================================
// Helper function: Core API request
// ============================================================================
// Track pending requests
const pendingRequests = new Map();
let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed(token) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

async function apiRequest(endpoint, options = {}) {
  // Define public endpoints that don't require authentication
  const publicEndpoints = [
    'auth/login',
    'auth/signup',
    'auth/register',
    'auth/health',
    'auth/refresh',
    'auth/verify-email',
    'auth/reset-password',
    'auth/forgot-password'
  ].map(ep => ep.replace(/^\/+|\/+$/g, ''));  // Normalize endpoints
  
  // Get the token from localStorage
  const token = localStorage.getItem('token');
  
  // Normalize endpoint for comparison (remove leading/trailing slashes)
  const normalizedEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
  const isPublic = publicEndpoints.some(ep => 
    normalizedEndpoint === ep.replace(/^\/+|\/+$/g, '')
  );
  
  // Build the full URL using our helper
  const fullUrl = buildApiUrl(endpoint);
  console.log(`API Request: ${options.method || 'GET'} ${fullUrl}`);
  
  // Ensure headers exist and set defaults
  const headers = new Headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers || {})
  });

  // Add authorization token if available and not a public endpoint
  if (!isPublic) {
    // Get the token from localStorage if not provided
    const authToken = token || localStorage.getItem('token');
    
    if (authToken) {
      // Make sure to include the 'Bearer ' prefix
      const bearerToken = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      headers.set('Authorization', bearerToken);
      console.log('Added Authorization header to request');
    } else {
      console.warn('No authentication token found for protected endpoint:', endpoint);
      
      // For protected routes, redirect to login
      if (typeof window !== 'undefined' && !endpoint.includes('auth/')) {
        // Don't redirect if we're already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
      }
      
      // Don't throw here to allow the server to handle the missing token
      // The server will return a 401 if the endpoint requires authentication
    }
  }
  
  // Generate a unique ID for this request
  const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  const controller = new AbortController();
  pendingRequests.set(requestId, controller);
  
  // Handle request body
  let body = options.body;
  let isFormData = body instanceof FormData;
  
  if (body && !isFormData && typeof body === 'object') {
    // Stringify JSON body and ensure Content-Type is set
    body = JSON.stringify(body);
    headers.set('Content-Type', 'application/json');
  }
  
  // Log request in development
  if (import.meta.env.DEV) {
    console.group(`API Request [${requestId}]: ${options.method || 'GET'} ${fullUrl}`);
    console.log('Headers:', Object.fromEntries(headers.entries()));
    if (body && !isFormData) console.log('Body:', body);
    if (body && isFormData) console.log('Body: [FormData]');
    console.groupEnd();
  }
  
  try {
    // Make the API request
    const fetchOptions = {
      method: options.method || 'GET',
      headers: headers,
      body: body,
      credentials: 'include',
      mode: 'cors',
      signal: controller.signal,
      ...options, // Spread any additional options
    };
    
    // Remove the signal from options to avoid conflicts
    delete fetchOptions.signal;
    
    let response;
    try {
      response = await fetch(fullUrl, {
        ...fetchOptions,
        signal: controller.signal
      });
    } catch (error) {
      // Network error or request was aborted
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw new Error(`Network error: ${error.message}`);
    }
    
    const responseClone = response.clone();
    let responseData;
    
    // Handle response data
    try {
      responseData = await responseClone.json();
    } catch (e) {
      responseData = await responseClone.text();
    }

    if (import.meta.env.DEV) {
      console.group(`API Response [${requestId}]: ${response.status} ${options.method || 'GET'} ${fullUrl}`);
      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response:', responseData);
      console.groupEnd();
    }

    // Handle non-2xx responses
    if (!response.ok) {
      // Handle 401 Unauthorized (token expired or invalid)
      if (response.status === 401 && !isPublic) {
        // If we're already refreshing, add this request to the queue
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshSubscribers.push((token) => {
              // Retry the request with the new token
              headers.set('Authorization', `Bearer ${token}`);
              apiRequest(endpoint, { ...options, headers })
                .then(resolve)
                .catch(reject);
            });
          });
        }

        isRefreshing = true;

        try {
          // Try to refresh the token
          const newToken = await refreshToken();
          
          if (newToken) {
            // Update the authorization header
            headers.set('Authorization', `Bearer ${newToken}`);
            
            // Retry the original request
            const retryResponse = await fetch(fullUrl, {
              ...fetchOptions,
              headers,
              signal: controller.signal
            });
            
            // Process the retry response
            const retryData = await retryResponse.json();
            isRefreshing = false;
            onTokenRefreshed(newToken);
            return retryData;
          } else {
            // If refresh failed, clear auth and redirect to login
            cleanAuthData();
            if (typeof window !== 'undefined') {
              window.location.href = '/login?session=expired';
            }
            throw new Error('Your session has expired. Please log in again.');
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login?session=expired';
          }
          throw new Error('Your session has expired. Please log in again.');
        }
      }

      const errorMessage = responseData?.message || 
                         responseData?.error?.message || 
                         response.statusText || 
                         'An error occurred';
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.response = responseData;
      
      if (response.status === 403) {
        error.message = 'You do not have permission to perform this action';
      } else if (response.status === 404) {
        error.message = 'The requested resource was not found';
      } else if (response.status >= 500) {
        error.message = 'A server error occurred. Please try again later.';
      }
      
      throw error;
    }

    return responseData;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`Request ${requestId} was aborted`);
      throw new Error('Request was cancelled');
    }
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }
    
    throw error;
  } finally {
    // Clean up the request from pending requests
    pendingRequests.delete(requestId);
  }
}

/**
 * Clears all pending requests by aborting them
 */
function clearPendingRequests() {
  pendingRequests.forEach((controller, requestId) => {
    controller.abort();
    console.log(`Cancelled pending request: ${requestId}`);
  });
  pendingRequests.clear();
}

// ============================================================================
// Auth API
// ===========================================================================
export const auth = {
  // Login with email and password
  async login({ email, password, rememberMe = false }) {
    console.log('Login attempt with email:', email ? `${email.substring(0, 3)}...` : 'undefined');
    
    // Input validation
    if (!email || !password) {
      const error = new Error(email ? 'Password is required' : 'Email is required');
      console.error('Login validation error:', error.message);
      throw error;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Please enter a valid email address');
      console.error('Invalid email format:', email);
      throw error;
    }
    try {
      // Validate required fields
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      
      if (missingFields.length > 0) {
        throw new Error(`Please provide: ${missingFields.join(', ')}`);
      }
      
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
    
      // Use the correct backend URL for login with API version
      const loginUrl = `${getVersionedApiUrl()}/api/v1/auth/login`;
      console.log('Using login URL:', loginUrl);
      console.log('Login request:', { 
        loginUrl, 
        email: email.substring(0, 3) + '...', // Log partial email for security
        timestamp: new Date().toISOString()
      });
      
      // Clear any existing auth data before login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Make the login request with enhanced error handling
      console.log('Sending login request to:', loginUrl);
      
      // Prepare request options
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password.trim(),
          rememberMe
        })
      };
      
      console.log('Request options:', {
        ...requestOptions,
        body: { 
          email: email.trim(),
          password: '•••••••', // Don't log actual password
          rememberMe 
        }
      });
      
      console.log('Request options:', {
        ...requestOptions,
        body: JSON.parse(requestOptions.body) // Log the body without the password
      });
      
      let response;
      try {
        response = await fetch(loginUrl, requestOptions);
        console.log('Response status:', response.status, response.statusText);
      } catch (fetchError) {
        console.error('Network error during login:', {
          name: fetchError.name,
          message: fetchError.message,
          stack: fetchError.stack
        });
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      
      console.log('Login response status:', response.status, response.statusText);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      try {
        // Try to parse as JSON
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        const text = await response.text();
        console.error('Raw response:', text);
        throw new Error('Invalid response format from server');
      }
      
      console.log('Login response data:', data);
      
      if (!response.ok) {
        console.error('Login failed:', { 
          status: response.status, 
          statusText: response.statusText,
          data 
        });
        
        let errorMsg = data?.message || 
                      data?.error || 
                      `Login failed with status ${response.status}`;
        
        if (response.status === 401) {
          errorMsg = 'Invalid email or password';
        } else if (response.status === 400) {
          errorMsg = data.message || 'Invalid request. Please check your input.';
        } else if (response.status === 404) {
          errorMsg = 'Login endpoint not found. Please check your API configuration.';
        } else if (response.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        const error = new Error(errorMsg);
        error.response = { data };
        throw error;
      }
      
      // Process successful login response
      try {
        // The API might return data in different formats:
        // 1. { token, user }
        // 2. { data: { token, user } }
        // 3. { data: { token }, user }
        let token, userData;
        
        if (data.token) {
          // Format 1: { token, user }
          token = data.token;
          userData = data.user;
        } else if (data.data) {
          // Format 2 or 3
          token = data.data.token || data.token;
          userData = data.data.user || data.user;
        }
        
        // Verify we have a token
        if (!token) {
          console.error('No token received in login response:', data);
          throw new Error('Authentication failed: No token received');
        }
        
        // Store the token in localStorage
        localStorage.setItem('token', token);
        console.log('Token stored in localStorage');
        
        // Store user data if available
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('User data stored in localStorage');
        } else {
          console.warn('No user data received in login response');
        }
        
        // Log successful login
        console.log('User logged in successfully:', {
          hasToken: !!token,
          hasUserData: !!userData,
          userId: userData?._id,
          email: userData?.email,
          role: userData?.role,
          timestamp: new Date().toISOString()
        });
        
        // Return consistent response format
        return {
          success: true,
          token: token,
          user: userData,
          data: data.data || data
        };
        
      } catch (processError) {
        console.error('Error processing login response:', processError);
        throw new Error('Failed to process login response');
      }
    } catch (error) {
      console.error('Login error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response?.data || 'No response data'
      });
      
      // Clear any partial auth data on error
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
      }
      if (localStorage.getItem('user')) {
        localStorage.removeItem('user');
      }
      
      // If it's an error with response data, include it in the error
      if (error.response) {
        let errorMessage = 'An error occurred during login';
        
        // Handle HTTP error responses
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        const errorToThrow = new Error(errorMessage);
        errorToThrow.response = {
          ...error.response,
          data: error.response.data || { message: error.message }
        };
        throw errorToThrow;
      }
      
      throw error;
    }
  },
  
  // Register a new user
  register: async (userData) => {
    // Validate required fields
    const requiredFields = [
      { field: 'name', label: 'Full Name' },
      { field: 'email', label: 'Email' },
      { field: 'password', label: 'Password' },
      { field: 'passwordConfirm', label: 'Confirm Password' }
    ];
    
    const missingFields = [];
    requiredFields.forEach(({ field, label }) => {
      if (!userData[field] || userData[field].trim() === '') {
        missingFields.push(label);
      }
    });
    
    if (missingFields.length > 0) {
      throw new Error(`Please provide: ${missingFields.join(', ')}`);
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Please enter a valid email address');
    }
    
    // Password strength validation
    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    // Password match validation
    if (userData.password !== userData.passwordConfirm) {
      throw new Error('Passwords do not match');
    }
    
    // Name validation (basic check for minimum length)
    if (userData.name.trim().length < 2) {
      throw new Error('Please enter a valid name');
    }
    
    try {
      const response = await apiRequest('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name.trim(),
          email: userData.email.trim().toLowerCase(),
          password: userData.password,
          passwordConfirm: userData.passwordConfirm
        }),
      });

      // The server responds with { status: 'success', token: '...', data: { user: {...} } }
      if (response && response.token) {
        // Store the JWT token
        localStorage.setItem('token', response.token);

        // Store user data if available
        if (response.data && response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return { 
          success: true, 
          user: response.data.user,
          token: response.token
        };
      }

      throw new Error('Registration failed. Please try again.');
    } catch (error) {
      console.error('Registration failed:', error);
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response) {
        // Handle HTTP error responses
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid registration data';
        } else if (error.response.status === 409) {
          errorMessage = 'An account with this email already exists';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },
  
  // Logout the current user
  logout: async () => {
    try {
      // Call the logout endpoint
      await apiRequest('/logout', { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout API call failed, but clearing local data anyway:', error);
    } finally {
      // Clear all auth data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      
      // Clear any auth-related cookies
      document.cookie.split(';').forEach(c => {
        const name = c.trim().split('=')[0];
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }
  },
  
  // Get the current authenticated user
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return null;
      }
      
      // Check if token is expired
      if (isTokenExpired(token)) {
        const newToken = await refreshToken();
        if (!newToken) {
          cleanAuthData();
          return null;
        }
      }
      
      const response = await apiRequest('/auth/me');
      return response.user || null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      cleanAuthData();
      return null;
    }
  },
  
  // Request password reset
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },
  
  // Reset password with token
  resetPassword: async (token, password, passwordConfirm) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { token, password, passwordConfirm },
    });
  },
  
  // Update password
  updatePassword: async (currentPassword, newPassword, newPasswordConfirm) => {
    return apiRequest('/auth/update-password', {
      method: 'PATCH',
      body: { currentPassword, newPassword, newPasswordConfirm },
    });
  },
  
  // Verify email with token
  verifyEmail: async (token) => {
    return apiRequest('/auth/verify-email', {
      method: 'POST',
      body: { token },
    });
  },
  
  // Resend verification email
  resendVerificationEmail: async (email) => {
    return apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: { email },
    });
  }
};

// ============================================================================
// Events API
// ============================================================================
export const events = {
  // Create a new event
  createEvent: async (eventData) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    return apiRequest('/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(eventData),
    });
  },
  
  // Get all events
  getEvents: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    // Handle date filters specially
    if (filters.startDate) {
      const startDate = filters.startDate?.$gte || filters.startDate;
      if (startDate instanceof Date) {
        queryParams.append('startDate', startDate.toISOString());
      } else if (typeof startDate === 'string') {
        queryParams.append('startDate', startDate);
      }
      delete filters.startDate;
    }

    if (filters.endDate) {
      const endDate = filters.endDate?.$lte || filters.endDate;
      if (endDate instanceof Date) {
        queryParams.append('endDate', endDate.toISOString());
      } else if (typeof endDate === 'string') {
        queryParams.append('endDate', endDate);
      }
      delete filters.endDate;
    }
    
    // Add other filters to query params if provided
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else if (typeof value === 'object') {
          // Skip objects that aren't arrays (they were handled above)
          return;
        } else {
          queryParams.append(key, value);
        }
      }
    });
    
    const endpoint = '/api/v1/events';
    const queryString = queryParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    console.log('Fetching events from URL:', url);
    return apiRequest(url);
  },
  
  // Get a single event by ID
  getEvent: async (id) => {
    return apiRequest(`/events/${id}`);
  },
  
  // Update an event
  updateEvent: async (id, eventData) => {
    return apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: eventData,
    });
  },
  
  // Delete an event
  deleteEvent(id) {
    return apiRequest(`/events/${id}`, { method: 'DELETE' });
  },
  
  // Get pending tickets for an event
  getPendingTickets: async (eventId) => {
    return apiRequest(`/events/${eventId}/tickets/pending`);
  },
  
  // Get current user's tickets
  getMyTickets: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add any filters to the query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    // Using the correct endpoint for user tickets
    const url = queryString ? `/users/me/tickets?${queryString}` : '/users/me/tickets';
    
    console.log('Fetching user tickets from:', url);
    return apiRequest(url);
  }
};

// ============================================================================
// Helper function to check if user is authenticated
// ============================================================================
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    // Attempt to refresh the token
    refreshToken().catch(error => {
      console.error('Failed to refresh token:', error);
      cleanAuthData();
    });
    return false;
  }
  
  return true;
};

// ============================================================================
// Export all API functions
// ============================================================================
export const api = {
  auth,
  events,
  isAuthenticated,
  clearPendingRequests,
  cleanAuthData
};

// Export individual functions
export { 
  apiRequest,
  clearPendingRequests,
  cleanAuthData,
  isTokenExpired
};

export default api;

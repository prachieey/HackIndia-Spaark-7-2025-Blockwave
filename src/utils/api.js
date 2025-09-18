// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Helper function to handle API requests
async function apiRequest(endpoint, options = {}) {
  // Ensure endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${formattedEndpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    credentials: 'include',
  };

  console.log(`API Request: ${config.method || 'GET'} ${url}`, { options });

  try {
    const response = await fetch(url, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    let data;
    const contentType = response.headers.get('content-type');
    
    // Only parse as JSON if the content-type is application/json
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = text;
      }
    }

    console.log(`API Response [${response.status}]:`, { url, data });

    if (!response.ok) {
      const error = new Error(data?.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      error.response = response;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API request failed:', {
      url,
      error: error.message,
      status: error.status,
      data: error.data,
      stack: error.stack
    });
    
    // Enhance the error with more context
    if (!(error instanceof Error)) {
      const newError = new Error('API request failed');
      newError.originalError = error;
      throw newError;
    }
    
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: (credentials) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    
  logout: () => 
    apiRequest('/auth/logout', {
      method: 'GET',
    }),
    
  getCurrentUser: () => 
    apiRequest('/auth/me'),
};

export default apiRequest;

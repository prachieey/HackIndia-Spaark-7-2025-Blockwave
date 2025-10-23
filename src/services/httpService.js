import axios from 'axios';
import { API_BASE_URL } from '../config';
import { toast } from 'react-toastify';

// Create axios instance with default config
const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Flag to prevent multiple token refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token to requests
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is not a 401 or it's a retry request, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If we're already refreshing the token, add the request to the queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
      .then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return http(originalRequest);
      })
      .catch(err => {
        return Promise.reject(err);
      });
    }

    // Mark that we're refreshing the token
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        { refreshToken },
        { skipAuthRefresh: true } // Custom flag to prevent infinite loop
      );

      const { token: newToken, refreshToken: newRefreshToken } = data;
      
      // Store the new tokens
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      // Update the Authorization header
      http.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      
      // Process the queue with the new token
      processQueue(null, newToken);
      
      // Retry the original request
      return http(originalRequest);
    } catch (refreshError) {
      // If refresh fails, clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Process the queue with error
      processQueue(refreshError, null);
      
      // Redirect to login page if we're not already there
      if (window.location.pathname !== '/login') {
        toast.error('Your session has expired. Please log in again.');
        window.location.href = '/login';
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default http;

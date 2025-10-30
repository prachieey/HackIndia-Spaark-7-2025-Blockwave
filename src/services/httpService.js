import axios from 'axios';
import { API_BASE_URL } from '../config';
import { toast } from 'react-toastify';

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 30000,
});

const getAuthTokens = () => ({
  token: localStorage.getItem('scantyx_token'),
  refreshToken: localStorage.getItem('scantyx_refresh_token'),
});

const setAuthTokens = (token, refreshToken) => {
  if (token) {
    localStorage.setItem('scantyx_token', token);
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  if (refreshToken) localStorage.setItem('scantyx_refresh_token', refreshToken);
};

const clearAuthTokens = () => {
  localStorage.removeItem('scantyx_token');
  localStorage.removeItem('scantyx_refresh_token');
  delete http.defaults.headers.common['Authorization'];
};

// Helper to check if current route is public
const isPublicRoute = () => {
  const path = window.location.pathname;
  const publicRoutes = [
    '/',
    '/explore', 
    '/about', 
    '/signup', 
    '/forgot-password', 
    '/reset-password',
    '/login',
    '/events',
    '/events/blockchain',
    '/tickets',
    '/contact',
    '/testimonials',
    '/tickets',
    '/contact',
    '/testimonials',
    '/resell',
    '/payment',
    '/payment-success'
  ];
  
  // Check if the current path starts with any public route
  const isPublic = publicRoutes.some(route => 
    path === route || 
    path.startsWith(route + '/') ||
    path.startsWith(route + '?')
  );
  
  console.log(`Route check - Path: ${path}, Is Public: ${isPublic}`);
  return isPublic;
};

// Initialize Authorization header if already logged in
const initAuth = () => {
  const { token } = getAuthTokens();
  if (token) http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};
initAuth();

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

// ✅ Single request interceptor
http.interceptors.request.use(async (config) => {
  const { token, refreshToken } = getAuthTokens();

  if (config.url.includes('/auth/refresh-token') || config.skipAuthRefresh) {
    return config;
  }

  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired && refreshToken && !isRefreshing) {
        isRefreshing = true;
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh-token`,
          { refreshToken },
          { skipAuthRefresh: true }
        );

        const { token: newToken, refreshToken: newRefreshToken } = response.data.data;
        setAuthTokens(newToken, newRefreshToken);
        processQueue(null, newToken);
        isRefreshing = false;

        config.headers.Authorization = `Bearer ${newToken}`;
      } else if (!isExpired) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Error verifying token:', err);
    }
  }

  config.withCredentials = true;
  return config;
});

// ✅ Single response interceptor
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { token, refreshToken } = getAuthTokens();
    const isPublic = isPublicRoute();

    // Log the error for debugging
    console.error('HTTP Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      isPublicRoute: isPublic,
      path: window.location.pathname,
      config: originalRequest
    });

    // If it's a public route or the request was to a public API endpoint, just reject the promise
    const isPublicApiRequest = originalRequest?.url?.includes('/api/v1/events') && 
                             !originalRequest?.url?.includes('/api/v1/events/me');
    
    if (isPublic || isPublicApiRequest) {
      console.log('Public route or API request, skipping auth redirect');
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest?._retry) {
      // If no refresh token or already refreshing, logout
      if (!refreshToken || originalRequest?._retry) {
        console.log('No refresh token or already retrying, logging out');
        await logout();
        return Promise.reject(error);
      }

      // Set retry flag
      originalRequest._retry = true;

      try {
        console.log('Attempting to refresh token...');
        // Try to refresh the token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const { token: newToken, refreshToken: newRefreshToken } = response.data;
        
        // Update tokens
        console.log('Token refresh successful, updating tokens');
        setAuthTokens(newToken, newRefreshToken);
        
        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the original request
        console.log('Retrying original request with new token');
        return http(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // Only logout if not on a public route
        if (!isPublic) {
          console.log('Logging out due to token refresh failure');
          await logout();
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export const isAuthenticated = () => !!getAuthTokens().token;
export const getAuthHeaders = () => {
  const { token } = getAuthTokens();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export { getAuthTokens, setAuthTokens, clearAuthTokens };
export default http;

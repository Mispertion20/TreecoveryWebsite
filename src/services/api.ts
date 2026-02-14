import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getCsrfToken } from '../utils/csrf';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Track refresh attempts to avoid race conditions
let refreshPromise: Promise<void> | null = null;
const MAX_QUEUE_SIZE = 50;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any) => {
  const queue = failedQueue.splice(0, MAX_QUEUE_SIZE);
  queue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  // Clear any remaining requests
  if (failedQueue.length > 0) {
    console.warn(`Cleared ${failedQueue.length} queued requests`);
    failedQueue = [];
  }
};

// Request interceptor to add CSRF token
api.interceptors.request.use(
  (config) => {
    // Tokens are sent automatically via HttpOnly cookies
    // Add CSRF token for state-changing requests
    if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Check if we're already refreshing
      if (refreshPromise) {
        // Wait for existing refresh to complete
        try {
          await refreshPromise;
          // Retry the original request after refresh completes
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;

      // Create new refresh promise to prevent race conditions
      refreshPromise = (async () => {
        try {
          // Try to refresh the token (backend reads from cookies)
          await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true } // Important: send cookies
          );

          // New tokens are automatically set in cookies by backend
          processQueue(null);
        } catch (refreshError) {
          // Refresh failed, clear everything and redirect
          processQueue(refreshError);
          localStorage.removeItem('user');

          // Only redirect if not already on login page
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          throw refreshError;
        } finally {
          refreshPromise = null;
        }
      })();

      try {
        await refreshPromise;
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

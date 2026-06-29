import axios from 'axios';
import useAuthStore from '../store/auth.store';
import ENDPOINTS from './endpoints';

// Base API URL using standard environment or placeholder
const API_BASE_URL = 'https://api.servesaathi.com/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure request interceptor to inject Authorization token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Configure response interceptor to handle errors and token refreshes
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if 401 Unauthorized and not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to call token refresh
        const refreshResponse = await axios.post(`${API_BASE_URL}${ENDPOINTS.auth.refreshToken}`);
        const newToken = refreshResponse.data.token;
        
        if (newToken) {
          useAuthStore.getState().setToken(newToken);
          
          // Re-attach token and retry original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Force logout if token refresh fails
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    // Map server-provided message
    const errMsg = error.response?.data?.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errMsg));
  }
);

export default apiClient;

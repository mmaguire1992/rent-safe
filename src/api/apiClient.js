/**
 * API Client
 * Central axios instance with authentication and error handling
 */
import axios from 'axios';
import { BASE_URL } from './routes';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // If data is FormData, remove Content-Type header to let axios set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [API Client] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        '';

      // If the backend indicates the account is inactive/deactivated, show a toast after redirect.
      // We store it because a hard redirect can prevent the toast from rendering in time.
      const lower = String(message).toLowerCase();
      const isDeactivated =
        lower.includes('deactivated') ||
        lower.includes('inactive') ||
        lower.includes('account is deactivated') ||
        lower.includes('user account is inactive');

      if (isDeactivated) {
        try {
          sessionStorage.setItem(
            'authRedirectToast',
            'Your account has been deactivated. Please contact support.'
          );
        } catch (_) {
          // no-op
        }
      }

      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function for GET requests
export const useGetApi = async (url, requireAuth = true) => {
  try {
    const config = {};
    if (requireAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
    }
    const response = await apiClient.get(url, config);
    return response.data;
  } catch (error) {
    console.error(`Error in GET ${url}:`, error);
    throw error;
  }
};

// Helper function for POST requests
export const usePostApi = async (url, requireAuth = true, data = {}, options = {}) => {
  try {
    const config = {};
    if (requireAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
    }
    const response = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    if (!options?.silent) {
      console.error(`Error in POST ${url}:`, error);
    }
    throw error;
  }
};

// Helper function for PUT requests
export const usePutApi = async (url, requireAuth = true, data = {}) => {
  try {
    const config = {};
    if (requireAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
    }
    const response = await apiClient.put(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`Error in PUT ${url}:`, error);
    throw error;
  }
};

// Helper function for DELETE requests
export const useDeleteApi = async (url, requireAuth = true, options = {}) => {
  try {
    const config = {};
    if (requireAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
    }
    const response = await apiClient.delete(url, config);
    return response.data;
  } catch (error) {
    if (!options?.silent) {
      console.error(`Error in DELETE ${url}:`, error);
    }
    throw error;
  }
};

// Helper function for PATCH requests
export const usePatchApi = async (url, requireAuth = true, data = {}) => {
  try {
    const config = {};
    if (requireAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
    }
    const response = await apiClient.patch(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`Error in PATCH ${url}:`, error);
    throw error;
  }
};

export default apiClient;


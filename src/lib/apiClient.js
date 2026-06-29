import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('5173')) {
      return 'http://localhost:5000/api';
    }
  }
  return '/api';
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach authentication token if present
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('vitalAdminToken');
      if (adminToken && adminToken !== 'authenticated_true') {
        config.headers['Authorization'] = `Bearer ${adminToken}`;
      } else {
        const saved = localStorage.getItem('vital_sb_session');
        if (saved) {
          try {
            const session = JSON.parse(saved);
            if (session?.access_token) {
              config.headers['Authorization'] = `Bearer ${session.access_token}`;
            }
          } catch (e) {
            console.error("Error parsing auth session in apiClient request interceptor", e);
          }
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1s initial delay

// Global cache to track if backend is completely offline
let isBackendGraveOffline = false;

// Response Interceptor: Handle connection refusal and retries
apiClient.interceptors.response.use(
  (response) => {
    isBackendGraveOffline = false; // Reset offline status if a request succeeds
    return response;
  },
  async (error) => {
    const { config } = error;
    
    if (!config) {
      return Promise.reject(error);
    }
    
    // If we already detected the backend is offline, fail fast without waiting or retrying
    if (isBackendGraveOffline) {
      return Promise.reject(error);
    }
    
    config.__retryCount = config.__retryCount || 0;
    
    // Check if error is network error or connection refusal
    const isNetworkError = !error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error';
    const isRefusal = error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED';
    
    // If the server is completely unreachable/offline, set flag and do NOT retry (fail fast)
    if (isRefusal) {
      isBackendGraveOffline = true;
      console.warn(`[Vital Agro] Local Flask server appears to be offline. Switching to fast offline fallback mode.`);
      return Promise.reject(error);
    }
    
    if (isNetworkError && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      console.warn(`[Vital Agro] API client network/connection issue. Retrying request (${config.__retryCount}/${MAX_RETRIES}) for URL: ${config.url}`);
      
      const delay = RETRY_DELAY * Math.pow(2, config.__retryCount - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiClient(config);
    }
    
    return Promise.reject(error);
  }
);

export const checkServerHealth = async () => {
  try {
    const res = await apiClient.get('/products', { 
      timeout: 2000,
      // Avoid retrying health checks if they fail to prevent infinite loops/long delays
      __retryCount: MAX_RETRIES 
    });
    return res.status === 200;
  } catch (e) {
    return false;
  }
};

export default apiClient;

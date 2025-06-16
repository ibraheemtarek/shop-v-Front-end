// API configuration

// Use local proxy for API requests to avoid CORS and SameSite cookie issues
const getApiBaseUrl = () => {
  // In development, use the local proxy which is configured in vite.config.ts
  // This prevents SameSite cookie issues because requests come from the same origin
  if (import.meta.env.DEV) {
    return '';
  }
  
  // In production, point directly to the backend API
  return 'https://shop-v-backend-production.up.railway.app';
};

const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 seconds
  
  // Production configuration
  PRODUCTION_DOMAIN: 'shop-v-front-end.vercel.app',
  // CSRF protection has been disabled for this project
  CSRF_ENABLED: false,
  
  // Helper to check if we're in a cross-origin situation in production
  isCrossOrigin: () => {
    return !import.meta.env.DEV && window.location.hostname !== new URL(getApiBaseUrl()).hostname;
  }
};

export default API_CONFIG;

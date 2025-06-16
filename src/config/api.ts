// API configuration

// Use local proxy for API requests to avoid CORS and SameSite cookie issues
const getApiBaseUrl = () => {
  // In development, use the local proxy which is configured in vite.config.ts
  // This prevents SameSite cookie issues because requests come from the same origin
  if (import.meta.env.DEV) {
    return '';
  }
  
  // In production, the app and API are typically hosted on the same domain
  // Change this if your production setup is different
  return '';
};

const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 seconds
};

export default API_CONFIG;

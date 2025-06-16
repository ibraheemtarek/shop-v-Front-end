import API_CONFIG from '../config/api';

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Queue of callbacks to run after token refresh
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Add a callback to the refresh queue
 */
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

/**
 * Execute all callbacks in the refresh queue with the new token
 */
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

/**
 * Define request type for token refresh
 */
interface ApiRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
}

/**
 * Retry original request with new token
 */
const retryOriginalRequest = (originalRequest: ApiRequest, token: string): Promise<ApiRequest> => {
  return new Promise((resolve) => {
    const headers = {...(originalRequest.headers || {})};
    headers['Authorization'] = `Bearer ${token}`;
    resolve({
      ...originalRequest,
      headers
    });
  });
};

/**
 * Base API service for making HTTP requests
 */
class ApiService {
  /* CSRF protection has been disabled for this project */
  
  // /**
  //  * Get CSRF token for secure requests - DISABLED
  //  * @returns {Promise<string>} CSRF token
  //  */
  // async getCsrfToken(): Promise<string> {
  //   // This method is disabled as CSRF protection is not used in this project
  //   return '';
  // }

  // /**
  //  * Check if an endpoint requires CSRF protection - DISABLED
  //  * @param endpoint - API endpoint
  //  * @returns boolean indicating if CSRF protection is required
  //  */
  // private requiresCsrfProtection(endpoint: string): boolean {
  //   // This method is disabled as CSRF protection is not used in this project
  //   return false;
  // }
  /**
   * Make a GET request
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns Promise with response data
   */
  /**
   * Handle unauthorized errors (401) by refreshing the token
   * @param originalRequest The original failed request
   */
  async handleTokenRefresh(originalRequest: ApiRequest): Promise<ApiRequest> {
    try {
      if (!isRefreshing) {
        isRefreshing = true;
        console.log('Access token expired, attempting refresh...');
        
        // Call the refresh token endpoint which will use the httpOnly refresh token cookie
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Token refresh failed');
        }
        
        const data = await response.json();
        const newToken = data.token;
        
        // Store the new token
        localStorage.setItem('token', newToken);
        
        // Notify all subscribers that the token has been refreshed
        onTokenRefreshed(newToken);
        
        // Return updated original request
        return retryOriginalRequest(originalRequest, newToken);
      } else {
        // We're already refreshing, add this request to the queue
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            resolve(retryOriginalRequest(originalRequest, token));
          });
        });
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear auth data since refresh failed
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      // Redirect to login
      window.location.href = '/login';
      throw error;
    } finally {
      isRefreshing = false;
    }
  }
  
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    // Use the configured API base URL
    const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('Making API request to:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      credentials: 'include', // Include cookies for CSRF
    });
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      } catch (e) {
        throw new Error(`API error: ${response.status}`);
      }
    }
    
    return response.json();
  }
  
  /**
   * Make a POST request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @returns Promise with response data
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    // Use the configured API base URL
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log('Making POST request to:', url);
    
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Check if we're in cross-origin mode
      const crossOriginMode = API_CONFIG.isCrossOrigin();
      if (crossOriginMode) {
        // Add headers to help the server identify the client in cross-origin mode
        headers['Origin'] = window.location.origin;
        headers['X-Frontend-Domain'] = API_CONFIG.PRODUCTION_DOMAIN;
        console.log('Added cross-origin headers for production environment');
      }
      
      // CSRF protection has been disabled for this project
      
      // Add the request debugging info
      console.debug('Sending request with headers:', JSON.stringify(headers));
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include', 
      });
      
      // Log response status and headers for debugging
      console.debug(`Response status: ${response.status}`);
      console.debug('Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        // If unauthorized and we have a token, try to refresh it
        if (response.status === 401 && localStorage.getItem('token') && 
            !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/refresh')) {
          // Clone the original request for retry
          const originalRequest = {
            method: 'POST',
            url: `${API_CONFIG.BASE_URL}${endpoint}`,
            headers,
            body: data
          };
          
          // Try to refresh the token and retry the request
          await this.handleTokenRefresh(originalRequest);
          return this.post<T>(endpoint, data);
        }

        try {
          const errorData = await response.json();
          console.error('API error details:', errorData);
          throw new Error(errorData.message || `API error: ${response.status}`);
        } catch (e) {
          throw new Error(`API error: ${response.status}`);
        }
      }
      
      return await response.json();
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }
  
  /**
   * Make a PUT request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @returns Promise with response data
   */
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    // Use the configured API base URL
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log('Making PUT request to:', url);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Check if we're in cross-origin mode
    const crossOriginMode = API_CONFIG.isCrossOrigin();
    if (crossOriginMode) {
      // Add headers to help the server identify the client in cross-origin mode
      headers['Origin'] = window.location.origin;
      headers['X-Frontend-Domain'] = API_CONFIG.PRODUCTION_DOMAIN;
      console.log('Added cross-origin headers for production environment');
    }
    
    // CSRF protection has been disabled for this project
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      credentials: 'include', // Include cookies for CSRF
    });

    if (!response.ok) {
      // If unauthorized and we have a token, try to refresh it
      if (response.status === 401 && localStorage.getItem('token') && 
          !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/refresh')) {
        // Clone the original request for retry
        const originalRequest = {
          method: 'PUT',
          url: `${API_CONFIG.BASE_URL}${endpoint}`,
          headers,
          body: data
        };
        
        // Try to refresh the token and retry the request
        await this.handleTokenRefresh(originalRequest);
        return this.put<T>(endpoint, data);
      }

      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      } catch (e) {
        throw new Error(`API error: ${response.status}`);
      }
    }
    
    return response.json();
  }
  
  /**
   * Make a DELETE request
   * @param endpoint - API endpoint
   * @returns Promise with response data
   */
  async delete<T>(endpoint: string): Promise<T> {
    // Use the configured API base URL
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log('Making DELETE request to:', url);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Check if we're in cross-origin mode
    const crossOriginMode = API_CONFIG.isCrossOrigin();
    if (crossOriginMode) {
      // Add headers to help the server identify the client in cross-origin mode
      headers['Origin'] = window.location.origin;
      headers['X-Frontend-Domain'] = API_CONFIG.PRODUCTION_DOMAIN;
      console.log('Added cross-origin headers for production environment');
    }
    
    // CSRF protection has been disabled for this project
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      credentials: 'include', // Include cookies for CSRF
    });

    if (!response.ok) {
      // If unauthorized and we have a token, try to refresh it
      if (response.status === 401 && localStorage.getItem('token') && 
          !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/refresh')) {
        // Clone the original request for retry
        const originalRequest = {
          method: 'DELETE',
          url: `${API_CONFIG.BASE_URL}${endpoint}`,
          headers
        };
        
        // Try to refresh the token and retry the request
        await this.handleTokenRefresh(originalRequest);
        return this.delete<T>(endpoint);
      }

      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      } catch (e) {
        throw new Error(`API error: ${response.status}`);
      }
    }
    
    return response.json();
  }
  /**
   * Upload a file or multiple files
   * @param endpoint - API endpoint
   * @param formData - FormData with files
   * @returns Promise with response data
   */
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    // Use the configured API base URL
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log('Making file upload request to:', url);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Check if we're in cross-origin mode
    const crossOriginMode = API_CONFIG.isCrossOrigin();
    if (crossOriginMode) {
      // Add headers to help the server identify the client in cross-origin mode
      headers['Origin'] = window.location.origin;
      headers['X-Frontend-Domain'] = API_CONFIG.PRODUCTION_DOMAIN;
      console.log('Added cross-origin headers for production environment');
    }
    
    // CSRF protection has been disabled for this project
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include', // Include cookies for CSRF
    });

    if (!response.ok) {
      // If unauthorized and we have a token, try to refresh it
      if (response.status === 401 && localStorage.getItem('token') && 
          !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/refresh')) {
        // For file uploads, we need to recreate the formData - can't be cloned
        // Create a minimal request object since we can't clone FormData
        const minimalRequest: ApiRequest = {
          method: 'POST',
          url: `${API_CONFIG.BASE_URL}${endpoint}`,
          headers: {}
        };
        
        await this.handleTokenRefresh(minimalRequest);
        
        // Simply retry the uploadFile call after token refresh
        return this.uploadFile<T>(endpoint, formData);
      }

      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      } catch (e) {
        throw new Error(`API error: ${response.status}`);
      }
    }
    
    return response.json();
  }
}

export default new ApiService();

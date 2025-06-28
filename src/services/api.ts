import API_CONFIG from '../config/api';

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Token refresh timer reference
let tokenRefreshTimer: ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null = null;
// Queue of callbacks to run after token refresh
let refreshSubscribers: Array<(token: string) => void> = [];
// Track recent authentication to avoid premature refresh attempts
const recentAuthTime: { [key: string]: number } = {};
// Track last token check time to prevent frequent checks
const lastTokenCheck: { [key: string]: number } = {};
// Track last refresh attempt time to prevent frequent refreshes
const lastRefreshAttempt: { [key: string]: number } = {};

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

  /**
   * Marks that authentication has recently happened for a specific token type
   * This prevents premature refresh attempts before HTTP-only cookies are set
   */
  markRecentAuth(isAdmin: boolean = false) {
    const tokenType = isAdmin ? 'admin' : 'user';
    recentAuthTime[tokenType] = Date.now();
    console.log(`Marked recent ${tokenType} authentication at ${new Date().toISOString()}`);
    
    // Store in sessionStorage for synchronization across tabs
    sessionStorage.setItem(`recent${tokenType}Auth`, Date.now().toString());
  }
  
  /**
   * Checks if we're within the post-authentication grace period
   * Returns true if recent authentication happened within the specified time window
   */
  isWithinAuthGracePeriod(isAdmin: boolean = false, graceWindowMs: number = 30000): boolean {
    const tokenType = isAdmin ? 'admin' : 'user';
    
    // Check both memory and sessionStorage (for cross-tab support)
    const lastAuthMemory = recentAuthTime[tokenType] || 0;
    const lastAuthStorage = parseInt(sessionStorage.getItem(`recent${tokenType}Auth`) || '0', 10);
    const lastAuth = Math.max(lastAuthMemory, lastAuthStorage);
    
    const isRecent = Date.now() - lastAuth < graceWindowMs;
    
    if (isRecent) {
      console.log(`${tokenType} auth in grace period (${Math.floor((Date.now() - lastAuth)/1000)}s ago), skipping refresh check`);
    }
    
    return isRecent;
  }

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
   * Parse JWT token to get expiration time
   * @param token JWT token
   * @returns Expiration timestamp in milliseconds or null if invalid
   */
  parseTokenExpiration(token: string): number | null {
    try {
      // Get the payload part of the JWT (second part)
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      
      // Convert base64url to regular base64
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Decode the base64 string and parse as JSON
      const jsonPayload = JSON.parse(atob(base64));
      
      // Get expiration time (exp) and convert to milliseconds
      if (jsonPayload.exp) {
        return jsonPayload.exp * 1000; // Convert seconds to milliseconds
      }
      return null;
    } catch (e) {
      console.error('Error parsing token:', e);
      return null;
    }
  }

  /**
   * Check if token is about to expire and refresh it proactively
   * @param token Current access token
   * @param isAdmin Whether this is an admin token
   * @returns Promise that resolves when token check is complete
   */
  async checkTokenExpiration(token: string, isAdmin: boolean = false): Promise<void> {
    const tokenType = isAdmin ? 'admin' : 'user';
    
    // Don't attempt to check an empty token
    if (!token) {
      console.log(`No ${tokenType} token provided for expiration check`);
      return;
    }
    
    // Prevent checking too frequently by throttling
    const checkKey = `last${tokenType.charAt(0).toUpperCase() + tokenType.slice(1)}ExpirationCheck`;
    const lastCheckTime = parseInt(sessionStorage.getItem(checkKey) || '0', 10);
    const now = Date.now();
    const checkMinInterval = 30000; // 30 seconds between checks
    
    if (now - lastCheckTime < checkMinInterval) {
      // Skip check if we checked recently
      console.debug(`Skipping ${tokenType} token expiration check - checked too recently`);
      return;
    }
    
    // Update last check time
    sessionStorage.setItem(checkKey, now.toString());
    
    // Skip token check if we're in the grace period after a recent login
    // This prevents premature refresh attempts before HTTP-only cookies are properly set
    if (this.isWithinAuthGracePeriod(isAdmin, 15000)) { // 15-second grace period
      console.log(`Skipping ${tokenType} token check - within post-login grace period`);
      return;
    }
    
    try {
      const expTime = this.parseTokenExpiration(token);
      
      // If we can't parse the token's expiration time
      if (!expTime) {
        console.warn(`Invalid ${tokenType} token format, cannot determine expiration`);
        // Don't attempt to refresh invalid tokens, but don't trigger logout either
        // The token might still be valid even if we can't parse it
        return;
      }
      
      const currentTime = Date.now();
      const timeToExpire = expTime - currentTime;
      
      console.debug(`${tokenType} token expires in ${Math.floor(timeToExpire/1000)} seconds`);
      
      // Different strategies based on token expiration time:
      // 1. If token expires soon (within 5 minutes), refresh proactively
      // 2. If token recently expired (less than 1 hour ago), try to recover it
      // 3. If token is valid and not expiring soon, do nothing
      
      // Case 1: Token expiring soon but still valid
      if (timeToExpire < 300000 && timeToExpire > 0) {
        console.log(`${tokenType} token expiring soon (in ${Math.floor(timeToExpire/1000)}s), refreshing proactively`);
        try {
          const newToken = await this.refreshAccessToken(isAdmin);
          console.log(`Proactive ${tokenType} token refresh successful, new token acquired`);
          return;
        } catch (error) {
          // Don't fail on proactive refresh failures
          console.warn(`Proactive ${tokenType} token refresh failed:`, error);
          console.log(`Continuing with current ${tokenType} token until expiration`);
          // Continue with current token - don't logout for proactive refresh failures
          return;
        }
      }
      
      // Case 2: Token already expired but not too old - try to recover
      else if (timeToExpire <= 0 && timeToExpire > -3600000) {
        console.log(`${tokenType} token recently expired (${Math.abs(Math.floor(timeToExpire/1000))}s ago), attempting recovery`);
        try {
          const newToken = await this.refreshAccessToken(isAdmin);
          console.log(`${tokenType} token recovery successful, new token acquired`);
          return;
        } catch (error) {
          if (error instanceof Error && error.message.includes('Auth error')) {
            console.error(`${tokenType} token recovery failed with auth error:`, error);
            // Let the auth contexts handle the logout flow
          } else {
            console.warn(`${tokenType} token recovery failed with non-auth error:`, error);
            // For network errors etc., don't trigger logout
          }
          return;
        }
      }
      
      // Case 3: Token is valid and not expiring soon - nothing to do
      else if (timeToExpire > 300000) {
        console.debug(`${tokenType} token valid for ${Math.floor(timeToExpire/1000)}s more, no action needed`);
      }
      
      // Case 4: Token expired long ago - unlikely to be recoverable
      else {
        console.warn(`${tokenType} token expired too long ago (${Math.abs(Math.floor(timeToExpire/1000))}s), unlikely to be refreshable`);
        // Don't attempt refresh for very old tokens
      }
    } catch (error) {
      console.error(`Error checking ${tokenType} token expiration:`, error);
      // Don't trigger logout on expiration check errors, just let the user continue
    }
  }

  /**
   * Setup automatic token refresh check based on expiration time
   */
  setupTokenRefreshCheck() {
    // Clear existing timer if any
    if (tokenRefreshTimer) {
      clearInterval(tokenRefreshTimer);
      console.log('Cleared existing token refresh timer');
    }
    
    // Initial delay before starting token checks after page load
    // This is important for cross-origin scenarios where cookie setup takes time
    const initialDelay = 5000; // 5 second initial delay
    
    console.log(`Setting up token refresh timer with ${initialDelay}ms initial delay`);
    
    // Set a timeout for the initial delay
    setTimeout(() => {
      console.log('Initial delay complete, starting periodic token checks');
      
      // Check token expiration every minute
      tokenRefreshTimer = setInterval(() => {
        // Check both user and admin tokens if they exist
        const userToken = localStorage.getItem('token');
        const adminToken = localStorage.getItem('adminToken');
        
        if (userToken) {
          this.checkTokenExpiration(userToken, false).catch(err => {
            console.error('User token check failed:', err);
          });
        }
        
        if (adminToken) {
          this.checkTokenExpiration(adminToken, true).catch(err => {
            console.error('Admin token check failed:', err);
          });
        }
      }, 60000); // Check every minute
    }, initialDelay);
  }

  /**
   * Refresh the access token
   * @param isAdmin - Whether to refresh admin token or user token
   * @returns Promise with the new token
   */
  async refreshAccessToken(isAdmin: boolean = false): Promise<string> {
    // Use different refresh status tracking based on token type
    if (isRefreshing) {
      console.log(`Token refresh already in progress, waiting for completion...`);
      // If already refreshing, wait for it to complete
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          resolve(token);
        });
      });
    }
    
    // Add throttling to prevent excessive refresh attempts
    const refreshKey = isAdmin ? 'lastAdminRefreshAttempt' : 'lastUserRefreshAttempt';
    const lastRefreshTime = parseInt(sessionStorage.getItem(refreshKey) || '0', 10);
    const now = Date.now();
    const refreshMinInterval = 5000; // Minimum 5 seconds between refresh attempts
    
    if (now - lastRefreshTime < refreshMinInterval) {
      console.log(`Skipping ${isAdmin ? 'admin' : 'user'} token refresh - attempted too recently`);
      return isAdmin ? localStorage.getItem('adminToken') || '' : localStorage.getItem('token') || '';
    }
    
    // Update last refresh attempt time
    sessionStorage.setItem(refreshKey, now.toString());
    
    try {
      isRefreshing = true;
      console.log(`Refreshing ${isAdmin ? 'admin' : 'user'} access token...`);
      
      // Check if we're in cross-origin mode
      const crossOriginMode = API_CONFIG.isCrossOrigin();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (crossOriginMode) {
        // Add headers to help the server identify the client in cross-origin mode
        headers['Origin'] = window.location.origin;
        headers['X-Frontend-Domain'] = API_CONFIG.PRODUCTION_DOMAIN;
        headers['X-Requested-With'] = 'XMLHttpRequest';
        console.log('Added cross-origin headers for token refresh');
        console.log('Cross-origin mode active, ensuring SameSite=None cookies are handled correctly');
      }
      
      // Add token type indicator to help server distinguish between admin and user refresh
      if (isAdmin) {
        headers['X-Token-Type'] = 'admin';
      }
      
      // Call the refresh token endpoint which will use the httpOnly refresh token cookie
      console.log(`Calling refresh endpoint: ${API_CONFIG.BASE_URL}/api/auth/refresh`);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers,
        credentials: 'include', // Important for including cookies with the request
      });
      
      // Log response details for debugging
      console.debug(`Refresh token response status: ${response.status}`);
      
      // Parse the response - even error responses
      let data;
      let errorText = '';
      
      try {
        const responseText = await response.text();
        try {
          // Try to parse as JSON
          data = JSON.parse(responseText);
          errorText = data.message || responseText;
        } catch (e) {
          // If not valid JSON, use as text
          errorText = responseText;
        }
      } catch (e) {
        errorText = 'Could not read response body';
      }
      
      // Handle HTTP status codes based on backend implementation:
      // - 401: Authentication error (invalid token, no token) - should logout
      // - 500: Server error - shouldn't logout, just retry later
      if (!response.ok) {
        const statusCode = response.status;
        const errorType = data?.error || 'unknown_error';
        
        console.error(`Token refresh failed with status ${statusCode}:`, errorText);
        
        // For authentication failures, we need to evaluate if we should logout
        if (statusCode === 401 && (errorType === 'no_token' || errorType === 'invalid_token')) {
          console.warn(`Authentication failure during token refresh: ${errorType}`);
          
          // Check if this is happening during the post-login grace period
          // The backend returns 'no_token' when the refresh token cookie isn't present
          if (errorType === 'no_token') {
            if (this.isWithinAuthGracePeriod(isAdmin, 30000)) {
              console.warn('No refresh token cookie during grace period - normal after fresh login');
              console.log('Will retry token refresh later once cookie is available');
              // Return current token and avoid logout during grace period
              return isAdmin ? localStorage.getItem('adminToken') || '' : localStorage.getItem('token') || '';
            } else {
              // If we're not in a grace period, the refresh token cookie is genuinely missing
              console.warn('Refresh token cookie missing outside of grace period');
              throw new Error(`Auth error: ${errorType}`);
            }
          } 
          // Invalid token means the refresh token exists but is invalid/expired
          else if (errorType === 'invalid_token') {
            console.warn('Invalid refresh token detected');
            throw new Error(`Auth error: ${errorType}`);
          }
          
          // Otherwise it's a genuine authentication failure
          throw new Error(`Auth error: ${errorType}`);
        } 
        // For server errors or other issues, we can keep the current token and try again later
        else {
          console.warn(`Server or network error during token refresh. Will retry later.`);
          // Return current token and don't trigger logout for server errors
          return isAdmin ? localStorage.getItem('adminToken') || '' : localStorage.getItem('token') || '';
        }
      }
      
      // Process successful response
      const newToken = data.token;
      
      if (!newToken) {
        console.error('Token refresh succeeded but no token was returned');
        throw new Error('No token returned from refresh endpoint');
      }
      
      // Store the new token in the appropriate storage key
      if (isAdmin) {
        localStorage.setItem('adminToken', newToken);
      } else {
        localStorage.setItem('token', newToken);
      }
      
      // Notify subscribers that token has been refreshed
      onTokenRefreshed(newToken);
      
      return newToken;
    } catch (error) {
      console.error(`${isAdmin ? 'Admin' : 'User'} token refresh failed:`, error);
      
      // Only clear tokens and logout for authentication errors
      if (error instanceof Error && 
          (error.message.includes('Auth error') || 
           error.message.includes('No token returned'))) {
        console.warn('Confirmed authentication failure, proceeding with logout');
        if (isAdmin) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
        }
      } else {
        // For other errors like network issues, don't clear tokens
        console.warn('Non-authentication error during token refresh, keeping tokens');
      }
      
      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  /**
   * Handle unauthorized errors (401) by refreshing the token
   * @param originalRequest The original failed request
   * @param isAdmin Whether to use admin token refresh or user token refresh
   */
  async handleTokenRefresh(originalRequest: ApiRequest, isAdmin: boolean = false): Promise<ApiRequest> {
    try {
      const newToken = await this.refreshAccessToken(isAdmin);
      return retryOriginalRequest(originalRequest, newToken);
    } catch (error) {
      console.error(`${isAdmin ? 'Admin' : 'User'} token refresh failed during request retry:`, error);
      throw error;
    }
  }
  
  async get<T>(endpoint: string, params?: Record<string, string>, customToken?: string): Promise<T> {
    // Use the configured API base URL
    const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    // Use the custom token if provided (e.g., adminToken), otherwise fall back to regular token
    const token = customToken || localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('Making API request to:', url.toString(), 'with token type:', customToken ? 'custom token' : 'user token');
    
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
   * @param customToken - Optional custom token to use instead of localStorage token
   * @param isAdmin - Whether to use admin token or user token
   * @returns Promise with response data
   */
  async post<T>(endpoint: string, data: unknown, customToken?: string, isAdmin: boolean = false): Promise<T> {
    // Use the configured API base URL
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log(`Making ${isAdmin ? 'admin' : 'user'} POST request to:`, url);
    
    try {
      // Use custom token if provided, otherwise get appropriate token based on isAdmin flag
      const token = customToken || (isAdmin ? localStorage.getItem('adminToken') : localStorage.getItem('token'));
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
      
      // Add token type indicator to help server distinguish between admin and user tokens
      if (isAdmin) {
        headers['X-Token-Type'] = 'admin';
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
        // If unauthorized, try to refresh the appropriate token based on isAdmin flag
        if (response.status === 401 && 
            ((isAdmin && localStorage.getItem('adminToken')) || (!isAdmin && localStorage.getItem('token'))) && 
            !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/refresh')) {
          // Clone the original request for retry
          const originalRequest = {
            method: 'POST',
            url: `${API_CONFIG.BASE_URL}${endpoint}`,
            headers,
            body: data
          };
          
          // Try to refresh the token and retry the request
          await this.handleTokenRefresh(originalRequest, isAdmin);
          return this.post<T>(endpoint, data, customToken, isAdmin);
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
      console.error(`${isAdmin ? 'Admin' : 'User'} POST request failed:`, error);
      throw error;
    }
  }
  
  /**
   * Make a PUT request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param customToken - Optional custom token to use instead of localStorage token
   * @param isAdmin - Whether to use admin token or user token
   * @returns Promise with response data
   */
  async put<T>(endpoint: string, data: unknown, customToken?: string, isAdmin: boolean = false): Promise<T> {
    // Use the configured API base URL
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log(`Making ${isAdmin ? 'admin' : 'user'} PUT request to:`, url);
    
    try {
      // Use custom token if provided, otherwise get appropriate token based on isAdmin flag
      const token = customToken || (isAdmin ? localStorage.getItem('adminToken') : localStorage.getItem('token'));
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
      
      // Add token type indicator to help server distinguish between admin and user tokens
      if (isAdmin) {
        headers['X-Token-Type'] = 'admin';
      }
      
      // CSRF protection has been disabled for this project
      
      // Add the request debugging info
      console.debug('Sending request with headers:', JSON.stringify(headers));
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for CSRF
      });
      
      // Log response status and headers for debugging
      console.debug(`Response status: ${response.status}`);
      console.debug('Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        // If unauthorized, try to refresh the appropriate token based on isAdmin flag
        if (response.status === 401 && 
            ((isAdmin && localStorage.getItem('adminToken')) || (!isAdmin && localStorage.getItem('token'))) && 
            !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/refresh')) {
          // Clone the original request for retry
          const originalRequest = {
            method: 'PUT',
            url: `${API_CONFIG.BASE_URL}${endpoint}`,
            headers,
            body: data
          };
          
          // Try to refresh the token and retry the request
          await this.handleTokenRefresh(originalRequest, isAdmin);
          return this.put<T>(endpoint, data, customToken, isAdmin);
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
      console.error(`${isAdmin ? 'Admin' : 'User'} PUT request failed:`, error);
      throw error;
    }
  }
  
  /**
   * Make a DELETE request
   * @param endpoint - API endpoint
   * @param customToken - Optional custom token to use instead of localStorage token
   * @param isAdmin - Whether to use admin token or user token
   * @returns Promise with response data
   */
  async delete<T>(endpoint: string, customToken?: string, isAdmin: boolean = false): Promise<T> {
    // Use the configured API base URL
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log(`Making ${isAdmin ? 'admin' : 'user'} DELETE request to:`, url);
    
    try {
      // Use custom token if provided, otherwise get appropriate token based on isAdmin flag
      const token = customToken || (isAdmin ? localStorage.getItem('adminToken') : localStorage.getItem('token'));
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
      
      // Add token type indicator to help server distinguish between admin and user tokens
      if (isAdmin) {
        headers['X-Token-Type'] = 'admin';
      }
      
      // CSRF protection has been disabled for this project
      
      // Add the request debugging info
      console.debug('Sending request with headers:', JSON.stringify(headers));
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        credentials: 'include', // Include cookies for CSRF
      });
      
      // Log response status and headers for debugging
      console.debug(`Response status: ${response.status}`);
      console.debug('Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        // If unauthorized, try to refresh the appropriate token based on isAdmin flag
        if (response.status === 401 && 
            ((isAdmin && localStorage.getItem('adminToken')) || (!isAdmin && localStorage.getItem('token'))) && 
            !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/refresh')) {
          // Clone the original request for retry
          const originalRequest = {
            method: 'DELETE',
            url: `${API_CONFIG.BASE_URL}${endpoint}`,
            headers
          };
          
          // Try to refresh the token and retry the request
          await this.handleTokenRefresh(originalRequest, isAdmin);
          return this.delete<T>(endpoint, customToken, isAdmin);
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
      console.error(`${isAdmin ? 'Admin' : 'User'} DELETE request failed:`, error);
      throw error;
    }
  }
  /**
   * Upload a file or multiple files
   * @param endpoint - API endpoint
   * @param formData - FormData with files
   * @param customToken - Optional custom token to use instead of localStorage token
   * @param isAdmin - Whether to use admin token or user token
   * @returns Promise with response data
   */
  async uploadFile<T>(endpoint: string, formData: FormData, customToken?: string, isAdmin: boolean = false): Promise<T> {
    // Use the configured API base URL
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log(`Making ${isAdmin ? 'admin' : 'user'} file upload request to:`, url);
    
    // Log the formData contents for debugging (without reading the file contents)
    try {
      console.log('FormData keys:');
      for (const key of formData.keys()) {
        const value = formData.get(key);
        if (value instanceof File) {
          console.log(`- ${key}: File (name: ${value.name}, type: ${value.type}, size: ${value.size} bytes)`);
        } else {
          console.log(`- ${key}: ${String(value).substring(0, 100)}${String(value).length > 100 ? '...' : ''}`);
        }
      }
    } catch (error) {
      console.error('Error logging FormData:', error);
    }
    
    // Use custom token if provided, otherwise get appropriate token based on isAdmin flag
    const token = customToken || (isAdmin ? localStorage.getItem('adminToken') : localStorage.getItem('token'));
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
    
    // Add token type indicator to help server distinguish between admin and user tokens
    if (isAdmin) {
      headers['X-Token-Type'] = 'admin';
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      console.log(`Upload response status: ${response.status}`);
      
      // Log response headers for debugging
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('Response headers:', responseHeaders);

      if (!response.ok) {
        // If unauthorized and we have a token, try to refresh it
        if (response.status === 401 && localStorage.getItem('token') && 
            !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/refresh')) {
          console.log('Unauthorized response, attempting token refresh...');
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

        // Try to get detailed error information
        let errorMessage = `API error: ${response.status}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error('API error details:', errorData);
            errorMessage = errorData.message || errorMessage;
          } else {
            const errorText = await response.text();
            console.error('API error text:', errorText);
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      // Try to parse the response as JSON
      try {
        const data = await response.json();
        console.log('Upload successful, response data:', data);
        return data;
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        // If we can't parse as JSON, try to get the text
        try {
          const text = await response.text();
          console.log('Response text:', text);
          throw new Error('Invalid JSON response from server');
        } catch (textError) {
          console.error('Error getting response text:', textError);
          throw new Error('Could not parse server response');
        }
      }
    } catch (error) {
      console.error('File upload request failed:', error);
      throw error;
    }
  }
}

// Create API service instance
const apiService = new ApiService();

// Setup token refresh check on initialization
if (typeof window !== 'undefined') {
  apiService.setupTokenRefreshCheck();
}

export default apiService;

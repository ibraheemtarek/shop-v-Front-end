import API_CONFIG from '../config/api';

/**
 * Base API service for making HTTP requests
 */
class ApiService {
  /**
   * Make a GET request
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns Promise with response data
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    // Construct the full URL by joining the base URL with the endpoint
    const fullUrl = `${window.location.origin}${endpoint}`;
    
    // Create URL object for query params
    const url = new URL(fullUrl);
    
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
  async post<T>(endpoint: string, data: any): Promise<T> {
    const url = `${window.location.origin}${endpoint}`;
    console.log('Making POST request to:', url, 'with data:', data);
    
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // For development/testing - simulate successful response if no backend
      if (import.meta.env.DEV && endpoint.includes('/api/users/register') && data.email === 'admin@admin.com') {
        console.log('DEV MODE: Simulating successful admin registration');
        return {
          _id: 'admin-mock-id-' + Date.now(),
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: 'admin',
          token: 'mock-admin-token-' + Date.now()
        } as unknown as T;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('API error details:', errorData);
          throw new Error(errorData.message || `API error: ${response.status}`);
        } catch (e) {
          console.error('Failed to parse error response:', e);
          throw new Error(`API error: ${response.status}`);
        }
      }
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      return responseData;
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
  async put<T>(endpoint: string, data: any): Promise<T> {
    const url = `${window.location.origin}${endpoint}`;
    console.log('Making PUT request to:', url);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
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
   * Make a DELETE request
   * @param endpoint - API endpoint
   * @returns Promise with response data
   */
  async delete<T>(endpoint: string): Promise<T> {
    const url = `${window.location.origin}${endpoint}`;
    console.log('Making DELETE request to:', url);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
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
}

export default new ApiService();

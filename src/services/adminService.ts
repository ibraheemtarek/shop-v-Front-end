import api from './api';
import API_CONFIG from '../config/api';

export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuthResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin';
  token: string;
}

export interface AdminLoginData {
  email: string;
  password: string;
}

/**
 * Admin API service for admin-specific operations
 */
class AdminService {
  /**
   * Admin login
   */
  async login(loginData: AdminLoginData): Promise<AdminAuthResponse> {
    try {
      // Use API service with isAdmin=true flag to ensure proper token handling
      const response = await api.post<AdminAuthResponse>('/api/auth/login', loginData, undefined, true);

      // Verify the user is an admin
      if (response.role !== 'admin') {
        throw new Error('Access denied: Not an administrator account');
      }
      
      // Save token to localStorage with admin-specific key
      if (response.token) {
        localStorage.setItem('adminToken', response.token);
        
        // Store minimal admin data
        const adminData = {
          _id: response._id,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          role: response.role
        };
        localStorage.setItem('adminData', JSON.stringify(adminData));
        
        // Mark authentication as recent to create a grace period before refresh checks
        api.markRecentAuth(true);
        
        // Setup token refresh check with delay to allow refresh token cookie to be set
        setTimeout(() => {
          api.setupTokenRefreshCheck();
          console.log('Admin token refresh check setup after login');
        }, 3000); // 3 second delay before first token check
      }
      
      return response;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  }

  /**
   * Admin logout
   */
  async logout(): Promise<void> {
    try {
      // Use fetch directly to handle empty responses properly
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({}),
        credentials: 'include',
      });
      
      console.log('Admin logout successful with status:', response.status);
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      // Always clear admin storage regardless of server response
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
    }
  }

  /**
   * Get admin profile
   */
  async getAdminProfile(): Promise<AdminUser> {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('Not authenticated as admin');
    }
    
    try {
      // Check token expiration before making the request
      await api.checkTokenExpiration(token, true);
      
      // Use the API service with isAdmin=true
      return api.get<AdminUser>('/api/users/profile', {}, token);
    } catch (error) {
      console.error('Failed to get admin profile:', error);
      
      // If error is due to invalid token, try refresh
      if (error instanceof Error && error.message.includes('401')) {
        try {
          // Attempt to refresh admin token
          const newToken = await this.refreshAdminToken();
          
          // Retry with new token
          return api.get<AdminUser>('/api/users/profile', {}, newToken);
        } catch (refreshError) {
          console.error('Admin token refresh failed when getting profile:', refreshError);
          throw refreshError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Check if user is authenticated as admin
   */
  isAdminAuthenticated(): boolean {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (!token || !adminData) return false;
    
    try {
      const parsedData = JSON.parse(adminData);
      return parsedData.role === 'admin';
    } catch (e) {
      return false;
    }
  }

  /**
   * Refresh admin token
   */
  async refreshAdminToken(): Promise<string> {
    try {
      // Use the refreshAccessToken method with isAdmin=true
      const newToken = await api.refreshAccessToken(true);
      
      // Update stored admin profile after token refresh
      try {
        // Get fresh admin profile with the new token
        const adminProfile = await this.getAdminProfile();
        
        // Store minimal admin data
        const adminData = {
          _id: adminProfile._id,
          firstName: adminProfile.firstName,
          lastName: adminProfile.lastName,
          email: adminProfile.email,
          role: adminProfile.role
        };
        localStorage.setItem('adminData', JSON.stringify(adminData));
      } catch (profileError) {
        console.error('Failed to update admin profile after token refresh:', profileError);
        // Continue with the token refresh even if profile update fails
      }
      
      return newToken;
    } catch (error) {
      console.error('Admin token refresh failed:', error);
      // Clear auth data since refresh failed
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      // Don't redirect here - let the context handle navigation
      // This prevents navigation conflicts with token refresh
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('Not authenticated as admin');
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string) {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('Not authenticated as admin');
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update user (admin only)
   */
  async updateUser(userId: string, userData: Partial<AdminUser>) {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('Not authenticated as admin');
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string) {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('Not authenticated as admin');
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response.json();
  }
}

export default new AdminService();

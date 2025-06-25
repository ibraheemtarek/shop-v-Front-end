import api from './api';
import API_CONFIG from '../config/api';
import { Product } from './productService';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  wishlist: string[] | Product[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword?: string;
}

export interface ResetPasswordResponse {
  message: string;
  token?: string;
}

/**
 * User API service
 */
class UserService {
  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    return api.post<AuthResponse>('/api/users/register', userData);
  }

  /**
   * Login user - only for regular users, not admins
   */
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      // Normal API login - specify isAdmin=false to ensure proper token handling
      const response = await api.post<AuthResponse>('/api/auth/login', loginData, undefined, false);
      
      // Check if the user is an admin - if so, reject the login
      // This ensures complete separation between user and admin authentication
      if (response.role === 'admin') {
        console.log('Admin login attempted through user login flow - rejecting');
        throw new Error('Admin users must use the admin login page');
      }
      
      // Only save token to localStorage for regular users
      if (response.token) {
        localStorage.setItem('token', response.token);
        
        // Mark authentication as recent to create a grace period before refresh checks
        api.markRecentAuth(false);
        
        // Setup token refresh check with a delay to allow refresh token cookie to be set
        setTimeout(() => {
          api.setupTokenRefreshCheck();
          console.log('Token refresh check setup after login');
        }, 3000); // 3 second delay before first token check
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token for regular user
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      // Use the refreshAccessToken method with isAdmin=false
      const newToken = await api.refreshAccessToken(false);
      
      // If successful, get updated user profile with new token
      const userProfile = await this.getUserProfile();
      
      // Create response object with new token
      const authResponse: AuthResponse = {
        _id: userProfile._id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        role: userProfile.role,
        token: newToken
      };
      
      return authResponse;
    } catch (error) {
      console.error('User token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Use fetch directly to handle empty responses properly
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({}),
        credentials: 'include',
      });
      
      // No need to parse the response as JSON
      console.log('Logout successful with status:', response.status);
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout process even if API call fails
    } finally {
      // Always clear local storage regardless of server response
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User is not authenticated');
    }
    
    try {
      // Check token expiration before making the request
      await api.checkTokenExpiration(token, false);
      
      // Use the token to get user profile
      return api.get<User>('/api/users/profile', {}, token);
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userData: Partial<User>): Promise<AuthResponse> {
    const token = localStorage.getItem('token');
    return api.put<AuthResponse>('/api/users/profile', userData, token);
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    return api.post<{ message: string }>('/api/users/wishlist', { productId }, token);
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(productId: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    return api.delete<{ message: string }>(`/api/users/wishlist/${productId}`, token);
  }

  /**
   * Get user wishlist
   */
  async getWishlist(): Promise<Product[]> {
    const token = localStorage.getItem('token');
    const response = await api.get<{ items: Product[] }>('/api/users/wishlist', {}, token);
    return response.items || [];
  }
  
  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    // Use admin token for admin-only operations
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
      console.error('Admin token not found when trying to get all users');
      throw new Error('Admin authentication required');
    }
    
    // The correct endpoint for getting all users
    return api.get<User[]>('/api/users/all', {}, adminToken);
  }

  /**
   * Request password reset
   * @param data Email address to send reset link
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    return api.post<{ message: string }>('/api/users/forgot-password', data);
  }

  /**
   * Reset password using token
   * @param token Reset token from email
   * @param data Password data
   */
  async resetPassword(token: string, data: ResetPasswordData): Promise<ResetPasswordResponse> {
    return api.post<ResetPasswordResponse>(`/api/users/reset-password?token=${token}`, data);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export default new UserService();

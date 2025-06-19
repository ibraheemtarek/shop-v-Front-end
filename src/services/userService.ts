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
  token: string;
  password: string;
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
   * Login user
   */
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      // Normal API login
      const response = await api.post<AuthResponse>('/api/auth/login', loginData);
      
      // Save token to localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    return api.post<AuthResponse>('/api/auth/refresh', {});
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
    return api.get<User>('/api/users/profile');
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userData: Partial<User>): Promise<AuthResponse> {
    return api.put<AuthResponse>('/api/users/profile', userData);
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/api/users/wishlist', { productId });
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(productId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/api/users/wishlist/${productId}`);
  }

  /**
   * Get user wishlist
   */
  async getWishlist(): Promise<Product[]> {
    const response = await api.get<{ items: Product[] }>('/api/users/wishlist');
    return response.items || [];
  }
  
  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    return api.get<User[]>('/api/users');
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
   * @param data Token and new password
   */
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return api.post<{ message: string }>('/api/users/reset-password', data);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export default new UserService();

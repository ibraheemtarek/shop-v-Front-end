import api from './api';
import mockData from './mockData';
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
      // For development/testing - simulate successful admin login
      if (import.meta.env.DEV && 
          loginData.email === 'admin@admin.com' && 
          loginData.password === 'admin123') {
        
        // Check if we already have a mock admin token
        const existingToken = localStorage.getItem('token');
        const existingRole = localStorage.getItem('userRole');
        
        if (existingToken && existingToken.startsWith('mock-admin-token') && existingRole === 'admin') {
          console.log('Using existing mock admin token');
          return {
            _id: 'admin-mock-id',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@admin.com',
            role: 'admin',
            token: existingToken
          };
        }
        
        console.log('DEV MODE: Simulating successful admin login');
        const mockToken = 'mock-admin-token-' + Date.now();
        localStorage.setItem('token', mockToken);
        localStorage.setItem('userRole', 'admin');
        
        return {
          _id: 'admin-mock-id',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@admin.com',
          role: 'admin',
          token: mockToken
        };
      }
      
      // Normal API login
      const response = await api.post<AuthResponse>('/api/users/login', loginData);
      
      // Save token to localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      
      // Special case for admin login in development
      if (import.meta.env.DEV && 
          loginData.email === 'admin@admin.com' && 
          loginData.password === 'admin123') {
        
        console.log('API login failed, using mock admin login');
        const mockToken = 'mock-admin-token-' + Date.now();
        localStorage.setItem('token', mockToken);
        localStorage.setItem('userRole', 'admin');
        
        return {
          _id: 'admin-mock-id',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@admin.com',
          role: 'admin',
          token: mockToken
        };
      }
      
      throw error;
    }
  }

  /**
   * Logout user (client-side only)
   */
  logout(): void {
    localStorage.removeItem('token');
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<User> {
    try {
      return await api.get<User>('/api/users/profile');
    } catch (error) {
      console.error('Failed to fetch user profile from API, using mock data:', error);
      
      // Check for token to determine user type
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      // If we have a mock admin token, return mock admin profile
      if (token && token.startsWith('mock-admin-token') || userRole === 'admin') {
        console.log('Using mock admin profile');
        return {
          _id: 'admin-mock-id',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@admin.com',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          wishlist: []
        };
      }
      
      // For regular users or if no token exists, return a generic mock user
      console.log('Using mock regular user profile');
      return {
        _id: 'user-mock-id',
        firstName: 'Test',
        lastName: 'User',
        email: 'user@example.com',
        role: 'user',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        phone: '555-1234',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wishlist: []
      };
    }
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
    return api.get<Product[]>('/api/users/wishlist');
  }
  
  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      return await api.get<User[]>('/api/users');
    } catch (error) {
      console.error('Failed to fetch users from API, using mock data:', error);
      return mockData.getUsers();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export default new UserService();

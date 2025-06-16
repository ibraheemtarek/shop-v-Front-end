import React, { createContext, useState, useContext, useEffect } from 'react';
import userService from '../services/userService';
import type { AuthResponse } from '../services/userService';

interface AuthContextType {
  user: AuthResponse | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // No user persistence function here

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    // No need to get stored user data
    
    if (token) {
      // No cached user data handling
      
      // Get fresh user data if token exists
      userService.getUserProfile()
        .then((userData) => {
          const authResponse: AuthResponse = {
            _id: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
            token,
          };
          setUser(authResponse);
        })
        .catch((err) => {
          // If token is invalid, remove it and user data
          console.error('Failed to fetch user profile:', err);
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // No token, make sure user state is null
      setUser(null);
      setLoading(false);
    }
  }, []);

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await userService.login({ email, password });
      
      // Store user role in localStorage
      if (userData && userData.role) {
        localStorage.setItem('userRole', userData.role);
      }
      
      setUser(userData);
      console.log('Login successful, user data:', userData);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await userService.register({ firstName, lastName, email, password });
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    userService.logout();
    setUser(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

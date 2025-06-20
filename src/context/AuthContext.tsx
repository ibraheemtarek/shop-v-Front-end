import React, { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import type { AuthResponse } from '../services/userService';
import api from '../services/api';
import { AuthContext, AuthContextType } from './authUtils';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to persist minimal user data in localStorage
  const persistUserData = (userData: AuthResponse | null) => {
    if (userData) {
      // Store minimal user data for quick access on page reload
      // Don't store sensitive data
      const persistedData = {
        _id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
      };
      localStorage.setItem('userData', JSON.stringify(persistedData));
    } else {
      localStorage.removeItem('userData');
    }
  };

  // Function to refresh user data from API
  const refreshUserData = useCallback(async (): Promise<AuthResponse | void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage, user is not authenticated');
        setUser(null);
        return;
      }
      
      console.log('Attempting to refresh user data with existing token');
      try {
        const userData = await userService.getUserProfile();
        console.log('User profile retrieved successfully');
        
        const authResponse: AuthResponse = {
          _id: userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          token,
        };
        setUser(authResponse);
        persistUserData(authResponse);
        return authResponse;
      } catch (profileErr: unknown) {
        console.error('Failed to get user profile with current token:', profileErr);
        throw profileErr; // Throw to trigger token refresh attempt
      }
    } catch (err: unknown) {
      console.error('Failed to refresh user data:', err);
      // If refresh fails, try to refresh the token first before giving up
      try {
        console.log('Attempting to refresh the access token...');
        const newToken = await api.refreshAccessToken();
        console.log('Token refresh successful, attempting to get user profile again');
        
        // If token refresh succeeds, try getting user data again
        try {
          const userData = await userService.getUserProfile();
          console.log('User profile retrieved successfully after token refresh');
          
          const authResponse: AuthResponse = {
            _id: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
            token: newToken,
          };
          setUser(authResponse);
          persistUserData(authResponse);
          return authResponse;
        } catch (profileErr: unknown) {
          console.error('Failed to get user profile even after token refresh:', profileErr);
          throw profileErr; // Re-throw to trigger logout
        }
      } catch (refreshErr: unknown) {
        console.error('Token refresh failed during user data refresh:', refreshErr);
        // If token refresh also fails, clear everything
        localStorage.removeItem('token');
        persistUserData(null);
        setUser(null);
        setError('Your session has expired. Please log in again.');
      }
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');
    
    if (token) {
      // First set user from cached data for quick UI rendering
      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          setUser({
            ...parsedUserData,
            token,
          });
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
        }
      }
      
      // Then get fresh user data from API
      refreshUserData()
        .catch((err) => {
          console.error('Failed to fetch user profile:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // No token, make sure user state is null
      persistUserData(null);
      setUser(null);
      setLoading(false);
    }
    
    // Setup listener for storage events (for multi-tab support)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token' && !event.newValue) {
        // Token was removed in another tab
        setUser(null);
      } else if (event.key === 'token' && event.newValue) {
        // Token was added in another tab
        refreshUserData().catch(console.error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshUserData]);

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
      persistUserData(userData);
      console.log('Login successful, user data:', userData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to login');
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
      persistUserData(userData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    userService.logout();
    persistUserData(null);
    setUser(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Explicitly create the context value with the AuthContextType
  const contextValue: AuthContextType = { 
    user, 
    loading, 
    error, 
    login, 
    register, 
    logout, 
    clearError, 
    refreshUserData 
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};


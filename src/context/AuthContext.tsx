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
        // Check if token is about to expire and refresh it proactively
        await api.checkTokenExpiration(token, false);
        
        // Get user profile data with the current token
        const userData = await userService.getUserProfile();
        console.log('User profile retrieved successfully');
        
        // Only process regular user data, not admin data
        // This ensures complete separation between user and admin authentication
        if (userData.role !== 'admin') {
          const authResponse: AuthResponse = {
            _id: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
            token: localStorage.getItem('token') || token, // Get latest token in case it was refreshed
          };
          setUser(authResponse);
          persistUserData(authResponse);
          return authResponse;
        } else {
          console.log('Admin user detected in user context, ignoring for complete separation');
          // Don't set user state for admin users in the regular user context
          setUser(null);
          persistUserData(null);
          return undefined;
        }
      } catch (profileErr: unknown) {
        console.error('Failed to get user profile with current token:', profileErr);
        // If it's an authentication error, try to explicitly refresh the token
        try {
          console.log('Attempting to explicitly refresh the access token...');
          const newToken = await api.refreshAccessToken(false); // Specifically refresh user token
          console.log('Token refresh successful, attempting to get user profile again');
          
          // If token refresh succeeds, try getting user data again
          try {
            const userData = await userService.getUserProfile();
            console.log('User profile retrieved successfully after token refresh');
            
            // Only process regular user data, not admin data
            // This ensures complete separation between user and admin authentication
            if (userData.role !== 'admin') {
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
            } else {
              console.log('Admin user detected in user context after token refresh, ignoring for complete separation');
              // Don't set user state for admin users in the regular user context
              setUser(null);
              persistUserData(null);
              return undefined;
            }
          } catch (profileErr: unknown) {
            console.error('Failed to get user profile even after token refresh:', profileErr);
            throw profileErr; // Re-throw to trigger logout
          }
        } catch (refreshErr: unknown) {
          console.error('Token refresh failed during user data refresh:', refreshErr);
          
          // Only clear tokens on authentication errors
          if (refreshErr instanceof Error && 
              (refreshErr.message.includes('Auth error') || 
               refreshErr.message.includes('401') || 
               refreshErr.message.includes('403'))) {
            console.warn('Authentication error during user token refresh, logging out');
            localStorage.removeItem('token');
            persistUserData(null);
            setUser(null);
            setError('Your session has expired. Please log in again.');
          } else {
            // For network errors etc., keep the session if possible
            console.warn('Non-auth error during user token refresh, attempting to maintain session');
            // Try to use existing user data if available
            const cachedUserData = localStorage.getItem('userData');
            if (cachedUserData) {
              try {
                const parsedUserData = JSON.parse(cachedUserData);
                // Only set for non-admin users
                if (parsedUserData.role !== 'admin') {
                  setUser({
                    ...parsedUserData,
                    token: localStorage.getItem('token') || '',
                  });
                  return; // Maintain the session with cached data
                }
              } catch (parseErr) {
                console.error('Error parsing cached user data:', parseErr);
              }
            }
            
            // If we couldn't maintain session with cached data
            setUser(null);
            setError('Connection error. Please try again.');
          }
        }
      }
    } catch (err: unknown) {
      console.error('Failed to refresh user data:', err);
      
      // Only clear tokens on authentication errors
      if (err instanceof Error && 
          (err.message.includes('Auth error') || 
           err.message.includes('401') || 
           err.message.includes('403'))) {
        console.warn('Authentication error during user data refresh, logging out');
        localStorage.removeItem('token');
        persistUserData(null);
        setUser(null);
        setError('Your session has expired. Please log in again.');
      } else {
        // For network errors etc., keep the session if possible
        console.warn('Non-auth error during user data refresh, attempting to maintain session');
        // Try to use existing user data if available
        const cachedUserData = localStorage.getItem('userData');
        if (cachedUserData) {
          try {
            const parsedUserData = JSON.parse(cachedUserData);
            // Only set for non-admin users
            if (parsedUserData.role !== 'admin') {
              setUser({
                ...parsedUserData,
                token: localStorage.getItem('token') || '',
              });
              return; // Maintain the session with cached data
            }
          } catch (parseErr) {
            console.error('Error parsing cached user data:', parseErr);
          }
        }
        
        // If we couldn't maintain session with cached data
        setUser(null);
        setError('Connection error. Please try again.');
      }
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');
    
    // Only set up token refresh check if we have an existing token
    // This prevents premature refresh attempts when no refresh token cookie exists yet
    if (token) {
      console.log('Setting up token refresh for existing user token');
      api.setupTokenRefreshCheck();
    }
    
    if (token) {
      // First set user from cached data for quick UI rendering
      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          
          // Only set user data if this is a regular user, not an admin
          // This ensures complete separation between user and admin authentication
          if (parsedUserData.role !== 'admin') {
            setUser({
              ...parsedUserData,
              token,
            });
          } else {
            console.log('Admin user detected in user context, ignoring for complete separation');
            // Don't set user state for admin users in the regular user context
            // This ensures admins aren't treated as logged-in regular users
          }
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
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await userService.login({ email, password });
      
      // Only process regular user data, not admin data
      // This ensures complete separation between user and admin authentication
      if (userData.role !== 'admin') {
        // Store token in localStorage
        if (userData.token) {
          localStorage.setItem('token', userData.token);
        }
        
        // Update user state
        setUser(userData);
        
        // Persist user data
        persistUserData(userData);
        
        return userData;
      } else {
        console.log('Admin user detected during login, ignoring for complete separation');
        // Don't set user state for admin users in the regular user context
        // This ensures admins aren't treated as logged-in regular users
        setUser(null);
        persistUserData(null);
        
        // Still return the data so the component can handle admin login appropriately
        return userData;
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
      throw err; // Re-throw to allow components to handle errors
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (firstName: string, lastName: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      const userData = await userService.register({ firstName, lastName, email, password });
      setUser(userData);
      persistUserData(userData);
      return userData;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register');
      throw err; // Re-throw the error so it can be caught by the component
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


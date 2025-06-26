import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import adminService, { AdminAuthResponse } from '@/services/adminService';
import api from '@/services/api';

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  checkAdminStatus: () => Promise<boolean>;
  logout: () => void;
  login: (email: string, password: string) => Promise<AdminAuthResponse>;
  refreshAdminToken: () => Promise<void>; // Added refresh token function
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize the function to avoid dependency issues with useEffect
  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if admin is authenticated using adminService
      if (!adminService.isAdminAuthenticated()) {
        setIsAdmin(false);
        return false;
      }

      // Get admin token and check if it's valid/expired
      const adminToken = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      
      if (adminToken && adminData) {
        try {
          // First, check if token is still valid before making any API calls
          const tokenExp = api.parseTokenExpiration(adminToken);
          const now = Date.now();
          
          // If token is still valid (not expired or about to expire), use it without API validation
          if (tokenExp && tokenExp > now + 60000) { // Still valid for at least 1 minute
            console.log('Current admin token is still valid, continuing session without API validation');
            try {
              const parsedData = JSON.parse(adminData);
              const isAdminUser = parsedData.role === 'admin';
              
              // Mark as recent auth to prevent immediate refresh attempts
              api.markRecentAuth(true);
              
              // Skip API verification to avoid 401 errors if refresh token cookie is missing
              setIsAdmin(isAdminUser);
              return isAdminUser;
            } catch (parseError) {
              console.error('Error parsing admin data:', parseError);
            }
          }
          
          // Only try API verification if we're sure the token is valid
          console.log('Token needs verification or refresh, proceeding with caution');
          
          try {
            // Try to verify first
            const adminProfile = await adminService.getAdminProfile();
            const isAdminUser = adminProfile.role === 'admin';
            
            console.log('Admin profile verification successful');
            setIsAdmin(isAdminUser);
            return isAdminUser;
          } catch (verifyError) {
            console.error('Error verifying admin status:', verifyError);
            
            // Check if the token is actually expired
            if (tokenExp && tokenExp <= now) {
              console.warn('Admin token is expired, attempting refresh');
              // Try to refresh token if verification fails
              try {
                console.log('Attempting admin token refresh during status check...');
                const newToken = await api.refreshAccessToken(true);
                
                // If refresh successful, verify again with fresh token
                const adminProfile = await adminService.getAdminProfile();
                const isAdminUser = adminProfile.role === 'admin';
                
                console.log('Admin token refresh successful, admin status verified');
                setIsAdmin(isAdminUser);
                return isAdminUser;
              } catch (refreshError) {
                console.error('Admin token refresh failed during status check:', refreshError);
                
                // For refresh token cookie issues (likely missing after reload)
                const errorMsg = refreshError instanceof Error ? refreshError.message : 'unknown';
                if (errorMsg.includes('no_token') || errorMsg.includes('401')) {
                  console.warn('Refresh token cookie issue detected (likely missing after page reload)');
                  
                  // If the token isn't completely expired yet, continue session
                  if (tokenExp && tokenExp > now) {
                    console.log('Using existing admin token since it still has some validity');
                    try {
                      const parsedData = JSON.parse(adminData);
                      const isAdminUser = parsedData.role === 'admin';
                      setIsAdmin(isAdminUser);
                      return isAdminUser;
                    } catch (parseError) {
                      console.error('Error parsing admin data:', parseError);
                    }
                  } else {
                    // Token is truly expired AND refresh failed, need to logout
                    console.warn('Admin token is expired and refresh failed, logging out');
                    setIsAdmin(false);
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminData');
                    return false;
                  }
                } else {
                  // Only clear tokens on specific authentication errors
                  if (refreshError instanceof Error && 
                      (refreshError.message.includes('invalid_token') || 
                       refreshError.message.includes('403'))) {
                    console.warn('Authentication error during admin token refresh, logging out');
                    setIsAdmin(false);
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminData');
                    return false;
                  } else {
                    // For network errors, etc. keep the session active if token still valid
                    console.warn('Non-auth error during admin token refresh, maintaining session if possible');
                    if (tokenExp && tokenExp > now) {
                      console.log('Using existing admin token since it still has some validity');
                      try {
                        const parsedData = JSON.parse(adminData);
                        const isAdminUser = parsedData.role === 'admin';
                        setIsAdmin(isAdminUser);
                        return isAdminUser;
                      } catch (parseError) {
                        console.error('Error parsing admin data:', parseError);
                      }
                    } else {
                      setIsAdmin(false);
                      return false;
                    }
                  }
                }
              }
            } else {
              // Token not expired but verification failed - network error or other non-auth issue
              // Keep the user logged in using the stored data
              console.warn('Token verification failed but token not expired, maintaining session');
              try {
                const parsedData = JSON.parse(adminData);
                const isAdminUser = parsedData.role === 'admin';
                setIsAdmin(isAdminUser);
                return isAdminUser;
              } catch (parseError) {
                console.error('Error parsing admin data:', parseError);
              }
            }
          }
        } catch (error) {
          console.error('Error in admin authentication flow:', error);
          // Don't immediately logout on errors - try to maintain session if possible
          try {
            const parsedData = JSON.parse(adminData);
            const isAdminUser = parsedData.role === 'admin';
            setIsAdmin(isAdminUser);
            return isAdminUser;
          } catch (parseError) {
            console.error('Error parsing admin data:', parseError);
          }
        }
      }
      
      // Default fallback if all else fails
      setIsAdmin(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed since it only uses setState functions which are stable

  const logout = async () => {
    try {
      await adminService.logout();
      setIsAdmin(false);
    } catch (error) {
      console.error('Admin logout error:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminService.login({ email, password });
      
      if (response.role !== 'admin') {
        throw new Error('Access denied: Not an administrator account');
      }
      
      setIsAdmin(true);
      return response;
    } catch (error) {
      console.error('Admin login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to login as admin');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    // Only set up token refresh check if we have an existing token
    // This prevents premature refresh attempts when no refresh token cookie exists yet
    if (token) {
      console.log('Setting up token refresh for existing admin token');
      api.setupTokenRefreshCheck();
    }
    
    if (token) {
      // Check admin status on initial load
      checkAdminStatus();
    }
    
    // Add debug logging to help diagnose authentication issues
    console.log('AdminAuthContext initialized with state:', {
      adminToken: localStorage.getItem('adminToken'),
      adminData: localStorage.getItem('adminData'),
      userToken: localStorage.getItem('token'),
      userData: localStorage.getItem('userData')
    });
    
    // Setup listener for storage events (for multi-tab support)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'adminToken' && !event.newValue) {
        // Admin token was removed in another tab
        setIsAdmin(false);
      } else if (event.key === 'adminToken' && event.newValue) {
        // Admin token was added in another tab
        checkAdminStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAdminStatus]); // Add checkAdminStatus as a dependency

  // Refresh admin token function
  const refreshAdminToken = async (): Promise<void> => {
    try {
      await adminService.refreshAdminToken();
      // Update admin status after successful token refresh
      setIsAdmin(true);
    } catch (error) {
      console.error('Failed to refresh admin token in context:', error);
      setIsAdmin(false);
      throw error;
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, checkAdminStatus, logout, login, refreshAdminToken }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;

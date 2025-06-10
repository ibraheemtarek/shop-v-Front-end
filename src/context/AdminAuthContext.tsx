import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import userService from '@/services/userService';

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  checkAdminStatus: () => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAdminStatus = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAdmin(false);
        return false;
      }

      // Check if user role is stored in localStorage
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'admin') {
        setIsAdmin(true);
        return true;
      }

      // If role not in localStorage, verify with API
      try {
        const userProfile = await userService.getUserProfile();
        const isAdminUser = userProfile.role === 'admin';
        
        if (isAdminUser) {
          localStorage.setItem('userRole', 'admin');
        }
        
        setIsAdmin(isAdminUser);
        return isAdminUser;
      } catch (error) {
        console.error('Error verifying admin status:', error);
        setIsAdmin(false);
        // Clear token if verification fails
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAdmin(false);
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, checkAdminStatus, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;

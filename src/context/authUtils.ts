import { createContext, useContext } from 'react';
import type { AuthResponse } from '../services/userService';

// Define the AuthContext type
export interface AuthContextType {
  user: AuthResponse | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUserData: () => Promise<AuthResponse | void>;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the useAuth hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

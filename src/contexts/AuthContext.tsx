import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  register as registerUser,
  login as loginUser,
  logout as logoutUser,
  getCurrentUser,
  getStoredUser,
  clearAuth,
  RegisterData,
  LoginData,
} from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = getStoredUser();
        if (storedUser) {
          // Verify token is still valid by fetching current user
          try {
            const { user: currentUser } = await getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // Token invalid, clear auth
            clearAuth();
            setUser(null);
          }
        }
      } catch (error) {
        // Silently fail - user will remain unauthenticated
        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const register = async (data: RegisterData) => {
    try {
      const response = await registerUser(data);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const login = async (data: LoginData) => {
    try {
      const response = await loginUser(data);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // Silently fail - still clear local state
    } finally {
      setUser(null);
      clearAuth();
    }
  };

  const refreshUser = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // Silently fail - user will remain unauthenticated
      setUser(null);
      clearAuth();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


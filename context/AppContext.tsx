'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Define types for our context
type User = {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
};

type AppContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: { name: string; email: string; password: string; role?: string }) => Promise<boolean>;
  hasRole: (roles: string | string[]) => boolean;
  isAuthenticated: boolean;
  getToken: () => string | null;
};

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('user');
          const storedToken = localStorage.getItem('token');
          
          // Only consider user as authenticated if both user and token exist
          if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } else if (storedUser && !storedToken) {
            // If user exists but token doesn't, clear user as well
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Handle storage events (for multi-tab logout)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user') {
        if (!event.newValue) {
          setUser(null);
        } else {
          setUser(JSON.parse(event.newValue));
        }
      }
      
      // If token is removed, also logout
      if (event.key === 'token' && !event.newValue) {
        setUser(null);
        localStorage.removeItem('user');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || 'Login failed');
        return false;
      }
      
      if (data.success && data.user && data.token) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);
        toast.success('Login successful');
        return true;
      }
      
      toast.error('Invalid response from server');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (userData: { name: string; email: string; password: string; role?: string }): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || 'Signup failed');
        return false;
      }
      
      if (data.success && data.user && data.token) {
        // If auto-login after signup is desired, store user and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);
        toast.success('Account created successfully');
        return true;
      }
      
      toast.error('Invalid response from server');
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };
  
  // Get token function
  const getToken = (): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('token');
  };

  // Check if user has a specific role
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    
    if (typeof roles === 'string') {
      return user.role === roles;
    }
    
    return roles.includes(user.role);
  };

  // Context value
  const contextValue: AppContextType = {
    user,
    loading,
    login,
    logout,
    signup,
    hasRole,
    isAuthenticated: !!user,
    getToken,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
}

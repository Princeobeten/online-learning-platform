'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type SignupData = {
  name: string;
  email: string;
  password: string;
  role?: string;
};

type LoginData = {
  email: string;
  password: string;
};

type AuthResponse = {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
};

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Signup function
  const signup = async (userData: SignupData): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      
      if (data.success && data.user && data.token) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        toast.success('Account created successfully');
        return { success: true, user: data.user, token: data.token };
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during signup');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials: LoginData): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        
        throw new Error(data.error || 'Invalid credentials');
      }

      
      if (data.success && data.user && data.token) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        toast.success('Login successful');
        return { success: true, user: data.user, token: data.token };
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  // Get current user from local storage
  const getCurrentUser = (): User | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return null;
    }
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  };

  // Get token from local storage
  const getToken = (): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    
    return localStorage.getItem('token');
  };

  return {
    signup,
    login,
    logout,
    getCurrentUser,
    getToken,
    loading,
    error,
  };
}

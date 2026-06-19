'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '@/services/authService';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);

          // Optional: Verify token with backend
          try {
            const response = await authService.getCurrentUser();
            if (response.success) {
              setUser(response.user);
            }
          } catch (error) {
            // Token might be expired, clear auth state
            authService.logout();
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register function
  const register = async (name, email, password, phone, location = null) => {
    try {
      setLoading(true);
      const response = await authService.register({
        name,
        email,
        password,
        phone,
        location,
      });

      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
      toast.success(response.message || 'Registration successful!');
      return response;
    } catch (error) {
      const message = error.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);

      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
      toast.success(response.message || 'Login successful!');
      return response;
    } catch (error) {
      const message = error.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  // Update user function
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

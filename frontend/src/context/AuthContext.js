'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/login', '/register'];

  const checkUserSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      if (!publicRoutes.includes(pathname)) {
        router.push('/login');
      }
      return;
    }

    try {
      const data = await api.getProfile();
      setUser(data.user);
    } catch (error) {
      console.error('Session verification failed:', error.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await api.login(username, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      router.push('/dashboard');
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (username, password, role) => {
    setLoading(true);
    try {
      const data = await api.register(username, password, role);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const refreshPremiumStatus = async () => {
    try {
      const data = await api.getSubscriptionStatus();
      if (user) {
        setUser(prev => ({
          ...prev,
          is_premium: data.isPremium,
          premium_until: data.premiumUntil
        }));
      }
    } catch (err) {
      console.error('Failed to sync premium state:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshPremiumStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};

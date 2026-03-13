import React, { createContext, useContext, useMemo, useState } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('banking_token') || '');
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('banking_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isInitializing] = useState(false);

  const setAuthData = (nextToken, nextUser) => {
    if (nextToken) {
      sessionStorage.setItem('banking_token', nextToken);
      setToken(nextToken);
    } else {
      sessionStorage.removeItem('banking_token');
      setToken('');
    }

    if (nextUser) {
      sessionStorage.setItem('banking_user', JSON.stringify(nextUser));
      setUser(nextUser);
    } else {
      sessionStorage.removeItem('banking_user');
      setUser(null);
    }
  };

  const register = async (payload) => {
    const response = await apiClient.post('/auth/register', payload);
    const nextToken = response.data?.token;
    const nextUser = response.data?.user;

    if (!nextToken || !nextUser) {
      throw new Error('Invalid registration response from server');
    }

    setAuthData(nextToken, nextUser);
    return response.data;
  };

  const login = async (payload) => {
    const response = await apiClient.post('/auth/login', payload);
    const nextToken = response.data?.token;
    const nextUser = response.data?.user;

    if (!nextToken || !nextUser) {
      throw new Error('Invalid login response from server');
    }

    setAuthData(nextToken, nextUser);
    return response.data;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAuthData('', null);
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isInitializing,
      register,
      login,
      logout,
    }),
    [token, user, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
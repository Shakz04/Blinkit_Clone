/* eslint-disable react-refresh/only-export-components -- This module exports its provider and shared context hook. */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api';

const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('blinkit_token')));
  useEffect(() => {
    const token = localStorage.getItem('blinkit_token');
    if (!token) return;
    let cancelled = false;
    api.getMe(token).then(data => { if (!cancelled) setUser(data); }).catch(() => {
      if (!cancelled) localStorage.removeItem('blinkit_token');
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const accept = useCallback(data => {
    const { token, ...profile } = data;
    localStorage.setItem('blinkit_token', token);
    setUser(profile);
    return data;
  }, []);
  const login = useCallback(async (email, password) => accept(await api.login(email, password)), [accept]);
  const register = useCallback(async (name, email, password, role) => accept(await api.register(name, email, password, role)), [accept]);
  const logout = useCallback(() => {
    localStorage.removeItem('blinkit_token');
    setUser(null);
  }, []);
  const getToken = useCallback(() => localStorage.getItem('blinkit_token'), []);
  return <AuthContext.Provider value={{ user, loading, login, register, logout, getToken, setUser }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

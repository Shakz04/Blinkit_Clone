import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('blinkit_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.getMe(token)
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('blinkit_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('blinkit_token', data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
    return data;
  };

  const register = async (name, email, password, role) => {
    const data = await api.register(name, email, password, role);
    localStorage.setItem('blinkit_token', data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('blinkit_token');
    setUser(null);
  };

  const getToken = () => localStorage.getItem('blinkit_token');

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

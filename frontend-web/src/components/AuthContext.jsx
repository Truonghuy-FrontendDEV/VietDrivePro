// src/components/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const u = localStorage.getItem('user');
    const t = localStorage.getItem('token');
    if (u && t) setUser(JSON.parse(u));
    setLoading(false);
  }, []);
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };
  const updateUser = (patch) => {
    const merged = { ...user, ...patch };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
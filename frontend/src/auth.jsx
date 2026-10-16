import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from './api';
import Spinner from './components/Spinner';
 
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);
 
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('lgu_token'));
 
  useEffect(() => {
    if (!localStorage.getItem('lgu_token')) return;
    api.get('/admin/me').then((r) => setUser(r.data)).catch(() => localStorage.removeItem('lgu_token')).finally(() => setLoading(false));
  }, []);
 
  const login = async (email, password) => {
    const { data } = await api.post('/admin/login', { email, password });
    localStorage.setItem('lgu_token', data.token);
    setUser(data.user);
  };
  const logout = async () => {
    try { await api.post('/admin/logout'); } catch { /* token may already be invalid */ }
    localStorage.removeItem('lgu_token');
    setUser(null);
  };
 
  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
}
 
export function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  return user ? children : <Navigate to="/admin/login" replace />;
}

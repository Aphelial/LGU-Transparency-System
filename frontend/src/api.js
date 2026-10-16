import axios from 'axios';
 
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
export const MUNICIPALITY = import.meta.env.VITE_MUNICIPALITY_NAME || '';
 
const api = axios.create({ baseURL: API_URL, headers: { Accept: 'application/json' } });
 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lgu_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
 
api.interceptors.response.use(
  (r) => r,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && url.startsWith('/admin') && !url.includes('login')) {
      localStorage.removeItem('lgu_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
 
/** Turns an axios error into { message, fields } */
export function parseError(e) {
  const d = e.response?.data;
  const fields = {};
  if (d?.errors) Object.entries(d.errors).forEach(([k, v]) => (fields[k] = v[0]));
  return { message: d?.message || 'Something went wrong. Please try again.', fields };
}
 
/** Builds FormData skipping empty values (for file uploads) */
export function toFormData(obj) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') fd.append(k, v);
  });
  return fd;
}
 
export default api;

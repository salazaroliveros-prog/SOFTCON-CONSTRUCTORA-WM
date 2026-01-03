import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  // Don't force Content-Type globally: uploads (FormData) need the browser
  // to set multipart boundaries, and Axios will set JSON headers as needed.
});

// Interceptor para inyectar el Token JWT en cada petición (Web)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globales (ej: token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
    }
    return Promise.reject(error);
  }
);

export default api;
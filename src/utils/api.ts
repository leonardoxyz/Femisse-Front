import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';

/**
 * Cliente axios configurado para usar cookies httpOnly
 * Todas as requisições enviam automaticamente os cookies de autenticação
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true, // ✅ Sempre envia cookies httpOnly
  timeout: 15000, // ✅ Timeout de 15 segundos para evitar requisições travadas
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * ✅ MOBILE FIX: Interceptor para adicionar token do localStorage quando cookies não funcionam
 */
api.interceptors.request.use(
  (config) => {
    // Tenta obter token do localStorage (fallback para mobile)
    const token = localStorage.getItem('accessToken');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor para tratar erros de autenticação
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // ✅ MOBILE FIX: Se token expirou, tenta renovar com refreshToken
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_ENDPOINTS.auth}/refresh-token`,
            {},
            { 
              withCredentials: true,
              headers: { Authorization: `Bearer ${refreshToken}` }
            }
          );
          
          if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Se falhar, limpa tokens e deixa o erro propagar
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    }
    
    // 401 deve ser tratado pelos fluxos de autenticação (ex.: PrivateRoute)
    // para evitar redirecionamentos indevidos em páginas públicas.
    return Promise.reject(error);
  }
);

export default api;

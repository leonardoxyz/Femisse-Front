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
 * Interceptor para tratar erros de autenticação
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 deve ser tratado pelos fluxos de autenticação (ex.: PrivateRoute)
    // para evitar redirecionamentos indevidos em páginas públicas.
    return Promise.reject(error);
  }
);

export default api;

/**
 * 🚀 API Client Unificado e Otimizado
 * 
 * Consolida funcionalidades de:
 * - api.ts (axios com interceptors)
 * - apiInterceptor.ts (renovação de token)
 * - secureApi.ts (logging seguro)
 * 
 * Benefícios:
 * - Single source of truth para requisições
 * - Renovação automática de token
 * - Logging condicional (dev/prod)
 * - Rate limiting client-side
 * - Retry automático
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_ENDPOINTS } from '@/config/api';
import { tokenStorage } from '@/utils/tokenStorage';
import { logger } from '../utils/logger-unified';

// ============================================
// CONFIGURAÇÃO E TIPOS
// ============================================

const IS_PRODUCTION = import.meta.env.PROD;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface RequestQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}

// ============================================
// LOGGING SEGURO
// ============================================

const logger = {
  debug: (message: string, data?: any) => {
    if (!IS_PRODUCTION) {
      logger.log(`🐛 [API] ${message}`, data || '');
    }
  },
  info: (message: string, data?: any) => {
    if (!IS_PRODUCTION) {
      logger.log(`ℹ️ [API] ${message}`, data || '');
    }
  },
  warn: (message: string, data?: any) => {
    logger.warn(`⚠️ [API] ${message}`, data || '');
  },
  error: (message: string, data?: any) => {
    if (IS_PRODUCTION) {
      logger.error(`❌ [API] Erro na requisição`);
    } else {
      logger.error(`❌ [API] ${message}`, data || '');
    }
  }
};

// ============================================
// RATE LIMITING CLIENT-SIDE
// ============================================

class RateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests = 50;
  private windowMs = 60000;

  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];
    const recentRequests = requests.filter(time => now - time < this.windowMs);
    
    if (recentRequests.length >= this.maxRequests) {
      logger.warn(`Rate limit atingido para ${endpoint}`);
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(endpoint, recentRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter();

// ============================================
// CRIAÇÃO DA INSTÂNCIA AXIOS
// ============================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // Envia cookies httpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// GERENCIAMENTO DE RENOVAÇÃO DE TOKEN
// ============================================

let isRefreshing = false;
let failedQueue: RequestQueueItem[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    logger.debug('Renovando access token...');
    
    const refreshToken = tokenStorage.getRefreshToken();
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/refresh-token`,
      {},
      {
        withCredentials: true,
        headers: refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {}
      }
    );
    
    if (response.data.accessToken) {
      tokenStorage.setTokens({ accessToken: response.data.accessToken });
      logger.debug('Token renovado com sucesso');
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Falha ao renovar token', error);
    return false;
  }
};

// ============================================
// INTERCEPTOR DE REQUEST
// ============================================

apiClient.interceptors.request.use(
  (config) => {
    // Rate limiting
    const endpoint = config.url || '';
    if (!rateLimiter.canMakeRequest(endpoint)) {
      return Promise.reject(new Error('Rate limit excedido'));
    }

    // Adiciona token do localStorage (fallback mobile)
    const token = tokenStorage.getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    logger.debug(`${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('Erro no request', error);
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTOR DE RESPONSE (COM RETRY)
// ============================================

apiClient.interceptors.response.use(
  (response) => {
    logger.debug(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Erro 401 - Token expirado
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Se já está renovando, adiciona à fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const renewed = await refreshAccessToken();
        
        if (renewed) {
          processQueue();
          return apiClient(originalRequest);
        } else {
          processQueue(new Error('Falha ao renovar token'));
          
          // Redireciona para login
          if (!window.location.pathname.includes('/auth')) {
            logger.warn('Sessão expirada, redirecionando...');
            tokenStorage.clearTokens();
            window.location.href = '/auth?expired=true';
          }
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        
        if (!window.location.pathname.includes('/auth')) {
          tokenStorage.clearTokens();
          window.location.href = '/auth?expired=true';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Log de erros
    if (error.response) {
      logger.error(
        `${error.response.status} - ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response.data
      );
    } else if (error.request) {
      logger.error('Sem resposta do servidor', error.message);
    } else {
      logger.error('Erro na configuração da requisição', error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================
// MÉTODOS AUXILIARES
// ============================================

export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiClient.get<T>(url, config).then(res => res.data),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.post<T>(url, data, config).then(res => res.data),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.put<T>(url, data, config).then(res => res.data),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.patch<T>(url, data, config).then(res => res.data),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiClient.delete<T>(url, config).then(res => res.data),
};

// ============================================
// EXPORTS
// ============================================

export default apiClient;
export { logger, rateLimiter };

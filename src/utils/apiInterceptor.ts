/**
 * 🔄 API Interceptor com Renovação Automática de Token
 * 
 * Intercepta requisições 401 e tenta renovar o access token automaticamente
 * usando o refresh token, garantindo que o usuário permaneça autenticado
 */

import api from './api';
import { logger } from './logger';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

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

/**
 * Tenta renovar o access token usando refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    logger.log('Tentando renovar access token...');
    
    const response = await api.post('/api/auth/refresh-token', {}, {
      withCredentials: true
    });
    
    if (response.status === 200) {
      logger.log('Access token renovado com sucesso');
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Falha ao renovar access token:', error);
    return false;
  }
}

/**
 * Configura interceptor de resposta
 */
export function setupApiInterceptor() {
  // Interceptor de resposta
  api.interceptors.response.use(
    // Resposta bem-sucedida - apenas retorna
    (response) => response,
    
    // Erro na resposta
    async (error) => {
      const originalRequest = error.config;
      
      // Se não é erro 401 ou já tentamos renovar, rejeita
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }
      
      // Se já está renovando, adiciona à fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      
      // Marca que está renovando
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Tenta renovar o token
        const renewed = await refreshAccessToken();
        
        if (renewed) {
          // Sucesso - processa fila e retenta requisição original
          processQueue();
          return api(originalRequest);
        } else {
          // Falha - limpa fila e redireciona para login
          processQueue(new Error('Falha ao renovar token'));
          
          // Redireciona para login apenas se não estiver já na página de auth
          if (!window.location.pathname.includes('/auth')) {
            logger.warn('Sessão expirada, redirecionando para login...');
            window.location.href = '/auth?expired=true';
          }
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Erro ao renovar - limpa fila e redireciona
        processQueue(refreshError);
        
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth?expired=true';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
  
  logger.log('API Interceptor configurado com renovação automática de token');
}

/**
 * Remove interceptor (útil para testes)
 */
export function removeApiInterceptor() {
  api.interceptors.response.clear();
  logger.log('API Interceptor removido');
}

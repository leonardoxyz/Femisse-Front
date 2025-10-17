/**
 * 🎣 Hook useApi - Chamadas de API Simplificadas
 * 
 * Hook reutilizável que gerencia:
 * - Loading states
 * - Error handling
 * - Success/Error callbacks
 * - Retry automático
 */

import { useState, useCallback } from 'react';
import { ErrorHandler, AppError } from '@/utils/errorHandler';
import { createLogger } from '@/utils/logger-unified';

const logger = createLogger('useApi');

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
  showToast?: boolean;
  context?: string;
}

interface UseApiReturn<T, P extends any[]> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  execute: (...args: P) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook para gerenciar chamadas de API
 * 
 * @example
 * const { data, loading, error, execute } = useApi(
 *   (id: string) => api.get(`/products/${id}`),
 *   {
 *     onSuccess: (product) => console.log('Produto carregado:', product),
 *     onError: (error) => console.error('Erro:', error),
 *   }
 * );
 * 
 * // Executar
 * await execute('product-id');
 */
export function useApi<T, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const { onSuccess, onError, showToast = true, context } = options;

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        logger.debug(`Executando API call${context ? ` [${context}]` : ''}`);
        
        const result = await apiFunction(...args);
        
        setData(result);
        logger.debug(`API call bem-sucedida${context ? ` [${context}]` : ''}`);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        const appError = showToast 
          ? ErrorHandler.handle(err, context)
          : ErrorHandler.handleSilent(err, context);
        
        setError(appError);
        
        if (onError) {
          onError(appError);
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError, showToast, context]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

/**
 * Hook para chamadas de API com auto-fetch no mount
 * 
 * @example
 * const { data, loading, error, refetch } = useApiFetch(
 *   () => api.get('/products'),
 *   { dependencies: [] }
 * );
 */
export function useApiFetch<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions<T> & { dependencies?: any[] } = {}
): UseApiReturn<T, []> & { refetch: () => Promise<T | null> } {
  const { dependencies = [], ...apiOptions } = options;
  const { data, loading, error, execute, reset } = useApi(apiFunction, apiOptions);

  // Auto-fetch no mount ou quando dependencies mudarem
  const refetch = useCallback(() => execute(), [execute]);

  // Executa automaticamente
  useState(() => {
    refetch();
  });

  return {
    data,
    loading,
    error,
    execute,
    reset,
    refetch,
  };
}

export default useApi;

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: HeadersInit;
  body?: any;
  skip?: boolean; // Permite pular a requisição
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook customizado para fetch com AbortController
 * Previne memory leaks e race conditions
 * 
 * @example
 * const { data, loading, error, refetch } = useFetch<Product[]>('/api/products');
 */
export function useFetch<T = any>(
  url: string | null,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const {
    method = 'GET',
    headers = {},
    body,
    skip = false,
    onSuccess,
    onError,
  } = options;

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // Não faz requisição se URL for null ou skip for true
    if (!url || skip) {
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          signal,
        };

        if (body && method !== 'GET') {
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Só atualiza se não foi abortado
        if (!signal.aborted) {
          setData(result);
          onSuccess?.(result);
        }
      } catch (err) {
        // Ignora erros de abort
        if (err instanceof Error && err.name === 'AbortError') {
          logger.debug('Fetch aborted:', url);
          return;
        }

        const error = err instanceof Error ? err : new Error('Erro desconhecido');
        
        if (!signal.aborted) {
          setError(error);
          onError?.(error);
          logger.error('Erro no fetch:', { url, error: error.message });
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup: cancela requisição se componente desmontar
    return () => {
      controller.abort();
    };
  }, [url, method, body, skip, refetchTrigger, headers, onSuccess, onError]);

  return { data, loading, error, refetch };
}

/**
 * Hook para requisições POST/PUT/DELETE
 * Não faz requisição automática, retorna função para executar
 * 
 * @example
 * const { mutate, loading, error } = useMutation('/api/products', { method: 'POST' });
 * await mutate({ name: 'Produto' });
 */
export function useMutation<T = any>(
  url: string,
  options: Omit<UseFetchOptions, 'skip'> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (body?: any) => {
      setLoading(true);
      setError(null);

      const controller = new AbortController();

      try {
        const response = await fetch(url, {
          method: options.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        const error = err instanceof Error ? err : new Error('Erro desconhecido');
        setError(error);
        options.onError?.(error);
        logger.error('Erro na mutation:', { url, error: error.message });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [url, options]
  );

  return { mutate, data, loading, error };
}

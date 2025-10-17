import { logger } from '@/utils/logger';
import { tokenStorage } from '@/utils/tokenStorage';

/**
 * Serviço API centralizado
 * Evita duplicação de código de fetch
 */

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
  timeout?: number;
  params?: Record<string, string | number | boolean | undefined | null>;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Função helper para criar timeout
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), ms)
  );
}

/**
 * Função base para requisições
 */
async function request<T>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    requiresAuth = false,
    timeout = 30000,
    headers = {},
    params,
    ...fetchOptions
  } = options;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };
  // ✅ MOBILE FIX: Adiciona token se necessário (fallback seguro)
  if (requiresAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let requestUrl = url;

  if (params && Object.keys(params).length > 0) {
    const urlObj = new URL(url, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.append(key, String(value));
      }
    });
    requestUrl = urlObj.toString();
  }

  const fetchConfig: RequestInit = {
    ...fetchOptions,
    headers: requestHeaders,
    signal: controller.signal,
  };

  if (!fetchConfig.credentials) {
    fetchConfig.credentials = 'include';
  }

  try {
    const response = await Promise.race([
      fetch(requestUrl, fetchConfig),
      createTimeout(timeout),
    ]);

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(
        `HTTP Error: ${response.statusText}`,
        response.status,
        response.statusText
      );
    }

    // Verifica se há conteúdo antes de parsear
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    return (await response.text()) as any;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * API Service
 */
export const api = {
  /**
   * GET request
   */
  get: <T = any>(url: string, options?: ApiOptions): Promise<T> => {
    logger.debug('API GET:', url);
    return request<T>(url, { ...options, method: 'GET' });
  },

  /**
   * POST request
   */
  post: <T = any>(url: string, data?: any, options?: ApiOptions): Promise<T> => {
    logger.debug('API POST:', url);
    return request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request
   */
  put: <T = any>(url: string, data?: any, options?: ApiOptions): Promise<T> => {
    logger.debug('API PUT:', url);
    return request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PATCH request
   */
  patch: <T = any>(url: string, data?: any, options?: ApiOptions): Promise<T> => {
    logger.debug('API PATCH:', url);
    return request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request
   */
  delete: <T = any>(url: string, options?: ApiOptions): Promise<T> => {
    logger.debug('API DELETE:', url);
    return request<T>(url, { ...options, method: 'DELETE' });
  },
};

export default api;

/**
 * Helper para construir URLs com query params
 */
export function buildUrl(base: string, params?: Record<string, any>): string {
  if (!params) return base;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${base}?${queryString}` : base;
}

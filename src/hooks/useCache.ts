import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  ttl?: number; // Time to live em milissegundos
  maxSize?: number; // Máximo de itens no cache
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos
  private maxSize = 100;

  set<T>(key: string, data: T, ttl?: number): void {
    // Limpar cache se exceder tamanho máximo
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpar itens expirados
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Estatísticas do cache
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instância global do cache
const cacheManager = new CacheManager();

// Limpeza automática a cada 10 minutos
setInterval(() => {
  cacheManager.cleanup();
}, 10 * 60 * 1000);

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { ttl = 5 * 60 * 1000 } = config;

  const fetchData = useCallback(async (force = false) => {
    // Verificar cache primeiro (se não for forçado)
    if (!force && cacheManager.has(key)) {
      const cachedData = cacheManager.get<T>(key);
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      
      // Salvar no cache
      cacheManager.set(key, result, ttl);
      setData(result);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttl]);

  // Carregar dados na montagem
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cacheManager.delete(key);
  }, [key]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    invalidate,
    fetchData
  };
}

// Hook para cache de produtos
export function useProductCache() {
  const invalidateProduct = useCallback((productId: string) => {
    cacheManager.delete(`product-${productId}`);
    cacheManager.delete('products-all');
  }, []);

  const invalidateCategory = useCallback((categoryId: string) => {
    cacheManager.delete(`category-${categoryId}`);
    cacheManager.delete(`products-category-${categoryId}`);
  }, []);

  const invalidateAll = useCallback(() => {
    cacheManager.clear();
  }, []);

  return {
    invalidateProduct,
    invalidateCategory,
    invalidateAll
  };
}

// Hook para cache de usuário
export function useUserCache() {
  const invalidateUser = useCallback((userId: string) => {
    cacheManager.delete(`user-${userId}`);
    cacheManager.delete(`user-addresses-${userId}`);
    cacheManager.delete(`user-orders-${userId}`);
    cacheManager.delete(`user-favorites-${userId}`);
  }, []);

  const invalidateAddresses = useCallback((userId: string) => {
    cacheManager.delete(`user-addresses-${userId}`);
  }, []);

  const invalidateOrders = useCallback((userId: string) => {
    cacheManager.delete(`user-orders-${userId}`);
  }, []);

  return {
    invalidateUser,
    invalidateAddresses,
    invalidateOrders
  };
}

export { cacheManager };
export default useCache;

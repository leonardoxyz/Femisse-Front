// Utilitários para otimização de performance
import React from 'react';

// Debounce para evitar muitas chamadas seguidas
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

// Throttle para limitar frequência de execução
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Cache simples com TTL
class SimpleCache<T> {
  private cache = new Map<string, { value: T; expires: number }>();
  
  set(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    const expires = Date.now() + ttl;
    this.cache.set(key, { value, expires });
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

// Instância global do cache
export const cache = new SimpleCache();

// Função para criar chaves de cache consistentes
export function createCacheKey(...parts: (string | number | boolean)[]): string {
  return parts.map(part => String(part)).join(':');
}

// Hook para lazy loading de imagens
export function createImageLoader() {
  const imageCache = new Set<string>();
  
  return {
    preloadImage: (src: string): Promise<void> => {
      if (imageCache.has(src)) {
        return Promise.resolve();
      }
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imageCache.add(src);
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    },
    
    isImageCached: (src: string): boolean => {
      return imageCache.has(src);
    },
    
    clearImageCache: (): void => {
      imageCache.clear();
    }
  };
}

// Função para otimizar URLs de imagens (adicionar parâmetros de qualidade/tamanho)
export function optimizeImageUrl(
  url: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string {
  if (!url) return url;
  
  // Se for uma URL do Supabase Storage, adicionar parâmetros de transformação
  if (url.includes('supabase') && url.includes('storage')) {
    const urlObj = new URL(url);
    const params = new URLSearchParams();
    
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.quality) params.set('quality', options.quality.toString());
    if (options.format) params.set('format', options.format);
    
    if (params.toString()) {
      urlObj.search = params.toString();
      return urlObj.toString();
    }
  }
  
  return url;
}

// Função para detectar se o dispositivo tem conexão lenta
export function isSlowConnection(): boolean {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' ||
           connection.saveData === true;
  }
  return false;
}

// Função para lazy loading de componentes
export function createLazyLoader<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  return React.lazy(async () => {
    // Adicionar delay mínimo para evitar flash
    const [component] = await Promise.all([
      importFunc(),
      new Promise(resolve => setTimeout(resolve, 100))
    ]);
    return component;
  });
}

// Função para memoização de resultados de funções
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limitar tamanho do cache
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
}

// Função para batch de requests
export class RequestBatcher {
  private batches = new Map<string, {
    requests: Array<{
      resolve: (value: any) => void;
      reject: (error: any) => void;
      params: any;
    }>;
    timeout: NodeJS.Timeout;
  }>();
  
  constructor(
    private batchFn: (requests: any[]) => Promise<any[]>,
    private batchKey: (params: any) => string,
    private batchDelay: number = 50
  ) {}
  
  request<T>(params: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const key = this.batchKey(params);
      
      if (!this.batches.has(key)) {
        this.batches.set(key, {
          requests: [],
          timeout: setTimeout(() => this.executeBatch(key), this.batchDelay)
        });
      }
      
      const batch = this.batches.get(key)!;
      batch.requests.push({ resolve, reject, params });
    });
  }
  
  private async executeBatch(key: string): Promise<void> {
    const batch = this.batches.get(key);
    if (!batch) return;
    
    this.batches.delete(key);
    clearTimeout(batch.timeout);
    
    try {
      const results = await this.batchFn(batch.requests.map(r => r.params));
      
      batch.requests.forEach((request, index) => {
        request.resolve(results[index]);
      });
    } catch (error) {
      batch.requests.forEach(request => {
        request.reject(error);
      });
    }
  }
}

// Função para monitorar performance
export function measurePerformance(name: string) {
  const start = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
      return duration;
    }
  };
}

// Função para detectar se está em viewport
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

export default {
  debounce,
  throttle,
  cache,
  createCacheKey,
  createImageLoader,
  optimizeImageUrl,
  isSlowConnection,
  memoize,
  RequestBatcher,
  measurePerformance,
  createIntersectionObserver
};

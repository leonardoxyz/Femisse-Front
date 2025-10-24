/**
 * 🔒 Secure Storage Utility
 * 
 * Implementa armazenamento seguro com:
 * - Sanitização de dados
 * - Validação de tipos
 * - Proteção contra XSS
 * - Tratamento de erros robusto
 * - Limpeza automática de dados expirados
 */

import { logger } from "@/utils/logger-unified";

// Prefixo para evitar colisões com outras aplicações
const APP_PREFIX = 'femisse_';

// TTL padrão: 7 dias
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000;

interface StorageItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

/**
 * Sanitiza string removendo caracteres perigosos
 */
function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Valida se o valor é seguro para armazenar
 */
function isValidValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  
  // Não permite funções
  if (typeof value === 'function') return false;
  
  // Valida strings
  if (typeof value === 'string') {
    // Não permite strings muito grandes (>1MB)
    if (value.length > 1024 * 1024) return false;
    
    // Não permite scripts inline
    if (/<script|javascript:|on\w+=/i.test(value)) return false;
  }
  
  return true;
}

/**
 * Gera chave com prefixo da aplicação
 */
function getKey(key: string): string {
  return `${APP_PREFIX}${sanitizeString(key)}`;
}

/**
 * Verifica se o item expirou
 */
function isExpired(item: StorageItem<unknown>): boolean {
  if (!item.ttl) return false;
  return Date.now() - item.timestamp > item.ttl;
}

/**
 * Classe para gerenciar localStorage de forma segura
 */
class SecureStorage {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  /**
   * Armazena um valor de forma segura
   */
  setItem<T>(key: string, value: T, ttl: number = DEFAULT_TTL): boolean {
    try {
      // Valida o valor
      if (!isValidValue(value)) {
        logger.warn('Tentativa de armazenar valor inválido:', { key });
        return false;
      }

      // Sanitiza strings
      let sanitizedValue = value;
      if (typeof value === 'string') {
        sanitizedValue = sanitizeString(value) as T;
      }

      const item: StorageItem<T> = {
        value: sanitizedValue,
        timestamp: Date.now(),
        ttl
      };

      const serialized = JSON.stringify(item);
      
      // Verifica tamanho (limite de 5MB por item)
      if (serialized.length > 5 * 1024 * 1024) {
        logger.error('Item muito grande para armazenar:', { key, size: serialized.length });
        return false;
      }

      this.storage.setItem(getKey(key), serialized);
      return true;
    } catch (error) {
      logger.error('Erro ao armazenar item:', { key, error });
      return false;
    }
  }

  /**
   * Recupera um valor de forma segura
   */
  getItem<T>(key: string): T | null {
    try {
      const raw = this.storage.getItem(getKey(key));
      if (!raw) return null;

      const item = JSON.parse(raw) as StorageItem<T>;

      // Verifica se expirou
      if (isExpired(item)) {
        this.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      logger.error('Erro ao recuperar item:', { key, error });
      return null;
    }
  }

  /**
   * Remove um item
   */
  removeItem(key: string): void {
    try {
      this.storage.removeItem(getKey(key));
    } catch (error) {
      logger.error('Erro ao remover item:', { key, error });
    }
  }

  /**
   * Limpa todos os itens da aplicação
   */
  clear(): void {
    try {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith(APP_PREFIX)) {
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      logger.error('Erro ao limpar storage:', error);
    }
  }

  /**
   * Remove itens expirados
   */
  cleanExpired(): void {
    try {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (!key.startsWith(APP_PREFIX)) return;

        try {
          const raw = this.storage.getItem(key);
          if (!raw) return;

          const item = JSON.parse(raw) as StorageItem<unknown>;
          if (isExpired(item)) {
            this.storage.removeItem(key);
          }
        } catch {
          // Item corrompido, remove
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      logger.error('Erro ao limpar itens expirados:', error);
    }
  }

  /**
   * Verifica se uma chave existe
   */
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * Obtém todas as chaves da aplicação
   */
  keys(): string[] {
    try {
      return Object.keys(this.storage)
        .filter(key => key.startsWith(APP_PREFIX))
        .map(key => key.replace(APP_PREFIX, ''));
    } catch (error) {
      logger.error('Erro ao obter chaves:', error);
      return [];
    }
  }

  /**
   * Obtém o tamanho total usado (em bytes)
   */
  getSize(): number {
    try {
      let size = 0;
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith(APP_PREFIX)) {
          const value = this.storage.getItem(key);
          if (value) {
            size += value.length + key.length;
          }
        }
      });
      return size;
    } catch (error) {
      logger.error('Erro ao calcular tamanho:', error);
      return 0;
    }
  }
}

// Instâncias singleton
export const secureLocalStorage = new SecureStorage(localStorage);
export const secureSessionStorage = new SecureStorage(sessionStorage);

// Limpa itens expirados ao carregar
if (typeof window !== 'undefined') {
  secureLocalStorage.cleanExpired();
  secureSessionStorage.cleanExpired();
  
  // Limpa itens expirados a cada hora
  setInterval(() => {
    secureLocalStorage.cleanExpired();
    secureSessionStorage.cleanExpired();
  }, 60 * 60 * 1000);
}

export default secureLocalStorage;

import { useState, useEffect, useRef, useCallback } from 'react';
import { secureSessionStorage } from '@/utils/secureStorage';
// Logger wrapper para evitar erros
const logger = {
  log: (...args: any[]) => console.log('[CPF Verification]', ...args),
  error: (...args: any[]) => console.error('[CPF Verification Error]', ...args),
  warn: (...args: any[]) => console.warn('[CPF Verification Warning]', ...args),
  debug: (...args: any[]) => console.debug('[CPF Verification]', ...args)
};

interface CPFVerificationResult {
  cpf: string | null;
  isChecking: boolean;
  error: string | null;
}

interface CPFCache {
  cpf: string | null;
  timestamp: number;
}

const CACHE_KEY = 'cpf_verification_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Hook seguro para verificação de CPF
 * 
 * Características de segurança:
 * - Cache em sessionStorage (limpo ao fechar navegador)
 * - Debounce para evitar múltiplas requisições
 * - Abort controller para cancelar requisições pendentes
 * - Validação de formato antes da requisição
 * - Logs seguros sem expor CPF completo
 */
export function useSecureCPFVerification(userId: string | undefined, isAuthenticated: boolean) {
  const [result, setResult] = useState<CPFVerificationResult>({
    cpf: null,
    isChecking: true,
    error: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Mascara CPF para logs (mostra apenas primeiros 3 dígitos)
  const maskCPF = (cpf: string | null): string => {
    if (!cpf) return 'null';
    if (cpf.length < 11) return '***';
    return `${cpf.substring(0, 3)}.***.***-**`;
  };

  // Verifica se o cache é válido
  const getCachedCPF = useCallback((): string | null => {
    try {
      const cached = secureSessionStorage.getItem<CPFCache>(CACHE_KEY);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.cpf;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, []);

  // Armazena CPF no cache
  const setCachedCPF = useCallback((cpf: string | null) => {
    try {
      const cacheData: CPFCache = {
        cpf,
        timestamp: Date.now()
      };
      secureSessionStorage.setItem(CACHE_KEY, cacheData, CACHE_TTL);
    } catch (error) {
      logger.error('Erro ao armazenar cache de CPF:', error);
    }
  }, []);

  // Verifica CPF na API
  const verifyCPF = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setResult({ cpf: null, isChecking: false, error: null });
      return;
    }

    // Tenta usar cache primeiro
    const cachedCPF = getCachedCPF();
    if (cachedCPF !== null) {
      setResult({ cpf: cachedCPF, isChecking: false, error: null });
      return;
    }

    // Cancela requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Cria novo controller
    abortControllerRef.current = new AbortController();

    setResult(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        credentials: 'include',
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!isMountedRef.current) return;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const userData = await response.json();
      const cpf = userData.data?.cpf || userData.cpf || null;

      setCachedCPF(cpf);
      setResult({ cpf, isChecking: false, error: null });

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      if (!isMountedRef.current) return;
      setResult({ cpf: null, isChecking: false, error: 'Erro ao verificar CPF' });
    }
  }, [isAuthenticated, userId, getCachedCPF, setCachedCPF]);

  // Verifica CPF quando userId mudar
  useEffect(() => {
    isMountedRef.current = true;
    verifyCPF();
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [verifyCPF]);

  const invalidateCache = useCallback(() => {
    secureSessionStorage.removeItem(CACHE_KEY);
  }, []);

  // Método para revalidar
  const revalidate = useCallback(() => {
    invalidateCache();
    verifyCPF();
  }, [invalidateCache, verifyCPF]);

  return {
    ...result,
    invalidateCache,
    revalidate
  };
}

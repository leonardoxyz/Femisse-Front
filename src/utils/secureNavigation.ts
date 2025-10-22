/**
 * 🔒 Secure Navigation Utility
 * 
 * Previne ataques de:
 * - Open Redirect
 * - XSS via URL
 * - CSRF
 * - Clickjacking
 */

import { logger } from './logger';

// Domínios permitidos para redirecionamento
const ALLOWED_DOMAINS = [
  'localhost',
  import.meta.env.VITE_FRONTEND_URL?.replace(/^https?:\/\//, '') || 'femisse-front.vercel.app',
  import.meta.env.VITE_BACKEND_URL?.replace(/^https?:\/\//, '') || 'femisse-back2.vercel.app',
].filter(Boolean);

// Protocolos permitidos
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Valida se uma URL é segura para redirecionamento
 */
export function isValidUrl(url: string): boolean {
  try {
    // Remove espaços e caracteres de controle
    const cleanUrl = url.trim().replace(/[\x00-\x1F\x7F]/g, '');
    
    // Não permite URLs vazias
    if (!cleanUrl) return false;
    
    // Não permite javascript: ou data:
    if (/^(javascript|data|vbscript|file):/i.test(cleanUrl)) {
      logger.warn('Tentativa de usar protocolo perigoso:', { url: cleanUrl });
      return false;
    }
    
    // Se for URL relativa, é válida
    if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//')) {
      return true;
    }
    
    // Valida URL absoluta
    const urlObj = new URL(cleanUrl, window.location.origin);
    
    // Verifica protocolo
    if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol)) {
      logger.warn('Protocolo não permitido:', { protocol: urlObj.protocol });
      return false;
    }
    
    // Verifica domínio
    const hostname = urlObj.hostname;
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowed) {
      logger.warn('Domínio não permitido:', { hostname });
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error('Erro ao validar URL:', { url, error });
    return false;
  }
}

/**
 * Sanitiza uma URL removendo parâmetros perigosos
 */
export function sanitizeUrl(url: string): string {
  try {
    const cleanUrl = url.trim();
    
    // Se for relativa, retorna direto
    if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//')) {
      return cleanUrl;
    }
    
    const urlObj = new URL(cleanUrl, window.location.origin);
    
    // Remove parâmetros potencialmente perigosos
    const dangerousParams = ['javascript', 'script', 'eval', 'onclick', 'onerror'];
    dangerousParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch (error) {
    logger.error('Erro ao sanitizar URL:', { url, error });
    return '/';
  }
}

/**
 * Navega de forma segura para uma URL
 */
export function safeNavigate(url: string, replace: boolean = false): void {
  try {
    // Valida URL
    if (!isValidUrl(url)) {
      logger.error('Tentativa de navegação para URL inválida:', { url });
      window.location.href = '/';
      return;
    }
    
    // Sanitiza URL
    const safeUrl = sanitizeUrl(url);
    
    // Navega
    if (replace) {
      window.location.replace(safeUrl);
    } else {
      window.location.href = safeUrl;
    }
  } catch (error) {
    logger.error('Erro ao navegar:', { url, error });
    window.location.href = '/';
  }
}

/**
 * Recarrega a página de forma segura
 */
export function safeReload(): void {
  try {
    window.location.reload();
  } catch (error) {
    logger.error('Erro ao recarregar página:', error);
  }
}

/**
 * Extrai parâmetros da URL de forma segura
 */
export function getSafeUrlParams(): Record<string, string> {
  try {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(window.location.search);
    
    searchParams.forEach((value, key) => {
      // Sanitiza chave e valor
      const safeKey = key.replace(/[<>]/g, '').trim();
      const safeValue = value.replace(/[<>]/g, '').trim();
      
      if (safeKey && safeValue) {
        params[safeKey] = safeValue;
      }
    });
    
    return params;
  } catch (error) {
    logger.error('Erro ao extrair parâmetros da URL:', error);
    return {};
  }
}

/**
 * Verifica se a navegação é segura (mesmo origem)
 */
export function isSameOrigin(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin === window.location.origin;
  } catch (error) {
    return false;
  }
}

/**
 * Cria uma URL segura com parâmetros
 */
export function buildSafeUrl(
  path: string, 
  params?: Record<string, string | number>
): string {
  try {
    const url = new URL(path, window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Sanitiza chave e valor
        const safeKey = String(key).replace(/[<>]/g, '').trim();
        const safeValue = String(value).replace(/[<>]/g, '').trim();
        
        if (safeKey && safeValue) {
          url.searchParams.set(safeKey, safeValue);
        }
      });
    }
    
    return url.pathname + url.search;
  } catch (error) {
    logger.error('Erro ao construir URL:', { path, params, error });
    return '/';
  }
}

export default {
  isValidUrl,
  sanitizeUrl,
  safeNavigate,
  safeReload,
  getSafeUrlParams,
  isSameOrigin,
  buildSafeUrl,
};

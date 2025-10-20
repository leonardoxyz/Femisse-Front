/**
 * Utilitário para fazer fetch com controle de cache
 */

export interface FetchOptions extends RequestInit {
  noCache?: boolean;
  revalidate?: number; // segundos
}

/**
 * Fetch com controle de cache otimizado
 * 
 * @param url - URL para fazer o fetch
 * @param options - Opções do fetch + controle de cache
 * @returns Promise com a resposta
 */
export async function fetchWithCache(url: string, options: FetchOptions = {}) {
  const { noCache = false, revalidate, ...fetchOptions } = options;

  // Headers padrão
  const headers = new Headers(fetchOptions.headers);

  if (noCache) {
    // Desabilitar cache completamente
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  } else if (revalidate !== undefined) {
    // Cache com revalidação
    headers.set('Cache-Control', `max-age=${revalidate}`);
  } else if (import.meta.env.DEV) {
    // Em desenvolvimento: cache curto (30s)
    headers.set('Cache-Control', 'max-age=30');
  } else {
    // Em produção: cache moderado (2min)
    headers.set('Cache-Control', 'max-age=120');
  }

  return fetch(url, {
    ...fetchOptions,
    headers,
  });
}

/**
 * Fetch sem cache (sempre busca dados frescos)
 */
export async function fetchNoCache(url: string, options: RequestInit = {}) {
  return fetchWithCache(url, { ...options, noCache: true });
}

/**
 * Fetch com revalidação customizada
 */
export async function fetchWithRevalidate(
  url: string,
  seconds: number,
  options: RequestInit = {}
) {
  return fetchWithCache(url, { ...options, revalidate: seconds });
}

/**
 * Helper para adicionar timestamp na URL (cache busting)
 */
export function addCacheBuster(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}`;
}

/**
 * Fetch com cache busting (força reload)
 */
export async function fetchWithCacheBuster(url: string, options: RequestInit = {}) {
  return fetch(addCacheBuster(url), {
    ...options,
    headers: {
      ...options.headers,
      'Cache-Control': 'no-cache',
    },
  });
}

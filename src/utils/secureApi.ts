// Utilitário para requisições seguras e ofuscadas

const isProduction = import.meta.env.PROD;

// Função simples para ofuscar logs em produção
export const secureLog = (message: string, data?: any) => {
  if (!isProduction) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

// Função para ofuscar URLs em logs
export const obfuscateUrl = (url: string): string => {
  if (isProduction) return '[API_REQUEST]';
  
  return url
    .replace(/\/api\/[^\/]+\/[a-f0-9-]{36}/g, '/api/[RESOURCE]/[ID]')
    .replace(/token=[^&]+/g, 'token=[HIDDEN]')
    .replace(/key=[^&]+/g, 'key=[HIDDEN]');
};

// Headers de segurança padrão
export const getSecureHeaders = (additionalHeaders: Record<string, string> = {}) => {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Cache-Control': 'no-cache',
    ...additionalHeaders,
  };
};

// Wrapper para fetch com headers de segurança e ofuscação de parâmetros
export const secureFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const secureOptions: RequestInit = {
    ...options,
    headers: getSecureHeaders(options.headers as Record<string, string>),
    credentials: 'same-origin',
    mode: 'cors',
  };

  // Log ofuscado
  secureLog('🌐 Requisição para:', obfuscateUrl(url));

  try {
    const response = await fetch(url, secureOptions);
    
    if (!response.ok && !isProduction) {
      console.warn('⚠️ Requisição falhou:', response.status, response.statusText);
    }
    
    return response;
  } catch (error) {
    if (isProduction) {
      console.error('Erro de rede');
    } else {
      console.error('Erro na requisição:', error);
    }
    throw error;
  }
};

// Função para criar URLs com parâmetros ofuscados (apenas em produção)
export const createSecureUrl = (baseUrl: string, params?: Record<string, any>): string => {
  if (!params || !isProduction) {
    return baseUrl;
  }

  // Em produção, usar hash dos parâmetros em vez dos valores reais
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (isProduction && (key.includes('id') || key.includes('token'))) {
      // Ofuscar IDs e tokens
      searchParams.append(key, btoa(String(value)).slice(0, 8));
    } else {
      searchParams.append(key, String(value));
    }
  });
  
  return `${baseUrl}?${searchParams.toString()}`;
};

// Rate limiting simples
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests = 50;
  private windowMs = 60000;

  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];
    const recentRequests = requests.filter(time => now - time < this.windowMs);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(endpoint, recentRequests);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

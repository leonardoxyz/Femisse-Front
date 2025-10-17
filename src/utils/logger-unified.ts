/**
 * 🔍 Sistema de Logging Unificado
 * 
 * Logger centralizado que:
 * - Remove console.log em produção automaticamente
 * - Oferece níveis de log (debug, info, warn, error)
 * - Ofusca dados sensíveis
 * - Formata mensagens consistentemente
 */

const IS_PRODUCTION = import.meta.env.PROD;
const IS_DEVELOPMENT = import.meta.env.DEV;

// ============================================
// OFUSCAÇÃO DE DADOS SENSÍVEIS
// ============================================

const SENSITIVE_KEYS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'authorization',
  'cpf',
  'card',
  'cvv',
  'cardNumber',
];

/**
 * Ofusca dados sensíveis em objetos
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(sensitive => keyLower.includes(sensitive));
    
    if (isSensitive && typeof value === 'string') {
      sanitized[key] = '***HIDDEN***';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Ofusca URLs com IDs e tokens
 */
function sanitizeUrl(url: string): string {
  return url
    .replace(/\/[a-f0-9-]{36}/g, '/[UUID]')
    .replace(/\/\d{10,}/g, '/[ID]')
    .replace(/token=[^&]+/g, 'token=[HIDDEN]')
    .replace(/key=[^&]+/g, 'key=[HIDDEN]')
    .replace(/password=[^&]+/g, 'password=[HIDDEN]');
}

// ============================================
// LOGGER CLASS
// ============================================

class Logger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  /**
   * Debug - apenas em desenvolvimento
   */
  debug(message: string, data?: any) {
    if (IS_DEVELOPMENT) {
      const sanitized = data ? sanitizeData(data) : undefined;
      console.log(`🐛 [${this.context}] ${message}`, sanitized || '');
    }
  }

  /**
   * Info - apenas em desenvolvimento
   */
  info(message: string, data?: any) {
    if (!IS_PRODUCTION) {
      const sanitized = data ? sanitizeData(data) : undefined;
      console.log(`ℹ️ [${this.context}] ${message}`, sanitized || '');
    }
  }

  /**
   * Log genérico - apenas em desenvolvimento
   */
  log(message: string, data?: any) {
    if (!IS_PRODUCTION) {
      const sanitized = data ? sanitizeData(data) : undefined;
      console.log(`📝 [${this.context}] ${message}`, sanitized || '');
    }
  }

  /**
   * Warning - sempre exibe (mas sanitizado em produção)
   */
  warn(message: string, data?: any) {
    const sanitized = IS_PRODUCTION ? undefined : (data ? sanitizeData(data) : undefined);
    console.warn(`⚠️ [${this.context}] ${message}`, sanitized || '');
  }

  /**
   * Error - sempre exibe (mas sanitizado em produção)
   */
  error(message: string, error?: any) {
    if (IS_PRODUCTION) {
      // Em produção, apenas mensagem genérica
      console.error(`❌ [${this.context}] ${message}`);
    } else {
      // Em desenvolvimento, mostra detalhes
      const sanitized = error ? sanitizeData(error) : undefined;
      console.error(`❌ [${this.context}] ${message}`, sanitized || '');
      
      // Se for um Error object, mostra stack trace
      if (error instanceof Error) {
        console.error(error.stack);
      }
    }
  }

  /**
   * Performance - mede tempo de execução
   */
  time(label: string) {
    if (!IS_PRODUCTION) {
      console.time(`⏱️ [${this.context}] ${label}`);
    }
  }

  timeEnd(label: string) {
    if (!IS_PRODUCTION) {
      console.timeEnd(`⏱️ [${this.context}] ${label}`);
    }
  }

  /**
   * Group - agrupa logs relacionados
   */
  group(label: string) {
    if (!IS_PRODUCTION) {
      console.group(`📦 [${this.context}] ${label}`);
    }
  }

  groupEnd() {
    if (!IS_PRODUCTION) {
      console.groupEnd();
    }
  }
}

// ============================================
// EXPORTS
// ============================================

/**
 * Logger padrão da aplicação
 */
export const logger = new Logger('App');

/**
 * Cria logger com contexto específico
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Utilitários de sanitização
 */
export const sanitize = {
  data: sanitizeData,
  url: sanitizeUrl,
};

export default logger;

/**
 * Logger condicional - apenas em desenvolvimento
 * Evita logs em produção para segurança e performance
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log informativo (apenas em desenvolvimento)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Log de erro (sempre ativo, mas sanitizado em produção)
   */
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error('[ERROR]', ...args);
    } else {
      // Em produção, enviar para serviço de monitoramento (Sentry, etc)
      console.error('[ERROR] Ocorreu um erro. Verifique os logs do servidor.');
    }
  },

  /**
   * Log de aviso (apenas em desenvolvimento)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * Log de informação de grupo (apenas em desenvolvimento)
   */
  group: (label: string, ...args: any[]) => {
    if (isDevelopment) {
      console.group(label);
      console.log(...args);
      console.groupEnd();
    }
  },
};

/**
 * Helper para logar performance
 */
export const logPerformance = (label: string, startTime: number) => {
  if (isDevelopment) {
    const duration = performance.now() - startTime;
    console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
  }
};

/**
 * Helper para logar requisições API
 */
export const logApiCall = (method: string, url: string, status?: number) => {
  if (isDevelopment) {
    const statusColor = status && status >= 200 && status < 300 ? '✅' : '❌';
    console.log(`[API] ${statusColor} ${method} ${url}${status ? ` - ${status}` : ''}`);
  }
};

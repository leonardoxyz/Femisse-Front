/**
 * 🚨 Error Handler Centralizado
 * 
 * Gerencia todos os erros da aplicação de forma consistente:
 * - Erros de API (network, 4xx, 5xx)
 * - Erros de validação
 * - Erros de autenticação
 * - Erros genéricos
 */

import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { createLogger } from './logger-unified';

const logger = createLogger('ErrorHandler');

// ============================================
// TIPOS DE ERRO
// ============================================

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  statusCode?: number;
  originalError?: any;
}

// ============================================
// MAPEAMENTO DE MENSAGENS AMIGÁVEIS
// ============================================

const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'Erro de conexão. Verifique sua internet.',
  [ErrorType.AUTHENTICATION]: 'Sessão expirada. Faça login novamente.',
  [ErrorType.AUTHORIZATION]: 'Você não tem permissão para esta ação.',
  [ErrorType.VALIDATION]: 'Dados inválidos. Verifique os campos.',
  [ErrorType.NOT_FOUND]: 'Recurso não encontrado.',
  [ErrorType.SERVER]: 'Erro no servidor. Tente novamente.',
  [ErrorType.UNKNOWN]: 'Erro inesperado. Tente novamente.',
};

// ============================================
// CLASSIFICAÇÃO DE ERROS
// ============================================

function classifyError(error: any): AppError {
  // Erro de rede (sem resposta)
  if (error.request && !error.response) {
    return {
      type: ErrorType.NETWORK,
      message: 'Network error',
      userMessage: ERROR_MESSAGES[ErrorType.NETWORK],
      originalError: error,
    };
  }

  // Erro HTTP com resposta
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return {
          type: ErrorType.VALIDATION,
          message: data?.message || 'Validation error',
          userMessage: data?.message || ERROR_MESSAGES[ErrorType.VALIDATION],
          statusCode: status,
          originalError: error,
        };

      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          message: 'Authentication failed',
          userMessage: ERROR_MESSAGES[ErrorType.AUTHENTICATION],
          statusCode: status,
          originalError: error,
        };

      case 403:
        return {
          type: ErrorType.AUTHORIZATION,
          message: 'Authorization failed',
          userMessage: ERROR_MESSAGES[ErrorType.AUTHORIZATION],
          statusCode: status,
          originalError: error,
        };

      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          message: 'Resource not found',
          userMessage: data?.message || ERROR_MESSAGES[ErrorType.NOT_FOUND],
          statusCode: status,
          originalError: error,
        };

      case 429:
        return {
          type: ErrorType.VALIDATION,
          message: 'Rate limit exceeded',
          userMessage: 'Muitas requisições. Aguarde um momento.',
          statusCode: status,
          originalError: error,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.SERVER,
          message: 'Server error',
          userMessage: ERROR_MESSAGES[ErrorType.SERVER],
          statusCode: status,
          originalError: error,
        };

      default:
        return {
          type: ErrorType.UNKNOWN,
          message: data?.message || 'Unknown error',
          userMessage: data?.message || ERROR_MESSAGES[ErrorType.UNKNOWN],
          statusCode: status,
          originalError: error,
        };
    }
  }

  // Erro genérico
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || 'Unknown error',
    userMessage: ERROR_MESSAGES[ErrorType.UNKNOWN],
    originalError: error,
  };
}

// ============================================
// HANDLER PRINCIPAL
// ============================================

export class ErrorHandler {
  /**
   * Processa erro e exibe mensagem ao usuário
   */
  static handle(error: any, context?: string): AppError {
    const appError = classifyError(error);
    
    // Log do erro
    logger.error(
      `${context ? `[${context}] ` : ''}${appError.message}`,
      appError.originalError
    );

    // Exibe toast para o usuário (exceto 401 que redireciona)
    if (appError.type !== ErrorType.AUTHENTICATION) {
      toast.error(appError.userMessage);
    }

    return appError;
  }

  /**
   * Processa erro sem exibir toast
   */
  static handleSilent(error: any, context?: string): AppError {
    const appError = classifyError(error);
    
    logger.error(
      `${context ? `[${context}] ` : ''}${appError.message}`,
      appError.originalError
    );

    return appError;
  }

  /**
   * Processa erro de validação de formulário
   */
  static handleValidation(error: any): Record<string, string> {
    const appError = classifyError(error);
    
    // Se o backend retornou erros de campo específicos
    if (appError.originalError?.response?.data?.errors) {
      return appError.originalError.response.data.errors;
    }

    // Erro genérico de validação
    toast.error(appError.userMessage);
    return {};
  }

  /**
   * Verifica se é erro de autenticação
   */
  static isAuthError(error: any): boolean {
    const appError = classifyError(error);
    return appError.type === ErrorType.AUTHENTICATION;
  }

  /**
   * Verifica se é erro de rede
   */
  static isNetworkError(error: any): boolean {
    const appError = classifyError(error);
    return appError.type === ErrorType.NETWORK;
  }
}

// ============================================
// HELPER PARA ASYNC/AWAIT
// ============================================

/**
 * Wrapper para async functions com error handling
 * 
 * @example
 * const [data, error] = await handleAsync(fetchData());
 * if (error) {
 *   // Erro já foi tratado e exibido
 *   return;
 * }
 * // Usa data normalmente
 */
export async function handleAsync<T>(
  promise: Promise<T>,
  context?: string
): Promise<[T | null, AppError | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    const appError = ErrorHandler.handle(error, context);
    return [null, appError];
  }
}

/**
 * Wrapper silencioso (sem toast)
 */
export async function handleAsyncSilent<T>(
  promise: Promise<T>,
  context?: string
): Promise<[T | null, AppError | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    const appError = ErrorHandler.handleSilent(error, context);
    return [null, appError];
  }
}

export default ErrorHandler;

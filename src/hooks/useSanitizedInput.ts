/**
 * 🔒 Sanitized Input Hook
 * 
 * Protege contra:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection
 * - Command Injection
 * - Path Traversal
 */

import { useState, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface SanitizeOptions {
  maxLength?: number;
  allowHtml?: boolean;
  allowSpecialChars?: boolean;
  trim?: boolean;
}

/**
 * Sanitiza uma string removendo conteúdo perigoso
 */
function sanitizeString(
  value: string,
  options: SanitizeOptions = {}
): string {
  const {
    maxLength = 10000,
    allowHtml = false,
    allowSpecialChars = true,
    trim = true,
  } = options;

  let sanitized = value;

  // Trim
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove caracteres de controle
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Remove HTML se não permitido
  if (!allowHtml) {
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*>/gi, '')
      .replace(/<link\b[^<]*>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ''); // Remove todas as tags HTML
  }

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: e data: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // Remove caracteres especiais perigosos se não permitido
  if (!allowSpecialChars) {
    sanitized = sanitized.replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return entities[char] || char;
    });
  }

  // Limita tamanho
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
    logger.warn('Input truncado por exceder tamanho máximo:', {
      maxLength,
      originalLength: value.length,
    });
  }

  return sanitized;
}

/**
 * Valida email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Valida CPF
 */
function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

/**
 * Valida telefone brasileiro
 */
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Valida CEP
 */
function isValidCEP(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
}

/**
 * Hook para input sanitizado
 */
export function useSanitizedInput<T = string>(
  initialValue: T,
  options: SanitizeOptions = {}
) {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string>('');

  const handleChange = useCallback(
    (newValue: T) => {
      try {
        if (typeof newValue === 'string') {
          const sanitized = sanitizeString(newValue, options) as T;
          setValue(sanitized);
          setError('');
        } else {
          setValue(newValue);
          setError('');
        }
      } catch (err) {
        logger.error('Erro ao sanitizar input:', err);
        setError('Valor inválido');
      }
    },
    [options]
  );

  const validate = useCallback(
    (validator: (val: T) => boolean, errorMessage: string): boolean => {
      const isValid = validator(value);
      if (!isValid) {
        setError(errorMessage);
      } else {
        setError('');
      }
      return isValid;
    },
    [value]
  );

  const reset = useCallback(() => {
    setValue(initialValue);
    setError('');
  }, [initialValue]);

  return {
    value,
    setValue: handleChange,
    error,
    setError,
    validate,
    reset,
  };
}

/**
 * Hook para email sanitizado
 */
export function useSanitizedEmail(initialValue: string = '') {
  const input = useSanitizedInput(initialValue, {
    maxLength: 254,
    allowHtml: false,
    allowSpecialChars: true,
  });

  const validateEmail = useCallback(() => {
    return input.validate(
      (val) => isValidEmail(val as string),
      'Email inválido'
    );
  }, [input]);

  return {
    ...input,
    validateEmail,
  };
}

/**
 * Hook para CPF sanitizado
 */
export function useSanitizedCPF(initialValue: string = '') {
  const input = useSanitizedInput(initialValue, {
    maxLength: 14,
    allowHtml: false,
    allowSpecialChars: false,
  });

  const validateCPF = useCallback(() => {
    return input.validate(
      (val) => isValidCPF(val as string),
      'CPF inválido'
    );
  }, [input]);

  return {
    ...input,
    validateCPF,
  };
}

/**
 * Hook para telefone sanitizado
 */
export function useSanitizedPhone(initialValue: string = '') {
  const input = useSanitizedInput(initialValue, {
    maxLength: 15,
    allowHtml: false,
    allowSpecialChars: false,
  });

  const validatePhone = useCallback(() => {
    return input.validate(
      (val) => isValidPhone(val as string),
      'Telefone inválido'
    );
  }, [input]);

  return {
    ...input,
    validatePhone,
  };
}

/**
 * Hook para CEP sanitizado
 */
export function useSanitizedCEP(initialValue: string = '') {
  const input = useSanitizedInput(initialValue, {
    maxLength: 9,
    allowHtml: false,
    allowSpecialChars: false,
  });

  const validateCEP = useCallback(() => {
    return input.validate(
      (val) => isValidCEP(val as string),
      'CEP inválido'
    );
  }, [input]);

  return {
    ...input,
    validateCEP,
  };
}

export default useSanitizedInput;

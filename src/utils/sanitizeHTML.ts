/**
 * 🔒 Sanitização de HTML para prevenir XSS
 * 
 * IMPORTANTE: Este é um placeholder até que DOMPurify seja instalado
 * 
 * Para instalar DOMPurify:
 * npm install dompurify
 * npm install --save-dev @types/dompurify
 * 
 * Depois de instalar, descomentar e usar a versão com DOMPurify
 */

// import DOMPurify from 'dompurify';

/**
 * Sanitiza HTML básico (placeholder - usar DOMPurify em produção!)
 */
export const sanitizeHTML = (dirty: string): string => {
  // ⚠️ TEMPORÁRIO: Esta é uma implementação básica
  // Em produção, USE DOMPurify!
  
  return dirty
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  // ✅ PRODUÇÃO (após instalar DOMPurify):
  // return DOMPurify.sanitize(dirty, {
  //   ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'div'],
  //   ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  // });
};

/**
 * Sanitiza CSS dinâmico
 */
export const sanitizeCSS = (css: string): string => {
  // Remove expressões JavaScript potencialmente perigosas do CSS
  return css
    .replace(/javascript:/gi, '')
    .replace(/expression\(/gi, '')
    .replace(/<script/gi, '')
    .replace(/on\w+=/gi, '');
};

/**
 * Valida se uma string contém apenas CSS seguro
 */
export const isValidCSS = (css: string): boolean => {
  const dangerousPatterns = [
    /javascript:/i,
    /expression\(/i,
    /<script/i,
    /on\w+=/i,
    /url\([^)]*javascript:/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(css));
};

/**
 * Sanitiza atributos de estilo inline
 */
export const sanitizeInlineStyle = (style: string): string => {
  if (!isValidCSS(style)) {
    return '';
  }
  return sanitizeCSS(style);
};

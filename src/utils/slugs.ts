import { logger } from './/logger-unified';

// Utilitários para trabalhar com slugs seguros

/**
 * Remove acentos de uma string para comparação mais flexível
 * @param str - String com acentos
 * @returns String sem acentos
 */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Converte um texto em slug seguro para URLs preservando acentos e cedilha
 * @param text - Texto a ser convertido
 * @returns Slug seguro
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // Substitui espaços e underscores por hífens
    .replace(/[^\w\sáàâãäéèêëíìîïóòôõöúùûüçñ-]/g, '') // Remove caracteres especiais mas preserva acentos e cedilha
    .replace(/[\s-]+/g, '-') // Substitui múltiplos espaços/hífens por um hífen
    .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim
}

/**
 * Converte slug de volta para texto legível preservando acentos
 * @param slug - Slug a ser convertido
 * @returns Texto formatado
 */
export function slugToText(slug: string): string {
  return slug
    .split('-')
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .filter(word => word.length > 0) // Remove palavras vazias
    .join(' ');
}

/**
 * Gera um slug único combinando nome e ID codificado
 * @param name - Nome do item
 * @param id - ID completo do item
 * @returns Slug único
 */
export function createUniqueSlug(name: string, id: string): string {
  const nameSlug = createSlug(name);
  // Codificar o ID em base64 para ofuscar mas manter recuperável
  const encodedId = btoa(id).replace(/[+/=]/g, '').slice(0, 12);
  return `${nameSlug}-${encodedId}`;
}

/**
 * Extrai o ID de um slug único
 * @param uniqueSlug - Slug único gerado por createUniqueSlug
 * @returns ID completo extraído ou null se não encontrado
 */
export function extractIdFromSlug(uniqueSlug: string): string | null {
  const parts = uniqueSlug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Verifica se a última parte parece um ID codificado (12 caracteres)
  if (lastPart && lastPart.length === 12 && /^[a-zA-Z0-9]+$/.test(lastPart)) {
    try {
      // Tentar decodificar o ID
      const paddedId = lastPart + '=='; // Adicionar padding se necessário
      const decodedId = atob(paddedId);
      
      // Verificar se parece um UUID válido
      if (decodedId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return decodedId;
      }
    } catch (error) {
      logger.warn('Erro ao decodificar ID do slug:', error);
    }
  }
  
  return null;
}

/**
 * Mapas de slugs para categorias comuns (para melhor SEO)
 */
export const CATEGORY_SLUG_MAP: Record<string, string> = {
  'vestidos': 'vestidos-femininos',
  'calcas': 'calcas-femininas',
  'blusas': 'blusas-femininas',
  'saias': 'saias-femininas',
  'shorts': 'shorts-femininos',
  'jeans': 'jeans-feminino',
  'acessorios': 'acessorios-femininos',
  'calcados': 'calcados-femininos',
  'bolsas': 'bolsas-femininas',
  'cosmeticos': 'cosmeticos-beleza'
};

/**
 * Mapas reversos para buscar por slug
 */
export const SLUG_TO_CATEGORY_MAP = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_MAP).map(([key, value]) => [value, key])
);

import React from 'react';
import { Link } from 'react-router-dom';
import { createSlug } from '@/utils/slugs';

interface SafeLinkProps {
  to: 'product' | 'category';
  id: string;
  name: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Componente para criar links seguros usando slugs em vez de IDs
 */
export const SafeLink: React.FC<SafeLinkProps> = ({ 
  to, 
  id, 
  name, 
  children, 
  className,
  onClick 
}) => {
  const getPath = () => {
    switch (to) {
      case 'product':
        return `/produto/${createSlug(name)}`;
      case 'category':
        return `/categoria/${createSlug(name)}`;
      default:
        return '/';
    }
  };

  return (
    <Link 
      to={getPath()} 
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

/**
 * Hook para gerar URLs seguras
 */
export const useSafeUrl = () => {
  const generateProductUrl = (name: string) => {
    return `/produto/${createSlug(name)}`;
  };

  const generateCategoryUrl = (name: string) => {
    return `/categoria/${createSlug(name)}`;
  };

  return {
    generateProductUrl,
    generateCategoryUrl
  };
};

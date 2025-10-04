import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { debounce } from '@/utils/performance';
import { createSlug } from '@/utils/slugs';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ 
  placeholder = "Buscar produtos...", 
  className = "",
  onSearch 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Debounce da busca para evitar muitas requisições
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        
        // Sanitizar e validar query
        const sanitizedQuery = searchQuery
          .trim()
          .slice(0, 100) // Limitar tamanho
          .replace(/[<>]/g, ''); // Remove caracteres perigosos
        
        if (onSearch) {
          onSearch(sanitizedQuery);
        } else {
          // Navegar para página de busca
          const slug = createSlug(sanitizedQuery);
          navigate(`/busca?q=${encodeURIComponent(sanitizedQuery)}`);
        }
        
        setTimeout(() => setIsSearching(false), 500);
      }
    }, 300),
    [onSearch, navigate]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      debouncedSearch(query);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsSearching(false);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search 
          className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
            isSearching ? 'text-[#58090d] animate-pulse' : 'text-gray-400'
          }`} 
        />
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          maxLength={100}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-10 text-sm transition-colors focus:border-[#58090d] focus:outline-none focus:ring-2 focus:ring-[#58090d]/20"
          aria-label="Campo de busca"
          autoComplete="off"
        />
        
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Indicador de busca ativa */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-md bg-white border border-gray-200 shadow-sm p-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-[#58090d] border-t-transparent rounded-full animate-spin"></div>
            Buscando...
          </div>
        </div>
      )}
    </form>
  );
}

export default SearchBar;

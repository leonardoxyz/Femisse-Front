import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';

export interface FilterState {
  categories: string[];
  colors: string[];
  sizes: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image: string;
  images?: string[];
  badge?: string;
  badge_variant?: string;
  sizes?: string[];
  colors?: string[];
  in_stock?: boolean | number | string; // Pode vir em diferentes formatos do backend
  stock?: number; // Campo alternativo para estoque
  categoria_id?: string;
}

// Helper function para verificar se produto está em estoque
const isProductInStock = (product: Product, showOutOfStock: boolean = false): boolean => {
  // Se showOutOfStock for true, mostrar todos os produtos
  if (showOutOfStock) {
    return true;
  }
  
  // Verificar campo in_stock primeiro
  if (product.in_stock !== undefined) {
    const inStock = product.in_stock;
    return inStock === true || 
           inStock === 1 || 
           inStock === '1' || 
           inStock === 'true' ||
           String(inStock).toLowerCase() === 'true';
  }
  
  // Se não tem in_stock, verificar campo stock
  if (product.stock !== undefined) {
    return product.stock > 0;
  }
  
  // Se não tem nenhum campo de estoque, assumir que está em estoque
  return true;
};

export function useProductFilters() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: { min: 0, max: 10000 },
  });

  // Buscar todos os produtos
  const fetchProducts = async (categoryId?: string, search?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = API_ENDPOINTS.products;
      const params = new URLSearchParams();
      
      if (categoryId) {
        params.append('categoria_id', categoryId);
      }
      
      if (search) {
        params.append('search', search);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }
      
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros aos produtos
  const applyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    let filtered = [...products];

    // Filtrar apenas produtos em estoque
    const showOutOfStock = false; // Produção: não mostrar produtos sem estoque
    filtered = filtered.filter(product => {
      const inStock = isProductInStock(product, showOutOfStock);
      return inStock;
    });

    // Filtrar por categorias
    if (newFilters.categories.length > 0) {
      filtered = filtered.filter(product => 
        newFilters.categories.includes(product.categoria_id || '')
      );
    }

    // Filtrar por cores
    if (newFilters.colors.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.colors || product.colors.length === 0) return false;
        return product.colors.some(color => 
          newFilters.colors.includes(color.toLowerCase())
        );
      });
    }

    // Filtrar por tamanhos
    if (newFilters.sizes.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.sizes || product.sizes.length === 0) return false;
        return product.sizes.some(size => 
          newFilters.sizes.includes(size)
        );
      });
    }

    // Filtrar por preço (apenas se foi especificamente definido)
    if (newFilters.priceRange.min > 0 || newFilters.priceRange.max < 10000) {
      filtered = filtered.filter(product => {
        const price = product.price;
        return price >= newFilters.priceRange.min && price <= newFilters.priceRange.max;
      });
    }

    setFilteredProducts(filtered);
  };

  // Limpar todos os filtros
  const clearFilters = () => {
    const clearedFilters: FilterState = {
      categories: [],
      colors: [],
      sizes: [],
      priceRange: { min: 0, max: 10000 },
    };
    setFilters(clearedFilters);
    // Mostrar todos os produtos em estoque quando limpar filtros
    setFilteredProducts(products.filter(product => isProductInStock(product, true)));
  };

  // Obter estatísticas dos filtros
  const getFilterStats = () => {
    const stats = {
      totalProducts: products.length,
      filteredProducts: filteredProducts.length,
      categories: {} as Record<string, number>,
      colors: {} as Record<string, number>,
      sizes: {} as Record<string, number>,
      priceRange: { min: 0, max: 0 },
    };

    // Calcular estatísticas
    products.forEach(product => {
      // Categorias
      if (product.categoria_id) {
        stats.categories[product.categoria_id] = (stats.categories[product.categoria_id] || 0) + 1;
      }

      // Cores
      if (product.colors) {
        product.colors.forEach(color => {
          const colorKey = color.toLowerCase();
          stats.colors[colorKey] = (stats.colors[colorKey] || 0) + 1;
        });
      }

      // Tamanhos
      if (product.sizes) {
        product.sizes.forEach(size => {
          stats.sizes[size] = (stats.sizes[size] || 0) + 1;
        });
      }

      // Preço
      if (stats.priceRange.min === 0 || product.price < stats.priceRange.min) {
        stats.priceRange.min = product.price;
      }
      if (product.price > stats.priceRange.max) {
        stats.priceRange.max = product.price;
      }
    });

    return stats;
  };

  return {
    products,
    filteredProducts,
    loading,
    error,
    filters,
    fetchProducts,
    applyFilters,
    clearFilters,
    getFilterStats,
  };
}

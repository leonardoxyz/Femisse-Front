import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductFiltersEnhanced } from '@/components/ProductFiltersEnhanced';
import ProductCard from '@/components/ProductCard';
import { API_ENDPOINTS } from '@/config/api';
import { logger } from '@/utils/logger-unified';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  colors?: string[];
  sizes?: string[];
  category?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FilterState {
  categories: string[];
  colors: string[];
  sizes: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

const BestSellers = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: { min: 0, max: 10000 },
  });

  // Buscar produtos mais vendidos
  const fetchBestSellers = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.popular}?page=${page}&limit=12`);
      const data = await response.json();

      if (data.success) {
        setProducts(Array.isArray(data.data) ? data.data : []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (error) {
      logger.error('Erro ao buscar mais vendidos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchBestSellers(pagination.page);
  }, [pagination.page]);

  // Calcular estatísticas dos produtos para os filtros
  const productStats = useMemo(() => {
    if (!products.length) return undefined;

    const stats = {
      categories: {} as Record<string, number>,
      colors: {} as Record<string, number>,
      sizes: {} as Record<string, number>,
      priceRange: { min: Infinity, max: 0 },
    };

    products.forEach((product) => {
      // Categorias
      if (product.category) {
        stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
      }

      // Cores
      if (product.colors) {
        product.colors.forEach((color) => {
          stats.colors[color] = (stats.colors[color] || 0) + 1;
        });
      }

      // Tamanhos
      if (product.sizes) {
        product.sizes.forEach((size) => {
          stats.sizes[size] = (stats.sizes[size] || 0) + 1;
        });
      }

      // Preço
      if (product.price) {
        stats.priceRange.min = Math.min(stats.priceRange.min, product.price);
        stats.priceRange.max = Math.max(stats.priceRange.max, product.price);
      }
    });

    return stats;
  }, [products]);

  // Aplicar filtros aos produtos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtro de cor
      if (filters.colors.length > 0) {
        if (!product.colors || !product.colors.some(color => filters.colors.includes(color))) {
          return false;
        }
      }

      // Filtro de tamanho
      if (filters.sizes.length > 0) {
        if (!product.sizes || !product.sizes.some(size => filters.sizes.includes(size))) {
          return false;
        }
      }

      // Filtro de preço
      if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const { page, totalPages } = pagination;

    // Sempre mostrar primeira página
    pages.push(1);

    // Páginas do meio
    if (page > 3) pages.push('ellipsis-start');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('ellipsis-end');

    // Sempre mostrar última página
    if (totalPages > 1) pages.push(totalPages);

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && handlePageChange(page - 1)}
              className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {pages.map((pageNum, idx) => {
            if (pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end') {
              return (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => handlePageChange(pageNum as number)}
                  isActive={pageNum === page}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => page < totalPages && handlePageChange(page + 1)}
              className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-[1590px]">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-[#58090d] transition-colors text-sm"
            >
              Início
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium text-sm">Mais Vendidos</span>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filtros Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4">
              <ProductFiltersEnhanced
                onFiltersChange={setFilters}
                productStats={productStats}
              />
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1">
            {/* Header com controles */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">
                  Mais Vendidos
                </h1>
                <span className="text-muted-foreground">
                  ({filteredProducts.length} produtos)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Filtros Mobile */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <div className="p-4">
                      <h2 className="text-lg font-semibold mb-4">Filtros</h2>
                      <ProductFiltersEnhanced
                        onFiltersChange={setFilters}
                        productStats={productStats}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Conteúdo dos Produtos */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#58090d]" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhum produto encontrado com os filtros selecionados.
                </p>
                <button
                  onClick={() => setFilters({
                    categories: [],
                    colors: [],
                    sizes: [],
                    priceRange: { min: 0, max: 10000 },
                  })}
                  className="text-[#58090d] hover:underline mt-2"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="mx-auto max-w-[1400px]">
                  <div className="flex flex-wrap gap-6 justify-center lg:grid lg:grid-cols-3 lg:gap-8 lg:justify-items-start">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex-shrink-0"
                        style={{ width: "320px" }}
                      >
                        <ProductCard
                          id={product.id}
                          name={product.name}
                          price={product.price}
                          images={product.images || []}
                          stock={999}
                          image={product.images?.[0] || ''}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paginação */}
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BestSellers;

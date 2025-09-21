import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductFiltersEnhanced } from '@/components/ProductFiltersEnhanced';
import { useProductFilters, FilterState } from '@/hooks/useProductFilters';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoria');
  const searchQuery = searchParams.get('search');
  
  const {
    filteredProducts,
    loading,
    error,
    fetchProducts,
    applyFilters,
    getFilterStats,
  } = useProductFilters();

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = React.useState<'name' | 'price' | 'newest'>('newest');

  useEffect(() => {
    fetchProducts(categoryId || undefined, searchQuery || undefined);
  }, [categoryId, searchQuery]);

  const handleFiltersChange = (filters: FilterState) => {
    applyFilters(filters);
  };

  const filterStats = getFilterStats();

  const sortedProducts = React.useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      case 'newest':
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">Erro ao carregar produtos: {error}</p>
              <Button onClick={() => fetchProducts(categoryId || undefined, searchQuery || undefined)}>
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filtros Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4">
              <ProductFiltersEnhanced 
                onFiltersChange={handleFiltersChange}
                productStats={filterStats}
              />
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1">
            {/* Header com controles */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">
                  {categoryId ? `Categoria: ${categoryId}` : 'Todos os Produtos'}
                </h1>
                <span className="text-muted-foreground">
                  ({sortedProducts.length} produtos)
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
                        onFiltersChange={handleFiltersChange}
                        productStats={filterStats}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Ordenação */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="newest">Mais recentes</option>
                  <option value="name">Nome A-Z</option>
                  <option value="price">Menor preço</option>
                </select>

                {/* Modo de visualização */}
                <div className="flex border border-input rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Grid de Produtos */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou buscar por outros termos.
                </p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {sortedProducts.map((product) => (
                  <div key={product.id} className={viewMode === 'list' ? 'flex' : ''}>
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.original_price}
                      image={product.image}
                      images={product.images}
                      stock={product.stock}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

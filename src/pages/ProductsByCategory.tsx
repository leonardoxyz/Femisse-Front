import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { ProductFiltersEnhanced } from '@/components/ProductFiltersEnhanced';
import { useProductFilters, FilterState } from '@/hooks/useProductFilters';
import { Button } from '@/components/ui/button';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { API_ENDPOINTS } from '@/config/api';
import { extractIdFromSlug, slugToText, createSlug, removeAccents, SLUG_TO_CATEGORY_MAP } from '@/utils/slugs';

const ProductsByCategory = () => {
  const { slug } = useParams(); // Mudança: usar slug em vez de id
  const [categoryName, setCategoryName] = React.useState('');
  const [categoryId, setCategoryId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = React.useState<'name' | 'price' | 'newest'>('newest');

  const {
    filteredProducts,
    loading,
    error,
    fetchProducts,
    applyFilters,
    getFilterStats,
  } = useProductFilters();

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (!slug) return;
      
      try {
        // Buscar todas as categorias e encontrar a correspondente pelo nome
        const response = await fetch(`${API_ENDPOINTS.categories}`);
        
        if (response.ok) {
          const categories = await response.json();
          
          // Converter slug de volta para nome e procurar categoria correspondente
          const searchName = slugToText(slug).toLowerCase();
          const foundCategory = categories.find((category: any) => {
            const categoryName = category.name.toLowerCase();
            const categorySlug = createSlug(category.name);
            
            return (
              categoryName === searchName ||
              categoryName.includes(searchName) ||
              searchName.includes(categoryName) ||
              categorySlug === slug ||
              // Busca mais flexível removendo acentos para comparação
              removeAccents(categoryName) === removeAccents(searchName) ||
              removeAccents(categoryName).includes(removeAccents(searchName))
            );
          });
          
          if (foundCategory) {
            setCategoryName(foundCategory.name);
            setCategoryId(foundCategory.id);
            fetchProducts(foundCategory.id);
            return;
          }
        }
        
        // Fallback: usar nome formatado do slug
        const displayName = slugToText(slug);
        setCategoryName(displayName);
        
        // Tentar buscar produtos usando o slug como filtro
        fetchProducts(slug);
        
      } catch (error) {
        console.error('Erro ao buscar categoria:', error);
        // Fallback final
        setCategoryName(slugToText(slug));
        fetchProducts(slug);
      }
    };

    fetchCategoryAndProducts();
  }, [slug]);

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1">
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
                  <h1 className="text-2xl font-bold text-foreground">
                    {categoryName}
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

              {/* Conteúdo dos Produtos */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando produtos...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-red-500 mb-4">Erro ao carregar produtos: {error}</p>
                    <Button onClick={() => categoryId && fetchProducts(categoryId)}>
                      Tentar novamente
                    </Button>
                  </div>
                </div>
              ) : sortedProducts.length === 0 ? (
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
      <Footer />
    </div>
  );
};

export default ProductsByCategory;

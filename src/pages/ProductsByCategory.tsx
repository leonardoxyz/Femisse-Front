import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryPageBanner from '@/components/CategoryPageBanner';
import { ProductFiltersEnhanced } from '@/components/ProductFiltersEnhanced';
import { useProductFilters, FilterState } from '@/hooks/useProductFilters';
import { Button } from '@/components/ui/button';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { API_ENDPOINTS } from '@/config/api';
import { slugToText, createSlug, removeAccents } from '@/utils/slugs';
import ShowcaseProductCard from '@/components/cards/ShowcaseProductCard';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

const ProductsByCategory = () => {
  useScrollRestoration();

  const { slug } = useParams();
  const [categoryName, setCategoryName] = React.useState('');
  const [categoryId, setCategoryId] = React.useState<string | null>(null);
  const [categoryData, setCategoryData] = React.useState<any>(null);
  const [sortBy, setSortBy] = React.useState<'name' | 'price' | 'newest'>('newest');

  const {
    filteredProducts,
    loading,
    error,
    fetchProducts,
    applyFilters,
    getFilterStats,
  } = useProductFilters();

  // Effect para buscar categoria e produtos quando slug mudar
  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (!slug) {
        console.warn('Slug não fornecido');
        return;
      }

      try {
        console.log('🔍 Buscando categoria para slug:', slug);
        
        // Buscar todas as categorias
        const response = await fetch(`${API_ENDPOINTS.categories}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar categorias');
        }

        const result = await response.json();
        const categories = result.data || result;

        if (!Array.isArray(categories)) {
          throw new Error('Formato de resposta inválido');
        }

        console.log('📦 Categorias disponíveis:', categories.map(c => ({ name: c.name, id: c.id })));

        // Buscar categoria correspondente ao slug
        const decodedSlug = decodeURIComponent(slug);
        const searchName = slugToText(decodedSlug).toLowerCase();
        
        console.log('🔍 Buscando categoria:', { 
          slugOriginal: slug, 
          decodedSlug, 
          searchName 
        });
        
        const foundCategory = categories.find((category: any) => {
          const categoryName = category.name.toLowerCase();
          const categorySlug = createSlug(category.name);
          const categorySlugDecoded = createSlug(decodedSlug);

          const match = (
            categorySlug === slug ||
            categorySlug === decodedSlug ||
            categorySlug === categorySlugDecoded ||
            removeAccents(categoryName) === removeAccents(searchName) ||
            categoryName === searchName ||
            categoryName === decodedSlug.toLowerCase()
          );
          
          if (match) {
            console.log('✅ Match encontrado:', { 
              categoryName: category.name, 
              categoryId: category.id,
              matchType: categorySlug === slug ? 'slug-exato' : 
                        categorySlug === decodedSlug ? 'slug-decodificado' :
                        'nome-comparacao'
            });
          }
          
          return match;
        });

        if (foundCategory) {
          console.log('✅ Categoria encontrada:', { name: foundCategory.name, id: foundCategory.id });
          
          // Atualizar estados
          setCategoryName(foundCategory.name);
          setCategoryId(foundCategory.id);
          setCategoryData(foundCategory);
          
          // Buscar produtos DESTA categoria específica
          console.log('🔍 Buscando produtos da categoria:', foundCategory.id);
          await fetchProducts(foundCategory.id);
        } else {
          console.warn('⚠️ Categoria não encontrada para slug:', slug);
          setCategoryName(slugToText(slug));
          setCategoryId(null);
          setCategoryData(null);
          await fetchProducts();
        }

      } catch (error) {
        console.error('❌ Erro ao buscar categoria:', error);
        setCategoryName(slugToText(slug));
        setCategoryId(null);
        setCategoryData(null);
        await fetchProducts();
      }
    };

    fetchCategoryAndProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]); // ✅ Apenas slug - fetchProducts é estável via useCallback

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

      {/* Banner da Categoria */}
      <CategoryPageBanner category={categoryData} />

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
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros ou buscar por outros termos.
                  </p>
                </div>
              ) : (
                <div className="mx-auto max-w-[1400px]">
                  <div className="
  flex flex-wrap gap-6 justify-center
  lg:grid lg:grid-cols-3 lg:gap-8 lg:justify-items-start
">
                    {sortedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex-shrink-0"
                        style={{ width: "320px" }}
                      >
                        <ShowcaseProductCard
                          product={product}
                          className="h-full"
                          showAddToCartButton
                        />
                      </div>
                    ))}
                  </div>
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

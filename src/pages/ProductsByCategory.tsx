import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CategoryPageBanner from '@/components/CategoryPageBanner';
import { ProductFiltersEnhanced } from '@/components/ProductFiltersEnhanced';
import { useProductFilters, FilterState } from '@/hooks/useProductFilters';
import { Button } from '@/components/ui/button';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { API_ENDPOINTS } from '@/config/api';
import { slugToText, createSlug, removeAccents } from '@/utils/slugs';

const ProductsByCategory = () => {
  const { slug } = useParams(); // Mudança: usar slug em vez de id
  const navigate = useNavigate();
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
            setCategoryData(foundCategory);
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
                  <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros ou buscar por outros termos.
                  </p>
                </div>
              ) : (
                /* Grid de Produtos - Idêntico ao NewInSection */
                <div className="w-full">
                  {/* Container responsivo baseado no NewInSection */}
                  <div className="mx-auto max-w-[1400px]">
                    <div className="flex gap-6 lg:gap-8">
                      {sortedProducts.map((product) => (
                        <div key={product.id} className="flex-shrink-0" style={{ width: '320px' }}>
                          <div>
                            <div className="imgs relative overflow-hidden bg-primary group" style={{ paddingTop: '150%' }}>
                              <a
                                href={`/produto/${createSlug(product.name)}`}
                                className="absolute inset-0 block"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/produto/${createSlug(product.name)}`);
                                }}
                                aria-label={product.name}
                              >
                                <div className="loading absolute inset-0 bg-gray-100"></div>

                                <img
                                  src={product.images?.[0] || product.image}
                                  alt={product.name}
                                  title={product.name}
                                  className="lazy-img-fadein primary absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                                  style={{ height: '100%' }}
                                />

                                {(product.images?.[1] || product.images?.[0]) && (
                                  <img
                                    src={product.images?.[1] || product.images?.[0]}
                                    alt={product.name}
                                    title={product.name}
                                    className="lazy-img-fadein hover absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ height: '100%' }}
                                  />
                                )}
                              </a>

                              <button
                                className="w-5/6 absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate(`/produto/${createSlug(product.name)}`);
                                }}
                              >
                                COMPRAR
                              </button>
                            </div>

                            <div className="product-info-wrapper mt-4 text-center">
                              <h3 className="h3 mb-2">
                                <a
                                  href={`/produto/${createSlug(product.name)}`}
                                  className="name text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors line-clamp-2 uppercase"
                                  title={product.name}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/produto/${createSlug(product.name)}`);
                                  }}
                                >
                                  {product.name}
                                </a>
                              </h3>

                              <div className="price-box mb-3">
                                <div className="prices">
                                  <span className="price primary-price text-lg font-bold text-gray-900">
                                    R$ {product.price?.toFixed(2).replace('.', ',')}
                                  </span>
                                  {product.original_price && product.original_price > product.price && (
                                    <span className="price text-sm text-gray-500 line-through ml-2">
                                      R$ {product.original_price.toFixed(2).replace('.', ',')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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

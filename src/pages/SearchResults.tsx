import React from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShowcaseProductCard from "@/components/cards/ShowcaseProductCard";
import { API_ENDPOINTS } from "@/config/api";
import { ProductFiltersEnhanced } from "@/components/ProductFiltersEnhanced";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Filter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Types to support filtering similar to BestSellers
interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  colors?: string[];
  sizes?: string[];
  category?: string;
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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const query = useQuery();
  const search = query.get("q") || "";
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<FilterState>({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: { min: 0, max: 10000 },
  });

  React.useEffect(() => {
    setLoading(true);
    fetch(`${API_ENDPOINTS.products}?search=${encodeURIComponent(search)}`)
      .then(res => res.json())
      .then(payload => {
        const data = Array.isArray(payload?.data) ? payload.data : payload;
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  // Compute stats for filters (colors, sizes, categories, price)
  const productStats = React.useMemo(() => {
    if (!products.length) return undefined;

    const stats = {
      categories: {} as Record<string, number>,
      colors: {} as Record<string, number>,
      sizes: {} as Record<string, number>,
      priceRange: { min: Infinity, max: 0 },
    };

    products.forEach((product) => {
      if (product.category) {
        stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
      }

      if (product.colors) {
        product.colors.forEach((color) => {
          if (color) stats.colors[color] = (stats.colors[color] || 0) + 1;
        });
      }

      if (product.sizes) {
        product.sizes.forEach((size) => {
          if (size) stats.sizes[size] = (stats.sizes[size] || 0) + 1;
        });
      }

      if (typeof product.price === 'number') {
        stats.priceRange.min = Math.min(stats.priceRange.min, product.price);
        stats.priceRange.max = Math.max(stats.priceRange.max, product.price);
      }
    });

    return stats;
  }, [products]);

  // Apply filters to products
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      if (filters.colors.length > 0) {
        if (!product.colors || !product.colors.some(c => filters.colors.includes(c))) return false;
      }
      if (filters.sizes.length > 0) {
        if (!product.sizes || !product.sizes.some(s => filters.sizes.includes(s))) return false;
      }
      if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) return false;
      return true;
    });
  }, [products, filters]);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-[1590px]">
            <div className="flex gap-8">
              {/* Filtros Sidebar */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-4">
                  <ProductFiltersEnhanced onFiltersChange={setFilters} productStats={productStats} />
                </div>
              </div>

              {/* Conteúdo Principal */}
              <div className="flex-1 px-4">
                {/* Header com controles */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-foreground">Resultados para: "{search}"</h1>
                    <span className="text-muted-foreground">({filteredProducts.length} produtos)</span>
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
                          <ProductFiltersEnhanced onFiltersChange={setFilters} productStats={productStats} />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Carregando produtos...</p>
                    </div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tente ajustar os filtros ou buscar por outros termos.</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="grid [grid-template-columns:repeat(auto-fit,minmax(260px,320px))] justify-center lg:justify-start gap-4 md:gap-6">
                      {filteredProducts.map(product => (
                        <ShowcaseProductCard
                          key={product.id}
                          product={product}
                          className="h-full w-full max-w-[320px]"
                          showAddToCartButton
                        />
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
    </>
  );
};

export default SearchResults;

import React from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { API_ENDPOINTS } from "@/config/api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const query = useQuery();
  const search = query.get("q") || "";
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold mb-6 text-foreground">Resultados para: "{search}"</h1>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-muted-foreground">Nenhum produto encontrado.</div>
          ) : (
            <div className="mx-auto max-w-[1400px]">
              <div
                className="flex flex-wrap gap-6 justify-center sm:justify-start"
              >
                {products.map(product => (
                  <div
                    key={product.id}
                    className="flex-shrink-0"
                    style={{ width: "320px" }}
                  >
                    <ProductCard
                      {...product}
                      originalPrice={product.original_price}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;

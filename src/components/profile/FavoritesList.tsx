import React from "react";
import ProductCard from "@/components/ProductCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { API_ENDPOINTS } from "@/config/api";

export default function FavoritesList() {
  const { favoriteIds, loading } = useFavorites();
  const [products, setProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (favoriteIds.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`${API_ENDPOINTS.products}?ids=${favoriteIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, [favoriteIds]);


  if (loading) {
    return <div className="p-8">Carregando favoritos...</div>;
  }

  if (products.length === 0) {
    return <div className="p-8">Nenhum produto favoritado.</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          originalPrice={product.original_price}
          onFavoriteChange={(productId: string, isNowFavorite: boolean) => {
            if (!isNowFavorite) {
              setProducts((prev) => prev.filter((p) => p.id !== productId));
            }
          }}
        />
      ))}
    </div>
  );
}
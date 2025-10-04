import React from "react";
import ProductCard from "@/components/ProductCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { API_ENDPOINTS } from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";
import ShowcaseProductCard from "../cards/ShowcaseProductCard";

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
    return (
      <div className="space-y-6 p-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex flex-col gap-4 rounded-xl border border-[#58090d]/20 bg-[#58090d]/5 p-4"
            >
              <Skeleton className="h-48 w-full rounded-md bg-[#58090d]/20" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 bg-[#58090d]/30" />
                <Skeleton className="h-4 w-1/2 bg-[#58090d]/20" />
              </div>
              <Skeleton className="h-10 w-full rounded-sm bg-[#58090d]/30" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return <div className="p-8">Nenhum produto favoritado.</div>;
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const normalizedProduct = {
          ...product,
          originalPrice: product.original_price ?? product.originalPrice ?? null,
        };

        return (
          <ShowcaseProductCard
            key={product.id}
            product={normalizedProduct}
            className="h-full"
          />
        );
      })}
    </div>
  );
}
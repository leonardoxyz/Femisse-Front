import React from "react";
import ProductShowcase from "./ProductShowcase";
import { API_ENDPOINTS } from "@/config/api";

const ProductShowcaseSection = () => {
  const [momentProducts, setMomentProducts] = React.useState<{ id: number; image_url: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(API_ENDPOINTS.momentProducts)
      .then(res => res.json())
      .then(data => {
        setMomentProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="text-center py-12">Carregando produtos...</div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start lg:gap-16 space-y-16 lg:space-y-0">
            {momentProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in flex justify-center"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <ProductShowcase image={product.image_url} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductShowcaseSection;
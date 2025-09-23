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
    <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="text-center py-8 md:py-12">Carregando produtos...</div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start gap-12 md:gap-8">
            {momentProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in flex justify-center w-full lg:w-auto"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-full max-w-sm md:max-w-md lg:max-w-none">
                  <ProductShowcase image={product.image_url} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductShowcaseSection;
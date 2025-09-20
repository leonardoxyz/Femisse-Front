import React from "react";
import ProductShowcase from "./ProductShowcase";

const API_URL = "http://localhost:4000/api/moment-products";

const ProductShowcaseSection = () => {
  const [momentProducts, setMomentProducts] = React.useState<{ id: number; image_url: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(API_URL)
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
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in flex items-center justify-center">
          SENSAÇÃO DO MOMENTO
        </h2>
        {loading ? (
          <div className="text-center py-12">Carregando produtos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-16 w-full">
            {momentProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in w-full max-w-3xl min-h-[600px] mx-auto flex"
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
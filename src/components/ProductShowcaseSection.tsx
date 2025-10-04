import React from "react";
import ProductShowcase from "./ProductShowcase";
import { API_ENDPOINTS } from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";

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
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-center">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-[#58090d]/20 bg-[#58090d]/5 p-4 md:max-w-md lg:max-w-none"
              >
                <Skeleton className="h-[420px] w-full rounded-2xl bg-[#58090d]/15" />
                <div className="space-y-3 px-2 pb-2">
                  <Skeleton className="h-4 w-1/2 bg-[#58090d]/30" />
                  <Skeleton className="h-3 w-2/3 bg-[#58090d]/20" />
                </div>
              </div>
            ))}
          </div>
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
import React from "react";
import ProductShowcase from "./ProductShowcase";
import { API_ENDPOINTS } from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";

type MomentProduct = {
  id?: number;
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  highlight?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  linkUrl?: string | null;
  link_url?: string | null;
  ctaLabel?: string | null;
  cta_label?: string | null;
  position?: number | null;
};

const ProductShowcaseSection = () => {
  const [momentProducts, setMomentProducts] = React.useState<MomentProduct[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(API_ENDPOINTS.momentProducts)
      .then(res => res.json())
      .then((payload) => {
        const data = Array.isArray(payload?.data) ? payload.data : payload;
        setMomentProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const showcaseItems = React.useMemo(() => momentProducts.slice(0, 3), [momentProducts]);

  return (
    <section className="">
      <div className="container mx-auto max-w-[1590px] px-4 py-12">
        <div className="flex items-center justify-center mb-4 md:mb-6 gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#58090d]"></div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center font-display tracking-wide">
            NOVA COLEÇÃO
          </h2>
          <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[#58090d]"></div>
        </div>

        <p className="text-center text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-10">
          Seleção especial de looks que estão roubando a cena nesta temporada.
        </p>

        {loading ? (
          <div className="grid w-full max-w-[1590px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mx-auto">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex h-full flex-col gap-4 rounded-xl border border-[#58090d]/20 bg-[#58090d]/5 p-4"
              >
                <Skeleton className="h-[440px] w-full rounded-lg bg-[#58090d]/15" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-[#58090d]/30" />
                  <Skeleton className="h-3 w-2/4 bg-[#58090d]/20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid w-full max-w-[1590px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mx-auto">
            {showcaseItems.map((product, index) => (
              <div
                key={product.id ?? product.title ?? index}
                className="animate-fade-in h-full"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <ProductShowcase image={product.imageUrl ?? product.image_url ?? ''} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductShowcaseSection;
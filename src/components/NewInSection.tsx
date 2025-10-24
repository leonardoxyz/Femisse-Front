import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import ShowcaseProductCard from "@/components/cards/ShowcaseProductCard";
import { API_ENDPOINTS } from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";

import "swiper/css";
import "swiper/css/navigation";
import { logger } from '../utils/logger-unified';

const NewInSection = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const computeCardDimensions = useCallback(() => {
    if (typeof window !== "undefined") {
      const width = Math.min(window.innerWidth, 1590);

      if (width < 640) {
        return {
          slidesPerView: 1,
          slideWidth: Math.min(350, width - 100),
          slideMargin: 16,
        };
      }

      if (width < 1024) {
        return {
          slidesPerView: 2,
          slideWidth: Math.min(300, (width - 140) / 2),
          slideMargin: 20,
        };
      }

      if (width < 1400) {
        return {
          slidesPerView: 3,
          slideWidth: Math.min(380, (width - 180) / 3),
          slideMargin: 24,
        };
      }

      return {
        slidesPerView: 4,
        slideWidth: Math.min(350, (width - 240) / 4),
        slideMargin: 24,
      };
    }

    return {
      slidesPerView: 4,
      slideWidth: 350,
      slideMargin: 24,
    };
  }, []);

  const [cardDimensions, setCardDimensions] = useState(() => computeCardDimensions());
  const { slidesPerView, slideWidth, slideMargin } = cardDimensions;

  useEffect(() => {
    fetch(API_ENDPOINTS.products)
      .then((res) => res.json())
      .then((payload) => {
        const data = Array.isArray(payload?.data) ? payload.data : payload;
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        logger.error("Erro ao buscar produtos:", err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setCardDimensions(computeCardDimensions());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [computeCardDimensions]);

  const paddingClass = useMemo(() => {
    if (slidesPerView === 1) return "px-6";
    if (slidesPerView === 2) return "px-8";
    if (slidesPerView === 3) return "px-10";
    return "px-12";
  }, [slidesPerView]);

  const showNavigation = products.length > slidesPerView;

  return (
    <section className="pb-12 bg-background">
      <div className="container mx-auto max-w-[1590px]">
        <div className="flex items-center justify-center mb-16 gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#58090d]"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-center font-display">
            NOVIDADES
          </h2>
          <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[#58090d]"></div>
        </div>

        {loading ? (
          <div className={`relative ${paddingClass}`}>
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex w-full flex-col gap-4 rounded-xl border border-[#58090d]/20 bg-[#58090d]/5 p-4"
                  style={{ maxWidth: `${slideWidth}px` }}
                >
                  <Skeleton className="h-[320px] w-full rounded-lg bg-[#58090d]/15" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-[#58090d]/30" />
                    <Skeleton className="h-3 w-2/4 bg-[#58090d]/20" />
                  </div>
                  <div className="mt-auto flex flex-col gap-2">
                    <Skeleton className="h-4 w-1/3 bg-[#58090d]/20" />
                    <Skeleton className="h-10 w-full bg-[#58090d]/30" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="shelf-wrapper relative">
            <div className={`relative ${paddingClass}`}>
              <Swiper
                modules={[Navigation]}
                navigation={{
                  prevEl: ".new-in-prev",
                  nextEl: ".new-in-next",
                }}
                loop={showNavigation}
                slidesPerView="auto"
                spaceBetween={slideMargin}
                grabCursor
              >
                {products.map((product) => (
                  <SwiperSlide
                    key={product.id}
                    className="!h-auto"
                    style={{ width: `${slideWidth}px` }}
                  >
                    <ShowcaseProductCard
                      product={product}
                      className="h-full"
                      showAddToCartButton
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {showNavigation && (
                <>
                  <button
                    className="new-in-prev absolute -left-1 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-primary shadow-lg flex items-center justify-center cursor-pointer z-30 transition-all duration-300 hover:opacity-90"
                    type="button"
                    aria-label="Anterior"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="text-white">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <button
                    className="new-in-next absolute -right-1 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-primary shadow-lg flex items-center justify-center cursor-pointer z-30 transition-all duration-300 hover:opacity-90"
                    type="button"
                    aria-label="Próximo"
                  >
                    <span className="sr-only">Próximo</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="text-white">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewInSection;
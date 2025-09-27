import React, { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/config/api";
import ShowcaseProductCard from "@/components/cards/ShowcaseProductCard";

const NewInSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(API_ENDPOINTS.products)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setProducts([]);
        setLoading(false);
        console.error("Erro ao buscar produtos:", err);
      });
  }, []);

  // Configuração responsiva dos cards
  const getCardDimensions = () => {
    if (typeof window !== 'undefined') {
      const width = Math.min(window.innerWidth, 1590); // Limita à largura máxima do container
      
      // Mobile (até 640px) - 1 card
      if (width < 640) {
        return {
          slidesPerView: 1,
          slideWidth: Math.min(350, width - 100), // Mais espaço para o card
          slideMargin: 16
        };
      }
      
      // Tablet (640px - 1024px) - 2 cards
      if (width < 1024) {
        return {
          slidesPerView: 2,
          slideWidth: Math.min(300, (width - 140) / 2), // Ajustado para 2 cards
          slideMargin: 20
        };
      }
      
      // Desktop pequeno (1024px - 1400px) - 3 cards
      if (width < 1400) {
        return {
          slidesPerView: 3,
          slideWidth: Math.min(380, (width - 180) / 3), // 3 cards bem distribuídos
          slideMargin: 24
        };
      }
      
      // Desktop grande (1400px+) - 4 cards (aproveitando max-w-[1590px])
      return {
        slidesPerView: 4,
        slideWidth: Math.min(350, (width - 240) / 4), // 4 cards otimizados para 1590px
        slideMargin: 24
      };
    }
    
    // Fallback para SSR - Desktop grande
    return {
      slidesPerView: 4,
      slideWidth: 350,
      slideMargin: 24
    };
  };

  const [cardDimensions, setCardDimensions] = useState(getCardDimensions());
  const { slidesPerView, slideWidth, slideMargin } = cardDimensions;
  const totalSlideWidth = slideWidth + slideMargin;

  // Atualiza dimensões no resize
  useEffect(() => {
    const handleResize = () => {
      setCardDimensions(getCardDimensions());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    if (currentIndex < products.length - slidesPerView) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop infinito
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(products.length - slidesPerView); // Loop infinito
    }
  };

  const translateX = -currentIndex * totalSlideWidth;

  return (
    <section className="pb-12 bg-background">
      <div className="container mx-auto max-w-[1590px]">
        <div className="flex items-center justify-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center font-display">
            NOVIDADES
          </h2>
        </div>
        {loading ? (
          <div className="text-center py-12">Carregando produtos...</div>
        ) : (
          <div className="shelf-wrapper relative">
            <div className={`relative ${slidesPerView === 1 ? 'px-6' : slidesPerView === 2 ? 'px-8' : slidesPerView === 3 ? 'px-10' : 'px-12'}`}>
              <button
                className="splide__arrow splide__arrow--prev absolute -left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary shadow-lg flex items-center justify-center cursor-pointer z-30 transition-all duration-300 border border-gray-200"
                type="button"
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="text-white">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                className="splide__arrow splide__arrow--next absolute -right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary shadow-lg flex items-center justify-center cursor-pointer z-30 transition-all duration-300 border border-gray-200"
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="text-white">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Track dos produtos */}
              <div className="splide__track overflow-hidden">
                <ul
                  className="splide__list flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(${translateX}px)` }}
                >
                  {products.map((product) => (
                    <li
                      key={product.id}
                      className="splide__slide w33 flex-shrink-0"
                      style={{
                        marginRight: `${slideMargin}px`,
                        width: `${slideWidth}px`
                      }}
                    >
                      <ShowcaseProductCard
                        product={product}
                        className="h-full"
                        showAddToCartButton
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewInSection;
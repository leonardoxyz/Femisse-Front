import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { API_ENDPOINTS } from "@/config/api";
import { useNavigate } from "react-router-dom";
import { createSlug } from "@/utils/slugs";

const NewInSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

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
                  {products.map((product, index) => (
                    <li
                      key={product.id}
                      className="splide__slide w33 flex-shrink-0"
                      style={{
                        marginRight: `${slideMargin}px`,
                        width: `${slideWidth}px`
                      }}
                    >
                      <div>
                        <div className="imgs relative overflow-hidden bg-primary group" style={{ paddingTop: '150%' }}>
                          <a
                            href={`/produto/${createSlug(product.name)}`}
                            className="absolute inset-0 block"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/produto/${createSlug(product.name)}`);
                            }}
                            aria-label={product.name}
                          >
                            <div className="loading absolute inset-0 bg-gray-100"></div>

                            <img
                              src={product.images?.[0] || product.image}
                              alt={product.name}
                              title={product.name}
                              className="lazy-img-fadein primary absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                              style={{ height: '100%' }}
                            />

                            {(product.images?.[1] || product.images?.[0]) && (
                              <img
                                src={product.images?.[1] || product.images?.[0]}
                                alt={product.name}
                                title={product.name}
                                className="lazy-img-fadein hover absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ height: '100%' }}
                              />
                            )}
                          </a>

                          <button
                            className="w-5/6 absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(`/produto/${createSlug(product.name)}`);
                            }}
                          >
                            COMPRAR
                          </button>
                        </div>

                        <div className="product-info-wrapper mt-4 text-center">
                          <h3 className="h3 mb-2">
                            <a
                              href={`/produto/${createSlug(product.name)}`}
                              className="name text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors line-clamp-2 uppercase"
                              title={product.name}
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/produto/${createSlug(product.name)}`);
                              }}
                            >
                              {product.name}
                            </a>
                          </h3>

                          <div className="price-box mb-3">
                            <div className="prices">
                              <span className="price primary-price text-lg font-bold text-gray-900">
                                R$ {product.price?.toFixed(2).replace('.', ',')}
                              </span>
                              {product.original_price && product.original_price > product.price && (
                                <span className="price text-sm text-gray-500 line-through ml-2">
                                  R$ {product.original_price.toFixed(2).replace('.', ',')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
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
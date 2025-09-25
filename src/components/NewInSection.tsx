import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { API_ENDPOINTS } from "@/config/api";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const NewInSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className="pb-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
            NOVIDADES
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
            Descubra as últimas novidades da nossa coleção. Peças exclusivas e tendências que você vai amar.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Carregando produtos...</div>
        ) : (
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              navigation={products.length > 4 ? {
                nextEl: '.swiper-button-next-products',
                prevEl: '.swiper-button-prev-products',
              } : false}
              pagination={{
                el: '.swiper-pagination-products',
                clickable: true,
                bulletClass: 'swiper-pagination-bullet-products',
                bulletActiveClass: 'swiper-pagination-bullet-active-products',
              }}
              autoplay={products.length > 4 ? {
                delay: 4000,
                disableOnInteraction: false,
              } : false}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 32,
                },
              }}
              className="products-swiper"
              style={{
                '--swiper-navigation-color': '#000',
                '--swiper-pagination-color': '#000',
              } as React.CSSProperties}
            >
              {products.map((product, index) => (
                <SwiperSlide key={product.id}>
                  <div
                    className="animate-fade-in h-full"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      stock={product.stock}
                      originalPrice={product.original_price}
                      images={product.images}
                      image={product.image}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navegação customizada - só aparece se houver mais de 4 produtos */}
            {products.length > 4 && (
              <>
                <div className="swiper-button-prev-products absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center cursor-pointer z-10 transition-all duration-300 hover:scale-110">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <div className="swiper-button-next-products absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center cursor-pointer z-10 transition-all duration-300 hover:scale-110">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </>
            )}

            {/* Indicadores customizados */}
            <div className="swiper-pagination-products flex justify-center mt-8 gap-2"></div>
          </div>
        )}
      </div>
      
      {/* Estilos customizados para o Swiper */}
      <style jsx global>{`
        .products-swiper .swiper-pagination-bullet-products {
          width: 8px;
          height: 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          opacity: 1;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 0 4px;
        }
        
        .products-swiper .swiper-pagination-bullet-active-products {
          background: rgba(0, 0, 0, 0.8);
          transform: scale(1.2);
        }
        
        .products-swiper .swiper-slide {
          height: auto;
          display: flex;
          align-items: stretch;
        }
        
        .products-swiper .swiper-slide > div {
          width: 100%;
        }
      `}</style>
    </section>
  );
};

export default NewInSection;
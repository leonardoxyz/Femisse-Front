import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { API_ENDPOINTS } from '@/config/api';
import { createSlug } from '@/utils/slugs';

import 'swiper/css';
import 'swiper/css/navigation';

const CategoryBanner = () => {
  const navigate = useNavigate();
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`${API_ENDPOINTS.popular}?page=1&limit=12`)
      .then(res => res.json())
      .then(payload => {
        const data = Array.isArray(payload?.data) ? payload.data : payload;
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleExploreAll = () => {
    navigate('/mais-vendidos');
  };

  // Função para obter imagem principal e de hover
  const getMainImage = (product: any) => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      const [firstImage] = product.images.filter(Boolean);
      if (firstImage) return firstImage;
    }
    return product.image ?? "";
  };

  const getHoverImage = (product: any) => {
    const mainImage = getMainImage(product);
    if (Array.isArray(product.images) && product.images.length > 1) {
      const [, ...rest] = product.images;
      const next = rest.find(Boolean);
      if (next) return next;
    }
    return mainImage;
  };

  if (loading) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-[1590px]">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#58090d]"></div>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 tracking-wide">
              MAIS VENDIDOS
            </h2>
            <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[#58090d]"></div>
          </div>
          <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Descubra as peças que estão conquistando o coração das nossas clientes
          </p>
        </div>

        {/* Products Carousel - Tamanho Original */}
        <div className="relative px-16">
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: '.category-banner-prev',
              nextEl: '.category-banner-next',
            }}
            loop={products.length > 3}
            slidesPerView={1}
            spaceBetween={16}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 32 },
            }}
            grabCursor
          >
            {products.map((product, index) => (
              <SwiperSlide key={product.id}>
                <div className="group animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
                  <a
                    href={`/produto/${createSlug(product.name)}`}
                    className="block relative overflow-hidden shadow-lg transition-all duration-500"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {/* Imagem Principal */}
                      <img
                        src={getMainImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-opacity duration-300 absolute inset-0"
                        loading="lazy"
                      />

                      {/* Imagem de Hover */}
                      {getHoverImage(product) && getHoverImage(product) !== getMainImage(product) && (
                        <img
                          src={getHoverImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0"
                          loading="lazy"
                        />
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60" />

                      {/* Floating Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                        <span className="text-xs font-semibold text-[#58090d] uppercase tracking-wide">
                          Popular
                        </span>
                      </div>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                      <h3 className="text-white font-display uppercase text-lg md:text-xl lg:text-2xl font-bold mb-2 leading-tight">
                        {product.name}
                      </h3>

                      {/* Action Indicator */}
                      <div className="flex items-center gap-2">
                        <span className="text-white/90 text-sm font-medium">
                          Ver produto
                        </span>
                      </div>
                    </div>

                  </a>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows */}
          {products.length > 3 && (
            <>
              <button
                className="category-banner-prev absolute -left-1 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-[#58090d] shadow-lg flex items-center justify-center cursor-pointer z-30 transition-all duration-300 hover:bg-[#6b0a10]"
                type="button"
                aria-label="Anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="text-white">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                className="category-banner-next absolute -right-1 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-[#58090d] shadow-lg flex items-center justify-center cursor-pointer z-30 transition-all duration-300 hover:bg-[#6b0a10]"
                type="button"
                aria-label="Próximo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="text-white">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <button
            onClick={handleExploreAll}
            className="inline-flex items-center gap-3 text-gray-600 hover:text-[#58090d] transition-colors duration-300 cursor-pointer group"
          >
            <span className="text-sm font-medium">Explore os mais vendidos</span>
            <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-[#58090d] group-hover:text-white transition-all duration-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoryBanner;
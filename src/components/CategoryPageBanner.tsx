import React from 'react';

interface CategoryPageBannerProps {
  category: {
    id: string;
    name: string;
    banner_image?: string;
    banner_mobile_image?: string;
    banner_title?: string;
  } | null;
}

const CategoryPageBanner: React.FC<CategoryPageBannerProps> = ({ category }) => {
  // Se não há categoria ou banner, não renderiza nada
  if (!category || !category.banner_image) {
    return null;
  }

  return (
    <section className="relative w-full mb-8 overflow-hidden">
      <div className="relative w-full mx-auto" style={{ maxWidth: '1920px', height: '700px' }}>
        {/* Banner responsivo usando picture element */}
        <picture className="absolute inset-0 w-full h-full">
          {/* Imagem para desktop/tablet (768px+) */}
          {category.banner_image && (
            <source 
              media="(min-width: 768px)" 
              srcSet={category.banner_image}
              type="image/png"
            />
          )}
          
          {/* Imagem para mobile (até 767px) */}
          {category.banner_mobile_image && (
            <source 
              media="(max-width: 767px)" 
              srcSet={category.banner_mobile_image}
              type="image/png"
            />
          )}
          
          {/* Fallback image */}
          <img
            src={category.banner_image}
            alt={`Banner da categoria ${category.name}`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </picture>
      </div>
    </section>
  );
};

export default CategoryPageBanner;

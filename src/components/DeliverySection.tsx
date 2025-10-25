import React, { useState } from 'react';
import deliveryImage from '../assets/delivery2.png';
import deliveryImageMobile from '../assets/delivery-mobile.png';
import { Skeleton } from '@/components/ui/skeleton';

const DeliverySection: React.FC = () => {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <section className="bg-background">
      <div className="max-w-[1590px] mx-auto px-4">
        <div className="relative overflow-hidden shadow-lg bg-white/60 backdrop-blur-sm">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-[#58090d]/10" />
          <div className="relative aspect-[9/16] sm:aspect-[16/9] lg:aspect-[16/6]">
            {imageLoading && (
              <Skeleton className="absolute inset-0 h-full w-full rounded-none bg-[#58090d]/15" />
            )}
            <picture className="absolute inset-0 block h-full w-full">
              {/* Imagem para mobile (até 767px) */}
              <source
                media="(max-width: 767px)"
                srcSet={deliveryImageMobile}
                type="image/png"
              />
              {/* Imagem para desktop/tablet (768px+) */}
              <source
                media="(min-width: 768px)"
                srcSet={deliveryImage}
                type="image/jpeg"
              />

              {/* Fallback image */}
              <img
                src={deliveryImage}
                alt="Informações sobre entrega" 
                className="h-full w-full object-contain md:object-cover md:object-center transition-transform duration-700"
                loading="lazy"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliverySection;

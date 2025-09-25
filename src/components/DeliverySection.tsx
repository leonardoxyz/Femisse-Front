import React from 'react';
import deliveryImage from '../assets/delivery.jpg';
import deliveryImageMobile from '../assets/delivery-mobile.png';

const DeliverySection: React.FC = () => {
  return (
    <section className="py-16 md:pt-12 bg-background">
      <div className="w-full">
        <div className="flex justify-center">
          <picture className="w-full flex justify-center">
            {/* Imagem para desktop/tablet (768px+) */}
            <source 
              media="(min-width: 768px)" 
              srcSet={deliveryImage}
              type="image/jpeg"
            />
            
            {/* Imagem para mobile (até 767px) */}
            <source 
              media="(max-width: 767px)" 
              srcSet={deliveryImageMobile}
              type="image/png"
            />
            
            {/* Fallback image */}
            <img
              src={deliveryImage}
              className="w-full h-auto shadow-sm hover:shadow-md"
              style={{
                maxWidth: '1920px',
                width: '70%',
                height: 'auto',
                objectFit: 'cover'
              }}
              loading="lazy"
            />
          </picture>
        </div>
      </div>
    </section>
  );
};

export default DeliverySection;

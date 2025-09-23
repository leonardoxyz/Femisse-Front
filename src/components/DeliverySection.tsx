import React from 'react';

interface DeliverySectionProps {
  imageSrc?: string;
  imageAlt?: string;
}

const DeliverySection: React.FC<DeliverySectionProps> = ({ 
  imageSrc = "/src/assets/imagem.jpg", 
}) => {
  return (
    <section className="py-16 md:pt-12 bg-background">
      <div className="w-full">
        <div className="flex justify-center">
          <img
            src={imageSrc}
            className="w-full h-auto shadow-sm hover:shadow-md transition-shadow duration-300"
            style={{
              maxWidth: '1920px',
              width: '100vw',
              objectFit: 'cover'
            }}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default DeliverySection;

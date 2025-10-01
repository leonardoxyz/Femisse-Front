import React from 'react';
import { Truck, CreditCard, RotateCcw, Zap, Package, type LucideIcon } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

const FeaturesCarousel = () => {
  const features: Feature[] = [
    {
      id: 1,
      title: "PARCELAMENTO",
      description: "Em até 5x sem juros no cartão de crédito",
      icon: CreditCard
    },
    {
      id: 2,
      title: "ENTREGA EM TODO BRASIL",
      description: "Consulte o prazo durante o fechamento da sua compra",
      icon: Truck
    },
    {
      id: 3,
      title: "DEVOLUÇÃO GRÁTIS",
      description: "Faça o login e preencha o formulário",
      icon: RotateCcw
    },
    {
      id: 4,
      title: "PAGAMENTO POR PIX",
      description: "Em todas as marcas e produtos no site",
      icon: Zap
    },
  ];

  return (
    <section className="">
      <div className="max-w-[1590px] mx-auto px-4">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          loop
          grabCursor
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.2 },
            1440: { slidesPerView: 4 }
          }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <SwiperSlide key={feature.id}>
                <div className="h-full rounded-lg px-6 shadow-sm transition-transform duration-300">
                  <div className="flex items-center justify-center">
                    <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-black/5">
                      <Icon className="h-7 w-7 md:h-8 md:w-8" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 items-center justify-center">
                    <div className="min-w-0 text-center">
                      <h3 className="font-sans text-sm font-semibold uppercase tracking-wide">
                        {feature.title}
                      </h3>
                      <p className="font-sans text-xs md:text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default FeaturesCarousel;

import React from 'react';
import { Truck, CreditCard, RotateCcw, Zap, Package } from 'lucide-react';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeaturesCarousel = () => {
  const features: Feature[] = [
    {
      id: 1,
      title: "PARCELAMENTO",
      description: "Em até 5x sem juros",
      icon: <CreditCard className="w-15 h-15" />
    },
    {
      id: 2,
      title: "ENTREGA EM TODO BRASIL",
      description: "Consulte o prazo durante o fechamento da sua compra",
      icon: <Truck className="w-15 h-15" />
    },
    {
      id: 3,
      title: "DEVOLUÇÃO GRÁTIS",
      description: "Faça o login e preencha o formulário",
      icon: <RotateCcw className="w-15 h-15" />
    },
    {
      id: 4,
      title: "PAGAMENTO POR PIX",
      description: "Em todas as marcas e produtos no site",
      icon: <Zap className="w-15 h-15" />
    },
    {
      id: 5,
      title: "NOSSA NEWSLETTER",
      description: "Recompensas e promoções especiais apenas para usuários cadastrados",
      icon: <Package className="w-15 h-15" />
    }
  ];

  // Duplicar features para criar loop infinito
  const duplicatedFeatures = [...features, ...features];

  return (
    <section className="bg-primary text-primary-foreground py-3 overflow-hidden">
      <div className="relative">
        <div 
          className="flex whitespace-nowrap"
          style={{
            animation: 'scroll 10s linear infinite'
          }}
        >
          {duplicatedFeatures.map((feature, index) => (
            <div
              key={`${feature.id}-${index}`}
              className="flex-shrink-0 flex items-center justify-center gap-3 px-8 min-w-[400px]"
            >
              <div className="text-white/90 flex-shrink-0">
                {feature.icon}
              </div>
              <div className="text-center min-w-0">
                <h3 className="font-sans font-bold text-xs md:text-sm whitespace-nowrap">
                  {feature.title}
                </h3>
                <p className="font-sans text-xs text-white/80 whitespace-nowrap">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturesCarousel;

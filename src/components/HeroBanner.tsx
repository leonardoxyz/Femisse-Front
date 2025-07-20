import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Primeira compra?",
      subtitle: "BEMVINDA5",
      description: "UTILIZE O CUPOM",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=600&fit=crop"
    },
    {
      id: 2,
      title: "Winter Collection",
      subtitle: "ATÉ 50% OFF",
      description: "Peças exclusivas",
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&h=600&fit=crop"
    },
    {
      id: 3,
      title: "Lançamentos",
      subtitle: "NEW IN",
      description: "Confira as novidades",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=600&fit=crop"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden bg-gradient-to-br from-pink-light to-background">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${slide.image})`,
                filter: "brightness(0.7)"
              }}
            />
            
            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="max-w-2xl mx-auto px-4 animate-fade-in">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  {slide.title}
                </h2>
                <h3 className="text-6xl md:text-8xl font-black text-primary mb-2 drop-shadow-lg">
                  {slide.subtitle}
                </h3>
                <p className="text-xl md:text-2xl font-medium text-white mb-8">
                  {slide.description}
                </p>
                <Button size="lg" className="bg-primary hover:bg-pink-dark text-white px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-lg">
                  Comprar Agora
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-primary scale-125"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
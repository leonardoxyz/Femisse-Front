import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/config/api";
import bannerVideo from "@/assets/banner-video.mp4";

const HeroBanner = () => {
  const [slides, setSlides] = useState<{ id: string; url: string; alt?: string|null; type?: 'image' | 'video' }[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Função para detectar o tipo de mídia baseado na extensão
  const getMediaType = (url: string): 'image' | 'video' => {
    const extension = url.split('.').pop()?.toLowerCase();
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
    return videoExtensions.includes(extension || '') ? 'video' : 'image';
  };

  useEffect(() => {
    // Vídeo local da pasta assets
    const localVideo = {
      id: 'local-video',
      url: bannerVideo,
      alt: 'Vídeo promocional',
      type: 'video' as const
    };

    fetch(API_ENDPOINTS.bannerImages)
      .then(res => res.json())
      .then(data => {
        const apiSlides = Array.isArray(data) ? data.map(slide => ({
          ...slide,
          type: getMediaType(slide.url)
        })) : [];
        
        // Combina o vídeo local com os slides da API
        const allSlides = [localVideo, ...apiSlides];
        setSlides(allSlides);
        setLoading(false);
      })
      .catch(() => {
        // Se a API falhar, pelo menos mostra o vídeo local
        setSlides([localVideo]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!slides.length) return;
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

  // Efeito para controlar reprodução de vídeos
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([slideId, video]) => {
      if (video) {
        const slideIndex = slides.findIndex(s => s.id === slideId);
        if (slideIndex === currentSlide) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }, [currentSlide, slides]);

  if (loading) {
    return (
      <section className="relative h-[70vh] md:h-[60vh] overflow-hidden bg-gradient-to-br from-pink-light to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando banner...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[60vh] overflow-hidden bg-gradient-to-br from-pink-light to-background">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            {slide.type === 'video' ? (
              <video
                ref={(el) => {
                  if (el) videoRefs.current[slide.id] = el;
                }}
                src={slide.url}
                className="w-full h-full object-cover"
                style={{
                  filter: "brightness(1) contrast(1.1) saturate(1.1)"
                }}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onLoadedData={() => {
                  // Força o play em dispositivos móveis
                  const video = videoRefs.current[slide.id];
                  if (video && index === currentSlide) {
                    video.play().catch(() => {
                      // Fallback silencioso se autoplay falhar
                    });
                  }
                }}
                onError={(e) => {
                  console.warn('Erro ao carregar vídeo:', slide.url, e);
                }}
              />
            ) : (
              <img
                src={slide.url}
                alt={slide.alt || "Banner"}
                className="w-full h-full object-cover"
                style={{
                  filter: "brightness(0.7)"
                }}
              />
            )}
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
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
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
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HeroBanner = () => {
  const [slides, setSlides] = useState<{ id: string; url: string; alt?: string|null; type?: 'image' | 'video' }[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const swiperRef = useRef<SwiperType | null>(null);

  const ensureVideosPlaying = useCallback(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (!video) return;
      if (video.paused) {
        video.play().catch(() => {});
      }
    });
  }, []);

  // Função para detectar o tipo de mídia baseado na extensão
  const getMediaType = (url: string): 'image' | 'video' => {
    const extension = url.split('.').pop()?.toLowerCase();
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
    return videoExtensions.includes(extension || '') ? 'video' : 'image';
  };

  useEffect(() => {
    fetch(API_ENDPOINTS.bannerImages)
      .then(async (res) => {
        const payload = await res.json();
        if (!payload?.success) {
          throw new Error('Falha ao carregar banners');
        }
        const apiSlidesSource = Array.isArray(payload.data) ? payload.data : [];
        const apiSlides = apiSlidesSource.map((slide, index) => {
          const detectedType = getMediaType(slide.url);
          return {
            id: slide.id ?? `banner-${index}`,
            url: slide.url,
            alt: slide.title || 'Banner',
            type: detectedType, // Força detecção por extensão
          };
        });

        setSlides(apiSlides);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao carregar banners:', error);
        setSlides([]);
        setLoading(false);
      });
  }, []);

  const nextSlide = () => {
    swiperRef.current?.slideNext();
  };

  const prevSlide = () => {
    swiperRef.current?.slidePrev();
  };

  // Efeito para controlar reprodução de vídeos
  useEffect(() => {
    ensureVideosPlaying();
  }, [currentSlide, slides, ensureVideosPlaying]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        ensureVideosPlaying();
      }
    };

    const handleUserInteraction = () => {
      ensureVideosPlaying();
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('touchstart', handleUserInteraction, { passive: true });
    document.addEventListener('click', handleUserInteraction, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [ensureVideosPlaying]);

  if (loading) {
    return (
      <section className="relative h-[25vh] md:h-[60vh] overflow-hidden bg-gradient-to-br from-pink-light to-background">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none bg-[#58090d]/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#58090d]/10 via-transparent to-black/20" />
      </section>
    );
  }

  return (
    <section className="relative h-[25vh] sm:h-[60vh] md:h-[70vh] lg:h-[60vh] overflow-hidden bg-gradient-to-br from-pink-light to-background">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        loop
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !bg-white/50 !w-3 !h-3',
          bulletActiveClass: 'swiper-pagination-bullet-active !bg-primary !scale-125',
        }}
        navigation={{
          prevEl: '.swiper-button-prev-custom',
          nextEl: '.swiper-button-next-custom',
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setCurrentSlide(swiper.realIndex);
        }}
        className="h-full"
        style={{
          '--swiper-pagination-bottom': '24px',
          '--swiper-pagination-bullet-inactive-opacity': '0.5',
        } as React.CSSProperties}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            {slide.type === 'video' ? (
              <video
                ref={(el) => {
                  if (el) {
                    videoRefs.current[slide.id] = el;
                  }
                }}
                src={slide.url}
                className="w-full h-full object-cover"
                style={{
                  filter: 'brightness(1) contrast(1.1) saturate(1.1)',
                }}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onLoadedData={ensureVideosPlaying}
                onPause={ensureVideosPlaying}
                onError={(e) => {
                  console.warn('Erro ao carregar vídeo:', slide.url, e);
                }}
              />
            ) : (
              <img
                src={slide.url}
                alt={slide.alt || 'Banner'}
                className="w-full h-full object-cover"
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation arrows */}
      <button
        className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 bg-[#58090d] hover:bg-[#58090d]/90 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg z-10"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 bg-[#58090d] hover:bg-[#58090d]/90 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg z-10"
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </section>
  );
};

export default HeroBanner;
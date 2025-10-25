import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import { API_ENDPOINTS } from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";
import { logger } from "../utils/logger-unified";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

type BannerLayout = "web" | "mobile";

type RawBanner = {
  id?: string;
  url: string;
  title?: string | null;
  target_layout?: string | null;
  targetLayout?: string | null;
};

type BannerSlide = {
  id: string;
  url: string;
  alt: string;
  type: "image" | "video";
};

const MOBILE_BREAKPOINT = 768;

const getMediaType = (url: string): "image" | "video" => {
  const extension = url.split(".").pop()?.toLowerCase();
  return ["mp4", "webm", "ogg", "avi", "mov"].includes(extension || "") ? "video" : "image";
};

const HeroBanner = () => {
  const [layout, setLayout] = useState<BannerLayout | null>(null);
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const swiperRef = useRef<SwiperType | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const ensureVideosPlaying = useCallback(() => {
    videoRefs.current.forEach((video) => {
      if (!video) return;
      if (video.paused) {
        video.play().catch(() => undefined);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const updateLayout = () => setLayout(mediaQuery.matches ? "mobile" : "web");

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);

    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    if (!layout) return;

    const controller = new AbortController();
    const fetchBanners = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_ENDPOINTS.bannerImages}?layout=${layout}`, { signal: controller.signal });
        const payload = await response.json();

        if (!payload?.success) {
          throw new Error("Falha ao carregar banners");
        }

        const rawBanners: RawBanner[] = Array.isArray(payload.data) ? payload.data : [];
        const hasLayoutInfo = rawBanners.some((banner) => {
          const value = banner.target_layout ?? banner.targetLayout;
          return typeof value === "string" && value.trim() !== "";
        });

        const filtered = (hasLayoutInfo
          ? rawBanners.filter((banner) => {
              const value = (banner.target_layout ?? banner.targetLayout ?? "web").toString().trim().toLowerCase();
              return value === layout;
            })
          : rawBanners
        ).filter((banner) => Boolean(banner.url));

        const normalizedSlides: BannerSlide[] = filtered.map((banner, index) => ({
          id: banner.id ?? `banner-${layout}-${index}`,
          url: banner.url,
          alt: banner.title ?? "Banner",
          type: getMediaType(banner.url),
        }));

        setSlides(normalizedSlides);
      } catch (error) {
        if (!controller.signal.aborted) {
          logger.error("Erro ao carregar banners", error);
          setSlides([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchBanners();

    return () => controller.abort();
  }, [layout]);

  useEffect(() => {
    if (!slides.length) return;

    ensureVideosPlaying();

    const onVisibilityChange = () => {
      if (!document.hidden) ensureVideosPlaying();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [slides, ensureVideosPlaying]);

  const handlePrev = () => swiperRef.current?.slidePrev();
  const handleNext = () => swiperRef.current?.slideNext();

  const isDesktop = useMemo(() => layout === "web", [layout]);

  if (isLoading) {
    return (
      <section className="relative h-[70vh] sm:h-[60vh] md:h-[70vh] overflow-hidden bg-gradient-to-br from-pink-light to-background">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none bg-[#58090d]/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#58090d]/10 via-transparent to-black/20" />
      </section>
    );
  }

  if (!slides.length) {
    return null;
  }

  return (
    <section className="relative h-[70vh] sm:h-[60vh] md:h-[70vh] lg:h-[60vh] overflow-hidden bg-gradient-to-br from-pink-light to-background">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-white/50 !w-3 !h-3",
          bulletActiveClass: "swiper-pagination-bullet-active !bg-primary !scale-125",
        }}
        navigation={{ prevEl: ".swiper-button-prev-custom", nextEl: ".swiper-button-next-custom" }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => ensureVideosPlaying() ?? swiper.realIndex}
        className="h-full"
        style={{
          "--swiper-pagination-bottom": "24px",
          "--swiper-pagination-bullet-inactive-opacity": "0.5",
        } as React.CSSProperties}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {slide.type === "video" ? (
              <video
                ref={(element) => {
                  if (element) {
                    videoRefs.current.set(slide.id, element);
                  } else {
                    videoRefs.current.delete(slide.id);
                  }
                }}
                src={slide.url}
                className="w-full h-full object-cover"
                style={{ filter: "brightness(1) contrast(1.1) saturate(1.1)" }}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onLoadedData={ensureVideosPlaying}
                onError={(error) => logger.warn("Erro ao carregar vídeo", { url: slide.url, error })}
              />
            ) : (
              <img src={slide.url} alt={slide.alt} className="w-full h-full object-cover" loading="lazy" />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {isDesktop && (
        <>
          <button
            className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 bg-[#58090d] hover:bg-[#58090d]/90 text-white p-3 rounded-full transition-transform duration-300 hover:scale-110 shadow-lg z-10"
            onClick={handlePrev}
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 bg-[#58090d] hover:bg-[#58090d]/90 text-white p-3 rounded-full transition-transform duration-300 hover:scale-110 shadow-lg z-10"
            onClick={handleNext}
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
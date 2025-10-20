import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { Skeleton } from "@/components/ui/skeleton";
import { getTestimonials, type Testimonial } from "@/services/testimonials";

import "swiper/css";
import "swiper/css/pagination";

const getRatingStars = (rating: number): string => {
  return '★'.repeat(rating);
};

const CustomerTestimonials = () => {
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await getTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error('Erro ao carregar depoimentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section className="md:py-16 py-12">
      <div className="max-w-[1590px] mx-auto px-4">
        <div className="mb-10 md:mb-14 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#58090d]/10 text-[#58090d] text-xs font-semibold tracking-wide uppercase">
            Depoimentos reais
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900">
            O que nossas clientes estão dizendo
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Feedbacks de mulheres que já vivem a experiência Femisse.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex flex-col gap-5 rounded-3xl border border-[#58090d]/20 bg-[#58090d]/5 px-6 py-8 md:px-8 md:py-10"
              >
                <Skeleton className="h-10 w-10 rounded-full bg-[#58090d]/20" />
                <Skeleton className="h-24 w-full rounded-2xl bg-[#58090d]/10" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-full bg-[#58090d]/20" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3 bg-[#58090d]/30" />
                    <Skeleton className="h-3 w-1/2 bg-[#58090d]/20" />
                    <Skeleton className="h-3 w-1/3 bg-[#58090d]/15" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={24}
            loop
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide
                key={`${testimonial.name}-${testimonial.city}`}
                className="flex h-auto"
              >
                <article className="flex flex-col justify-between gap-6 rounded-3xl bg-white/80 backdrop-blur-sm border shadow-[0_20px_45px_rgba(88,9,13,0.08)] px-6 py-8 md:px-8 md:py-10 transition-transform duration-500 min-h-[320px] md:min-h-[360px] lg:min-h-[380px]">
                  <Quote className="h-10 w-10 text-[#58090d]" strokeWidth={1.5} />

                  <p className="text-base md:text-lg text-gray-700 leading-relaxed flex-1">
                    “{testimonial.comment}”
                  </p>

                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={`Foto de ${testimonial.name}`}
                      className="h-14 w-14 rounded-full object-cover border-2 border-[#58090d]/40 shadow-sm"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#58090d] font-semibold">
                        {getRatingStars(testimonial.rating)}
                      </p>
                      <p className="text-sm text-gray-500">{testimonial.city}</p>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default CustomerTestimonials;

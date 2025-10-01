import { Quote } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

type Testimonial = {
  name: string;
  comment: string;
  rating: string;
  avatar: string;
  city: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Mariana Alves",
    city: "São Paulo - SP",
    comment:
      "A Feminisse sempre entrega peças com acabamento impecável. Já fiz três compras e todas chegaram rapidinho!",
    rating: "★★★★★",
    avatar: "https://i.pravatar.cc/160?img=47",
  },
  {
    name: "Camila Teixeira",
    city: "Belo Horizonte - MG",
    comment:
      "Adorei a curadoria da loja. As sugestões do time combinam demais com meu estilo. Serviço maravilhoso!",
    rating: "★★★★★",
    avatar: "https://i.pravatar.cc/160?img=12",
  },
  {
    name: "Fernanda Rocha",
    city: "Curitiba - PR",
    comment:
      "Recebi meu pedido antes do prazo e com um cheirinho incrível. Dá para sentir o carinho em cada detalhe.",
    rating: "★★★★★",
    avatar: "https://i.pravatar.cc/160?img=32",
  },
  {
    name: "Juliana Martins",
    city: "Rio de Janeiro - RJ",
    comment:
      "As peças vestem muito bem e a tabela de medidas é super precisa. Já me tornei cliente fiel!",
    rating: "★★★★★",
    avatar: "https://i.pravatar.cc/160?img=5",
  },
];

const CustomerTestimonials = () => {
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
                      {testimonial.rating}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.city}</p>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default CustomerTestimonials;

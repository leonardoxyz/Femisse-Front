import React from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { createSlug } from '@/utils/slugs';

const CategoryBanner = () => {
  const [popularies, setPopularies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(API_ENDPOINTS.popular)
      .then(res => res.json())
      .then(data => {
        setPopularies(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-[1590px]">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#58090d]"></div>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 tracking-wide">
              MAIS VENDIDOS
            </h2>
            <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[#58090d]"></div>
          </div>
          <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Descubra as peças que estão conquistando o coração das nossas clientes
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {popularies.map((popular, index) => (
            <div
              key={popular.name}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <a
                href={`/categoria/${createSlug(popular.name)}`}
                className="block relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={popular.image}
                    alt={popular.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                    <span className="text-xs font-semibold text-[#58090d] uppercase tracking-wide">
                      Popular
                    </span>
                  </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                    <h3 className="text-white font-display uppercase text-lg md:text-xl lg:text-2xl font-bold mb-2 leading-tight">
                      {popular.name}
                    </h3>

                    {/* Action Indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-white/90 text-sm font-medium">
                        Ver coleção
                      </span>
                      <div className="w-6 h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                      <div className="w-2 h-2 bg-white rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-200"></div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#58090d]/20 to-[#58090d]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16">
          <div className="inline-flex items-center gap-3 text-gray-600 hover:text-[#58090d] transition-colors duration-300 cursor-pointer group">
            <span className="text-sm font-medium">Explore os mais vendidos</span>
            <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-[#58090d] group-hover:text-white transition-all duration-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryBanner;
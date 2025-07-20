const CategoryBanner = () => {
  const categories = [
    {
      name: "IRIS",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=400&fit=crop",
      link: "#"
    },
    {
      name: "PENELOPE", 
      image: "https://images.unsplash.com/photo-1485968612354-0c03b26ce058?w=300&h=400&fit=crop",
      link: "#"
    },
    {
      name: "TIFFANY",
      image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&h=400&fit=crop", 
      link: "#"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-pink-light to-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-scale-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              
              {/* Category label */}
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                  {category.name}
                </h3>
                <div className="w-12 h-1 bg-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryBanner;
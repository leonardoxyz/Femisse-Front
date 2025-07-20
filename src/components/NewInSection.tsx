import ProductCard from "./ProductCard";

const NewInSection = () => {
  // Mock data baseado nos produtos do site Motta Conf
  const newProducts = [
    {
      id: 1,
      name: "CROPPED SOLAR MARROM ESCURO",
      price: 23.00,
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop",
      isNew: true
    },
    {
      id: 2,
      name: "VESTIDO LOLA PRETO",
      price: 40.00,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop",
      isNew: true
    },
    {
      id: 3,
      name: "BODY BÁSICO BRANCO",
      price: 28.00,
      originalPrice: 35.00,
      image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=600&fit=crop",
      isNew: true,
      onSale: true
    },
    {
      id: 4,
      name: "SAIA MIDI PLISSADA",
      price: 45.00,
      image: "https://images.unsplash.com/photo-1583846098597-b82db7093e8b?w=400&h=600&fit=crop",
      isNew: true
    },
    {
      id: 5,
      name: "CROPPED CANELADO ROSA",
      price: 25.00,
      image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400&h=600&fit=crop",
      isNew: true
    },
    {
      id: 6,
      name: "CALÇA JEANS WIDE",
      price: 65.00,
      image: "https://images.unsplash.com/photo-1541840031508-326b77c9a17e?w=400&h=600&fit=crop",
      isNew: true
    },
    {
      id: 7,
      name: "VESTIDO MIDI FLORAL",
      price: 55.00,
      originalPrice: 70.00,
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=600&fit=crop",
      isNew: true,
      onSale: true
    },
    {
      id: 8,
      name: "BLUSA OMBRO A OMBRO",
      price: 32.00,
      image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=600&fit=crop",
      isNew: true
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
            NEW IN
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
            Descubra as últimas novidades da nossa coleção. Peças exclusivas e tendências que você vai amar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {newProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-primary hover:bg-pink-dark text-primary-foreground px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
            Ver Todos os Produtos
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewInSection;
import ProductShowcase from "./ProductShowcase";

const ProductShowcaseSection = () => {
  const showcaseProduct = {
    name: "VESTIDO RECORTE VERDE OLIVA",
    color: "Verde Oliva",
    pantoneCode: "PMS 5743 C",
    hexCode: "#6B7A3F",
    images: {
      small: "https://images.unsplash.com/photo-1594736797933-d0cab7b93d55?w=200&h=300&fit=crop",
      large: "https://images.unsplash.com/photo-1594736797933-d0cab7b93d55?w=400&h=600&fit=crop"
    },
    price: 89.00
  };

  const otherProducts = [
    {
      name: "BODY CANELADO PRETO",
      color: "Preto",
      pantoneCode: "PMS Black C",
      hexCode: "#000000",
      images: {
        small: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=300&fit=crop",
        large: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop"
      },
      price: 35.00
    },
    {
      name: "CROPPED MANGA LONGA ROSA",
      color: "Rosa Claro",
      pantoneCode: "PMS 217 C",
      hexCode: "#F8BBD9",
      images: {
        small: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=200&h=300&fit=crop",
        large: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400&h=600&fit=crop"
      },
      price: 42.00
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
            PRODUTO EM DESTAQUE
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
            Apresentação detalhada com paleta de cores e múltiplas visualizações.
          </p>
        </div>

        {/* Featured product showcase */}
        <div className="flex justify-center mb-16">
          <div className="animate-scale-in">
            <ProductShowcase {...showcaseProduct} />
          </div>
        </div>

        {/* Other products in showcase format */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {otherProducts.map((product, index) => (
            <div
              key={product.name}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <ProductShowcase {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcaseSection;

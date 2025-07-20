import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock product data - in a real app, this would come from an API
  const product = {
    id: Number(id),
    name: "Blusa Feminina Elegant",
    description: "Blusa feminina confeccionada em tecido de alta qualidade, perfeita para ocasiões especiais. Design moderno e elegante que valoriza o seu estilo.",
    price: 89.90,
    originalPrice: 149.90,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop"
    ],
    badge: "PROMOÇÃO",
    badgeVariant: "destructive" as const,
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Branco", "Rosa"],
    inStock: true
  };

  const formatPrice = (value: number) => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-[600px] object-cover rounded-lg"
              />
              {product.badge && (
                <Badge 
                  variant={product.badgeVariant}
                  className="absolute top-4 left-4 text-xs px-2 py-1"
                >
                  {product.badge}
                </Badge>
              )}
            </div>
            
            {/* Thumbnail images */}
            <div className="flex gap-2">
              {product.images.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 2}`}
                  className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <Card className="p-6 bg-muted/30">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {discount}% OFF
                  </Badge>
                )}
                <p className="text-sm text-muted-foreground">
                  ou 3x de {formatPrice(product.price / 3)} sem juros
                </p>
              </div>
            </Card>

            {/* Size Selection */}
            <div>
              <h3 className="font-semibold mb-3">Tamanho:</h3>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant="outline"
                    size="sm"
                    className="w-12 h-12"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-semibold mb-3">Cor:</h3>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                    size="sm"
                    className="min-w-20"
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-pink-dark text-white font-semibold py-4"
                disabled={!product.inStock}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                {product.inStock ? "Adicionar ao Carrinho" : "Produto Esgotado"}
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" size="lg" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Favoritar
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="pt-6 border-t border-border/20">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Frete grátis para todo o Brasil</p>
                <p>✓ Troca grátis em até 30 dias</p>
                <p>✓ Pagamento seguro</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
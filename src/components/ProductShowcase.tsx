import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProductShowcaseProps {
  name: string;
  color: string;
  pantoneCode: string;
  hexCode: string;
  images: {
    small: string;
    large: string;
  };
  price: number;
}

const ProductShowcase = ({ 
  name, 
  color, 
  pantoneCode, 
  hexCode, 
  images, 
  price 
}: ProductShowcaseProps) => {
  const formatPrice = (value: number) => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

  return (
    <Card className="w-full max-w-md mx-auto bg-muted/30 overflow-hidden border-0 shadow-xl">
      <div className="relative p-6 min-h-[600px]">
        {/* Color palette section */}
        <div className="mb-6">
          <div 
            className="w-32 h-24 rounded-lg mb-3 border border-border/20"
            style={{ backgroundColor: hexCode }}
          />
          <div className="space-y-1">
            <div className="text-lg font-bold text-foreground">PANTONE®</div>
            <div className="text-sm font-medium text-muted-foreground">{pantoneCode}</div>
            <div className="text-xs text-muted-foreground">{hexCode}</div>
          </div>
        </div>

        {/* Small image */}
        <div className="absolute left-6 bottom-32 w-20 h-28 rounded-lg overflow-hidden shadow-lg border-2 border-white">
          <img
            src={images.small}
            alt={`${name} pequena`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* "COMPRE AGORA" text - vertical */}
        <div className="absolute left-2 bottom-6 writing-mode-vertical text-sm font-bold text-muted-foreground tracking-wider">
          COMPRE AGORA
        </div>

        {/* Large image */}
        <div className="absolute right-0 top-6 bottom-6 w-48 rounded-l-2xl overflow-hidden shadow-2xl">
          <img
            src={images.large}
            alt={name}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Product info overlay */}
        <div className="absolute bottom-6 right-6 left-28 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg">
          <h3 className="font-bold text-foreground text-sm mb-1 line-clamp-2">
            {name}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">Cor: {color}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {formatPrice(price)}
            </span>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-pink-dark text-white h-8 px-3 text-xs rounded-full"
            >
              <ShoppingBag className="h-3 w-3 mr-1" />
              Comprar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductShowcase;
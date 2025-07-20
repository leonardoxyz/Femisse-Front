import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  isNew?: boolean;
  onSale?: boolean;
}

const ProductCard = ({ 
  id, 
  name, 
  price, 
  originalPrice, 
  image, 
  isNew = false, 
  onSale = false 
}: ProductCardProps) => {
  const navigate = useNavigate();
  const formatPrice = (value: number) => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

  return (
    <Card 
      className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-card border-0 overflow-hidden"
      onClick={() => navigate(`/produto/${id}`)}
    >
      <div className="relative overflow-hidden aspect-[3/4]">
        {/* Product image */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <span className="bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold rounded-full">
              NEW
            </span>
          )}
          {onSale && (
            <span className="bg-destructive text-destructive-foreground px-2 py-1 text-xs font-semibold rounded-full">
              SALE
            </span>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 rounded-full shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick add to cart */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <Button 
            size="sm" 
            className="w-full bg-primary hover:bg-pink-dark text-white font-semibold rounded-full transition-all duration-300 hover:scale-105"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-2">
        <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {name}
        </h3>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(price)}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {[1,2,3,4,5].map((star) => (
              <div key={star} className="w-3 h-3 bg-muted rounded-full"></div>
            ))}
            <span className="text-xs text-muted-foreground ml-1">(0)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
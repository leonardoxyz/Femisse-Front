import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { createSlug } from "@/utils/slugs";
import { cn } from "@/lib/utils";
import { storeCurrentScrollPosition } from "@/hooks/useScrollRestoration";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  stock: number;
  image?: string;
  onFavoriteChange?: (productId: string, isNowFavorite: boolean) => void;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  images,
  stock,
  image,
  onFavoriteChange,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const [hovered, setHovered] = React.useState(false);
  let safeImages: string[] = [];
  if (Array.isArray(images) && images.length > 0) {
    safeImages = images.filter(Boolean);
  } else if (typeof image === 'string' && image.length > 0) {
    safeImages = [image];
  }
  const mainImage = safeImages[0] || '';
  const hoverImage = safeImages[1] || safeImages[0] || '';

  const { addToCart } = useCart();

  const handleNavigateToDetails = React.useCallback(() => {
    storeCurrentScrollPosition();
    navigate(`/produto/${createSlug(name)}`);
  }, [navigate, name]);

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    addToCart({
      id,
      name,
      price,
      image: mainImage,
    });
    toast({
      title: "Adicionado ao carrinho",
      description: `${name} foi adicionado ao seu carrinho!`,
      variant: "default",
    });
  }

  

const { favoriteIds, addFavorite, removeFavorite } = useFavorites();
const isFavorite = favoriteIds.includes(id);

async function handleAddToFavorites(e: React.MouseEvent) {
  e.stopPropagation();
  if (!localStorage.getItem('token')) {
    toast({
      title: "Login necessário",
      description: "Faça login para favoritar produtos!",
      variant: "destructive",
    });
    return;
  }
  if (isFavorite) {
    await removeFavorite(id);
    if (typeof onFavoriteChange === 'function') {
      onFavoriteChange(id, false);
    }
    toast({
      title: 'Removido dos favoritos',
      description: 'O produto foi removido dos seus favoritos.',
      variant: 'default',
    });
  } else {
    await addFavorite(id);
    if (typeof onFavoriteChange === 'function') {
      onFavoriteChange(id, true);
    }
    toast({
      title: 'Adicionado aos favoritos',
      description: 'O produto foi adicionado aos seus favoritos!',
      variant: 'default',
    });
  }
}

  return (
    <Card
      className="bg-white border-0 shadow-sm hover:shadow-md cursor-pointer p-0 group transition-all duration-300 overflow-hidden mx-auto"
      onClick={handleNavigateToDetails}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '320px',
        height: 'auto',
        flexShrink: 0
      }}
    >
      <div className="w-full bg-white flex items-center justify-center relative overflow-hidden" style={{ paddingTop: '150%' }}>
        <img
          src={hovered && safeImages.length > 1 ? hoverImage : mainImage}
          alt={name}
          className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        />
        {/* Botões de ação */}
        <div className="hidden md:flex md:flex-col gap-2 md:opacity-0 md:group-hover:opacity-100 md:pointer-events-none md:group-hover:pointer-events-auto transition-all duration-300 z-10 absolute top-3 right-3">
          <button
            onClick={handleAddToFavorites}
            className="bg-white/95 hover:bg-pink-50 p-2.5 shadow-lg hover:shadow-xl text-pink-600 hover:text-pink-700 transition-all duration-200 backdrop-blur-sm"
            title="Favoritar"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'text-pink-500 fill-pink-500' : ''}`} />
          </button>
          <button
            onClick={stock === 0 ? undefined : handleAddToCart}
            className={`bg-white/95 p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm ${stock === 0 ? 'text-gray-400 cursor-not-allowed opacity-60' : 'hover:bg-green-50 text-green-600 hover:text-green-700'}`}
            title={stock === 0 ? 'Produto esgotado' : 'Adicionar ao carrinho'}
            disabled={stock === 0}
            tabIndex={stock === 0 ? -1 : 0}
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
      <CardContent className="flex flex-col items-center justify-center py-4 px-4 bg-white min-h-[120px]">
        <h3 className="font-sans text-sm md:text-base text-zinc-800 font-medium text-center mb-3 line-clamp-2 leading-tight min-h-[2.5rem] flex items-center">
          {name}
        </h3>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg md:text-xl font-bold text-zinc-900 text-center">
            {formatPrice(price)}
          </span>
          {originalPrice && (
            <span className="text-lg line-through text-muted-foreground">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

      </CardContent>
    </Card>
  );
};

export default ProductCard;
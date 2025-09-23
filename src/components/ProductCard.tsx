import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { createSlug } from "@/utils/slugs";

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
      className="bg-white border-0 shadow-none cursor-pointer p-0 group"
      onClick={() => navigate(`/produto/${createSlug(name)}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-full aspect-[3/4] bg-white flex items-center justify-center relative overflow-hidden">
        <img
          src={hovered && safeImages.length > 1 ? hoverImage : mainImage}
          alt={name}
          className="w-full h-full object-cover transition-all duration-300"
        />
        {/* Botões de ação */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={handleAddToFavorites}
            className="bg-white/90 hover:bg-pink-100 p-2 shadow text-pink-600 hover:text-pink-900 transition"
            title="Favoritar"
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'text-pink-500 fill-pink-500' : ''}`} />
          </button>
          <button
            onClick={stock === 0 ? undefined : handleAddToCart}
            className={`bg-white/90 p-2 shadow transition ${stock === 0 ? 'text-gray-400 cursor-not-allowed opacity-60' : 'hover:bg-green-100 text-green-600 hover:text-green-900'}`}
            title={stock === 0 ? 'Produto esgotado' : 'Adicionar ao carrinho'}
            disabled={stock === 0}
            tabIndex={stock === 0 ? -1 : 0}
          >
            <ShoppingBag className="w-6 h-6" />
          </button>
        </div>
      </div>
      <CardContent className="flex flex-col items-center justify-center py-6 px-2 rounded-none">
        <h3 className="font-sans text-xs md:text-sm text-zinc-700 font-medium text-center mb-1 uppercase tracking-wide">
          {name}
        </h3>
        <span className="text-2xl font-bold text-zinc-900 text-center">
          {formatPrice(price)}
        </span>
        {originalPrice && (
          <span className="text-sm line-through text-muted-foreground">
            {formatPrice(originalPrice)}
          </span>
        )}

      </CardContent>
    </Card>
  );
};

export default ProductCard;
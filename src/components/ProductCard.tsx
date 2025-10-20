import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { createSlug } from '@/utils/slugs';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { storeCurrentScrollPosition } from "@/hooks/useScrollRestoration";
import { convertToCloudinary } from '@/utils/cloudinary';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
  image?: string;
  onFavoriteChange?: (productId: string, isNowFavorite: boolean) => void;
}

const ProductCard = React.memo(({
  id,
  name,
  price,
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
  
  const mainImage = safeImages[0] 
    ? convertToCloudinary(safeImages[0], { width: 320, height: 480, quality: 80, format: 'auto' })
    : '';
  const hoverImage = safeImages[1]
    ? convertToCloudinary(safeImages[1], { width: 320, height: 480, quality: 80, format: 'auto' })
    : mainImage;

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
      description: `${name} foi adicionado ao seu carrinho!`,
      variant: "default",
    });
  }

  const [isFavorite, setIsFavorite] = useState(false);

  const { isAuthenticated } = useAuth();

  async function handleAddToFavorites(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Faça login para favoritar produtos!",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isFavorite) {
        // Remover dos favoritos
        setIsFavorite(false);
        if (typeof onFavoriteChange === 'function') {
          onFavoriteChange(id, false);
        }
        toast({
          title: 'Removido dos favoritos',
          description: 'O produto foi removido dos seus favoritos.',
          variant: 'default',
        });
      } else {
        // Adicionar aos favoritos
        setIsFavorite(true);
        if (typeof onFavoriteChange === 'function') {
          onFavoriteChange(id, true);
        }
        toast({
          title: 'Adicionado aos favoritos',
          description: 'O produto foi adicionado aos seus favoritos!',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Erro ao gerenciar favoritos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar favoritos. Tente novamente.',
        variant: 'destructive',
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
          loading="lazy"
          decoding="async"
          width="320"
          height="480"
          className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        />
      </div>
      <CardContent className="flex flex-col items-center justify-center py-4 px-4 bg-white min-h-[120px]">
        <h3 className="font-sans text-sm md:text-base text-zinc-800 font-medium text-center mb-3 line-clamp-2 leading-tight min-h-[2.5rem] flex items-center">
          {name}
        </h3>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg md:text-xl font-bold text-zinc-900 text-center">
            {formatPrice(price)}
          </span>
        </div>

      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
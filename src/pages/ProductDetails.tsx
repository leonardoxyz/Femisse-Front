import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Heart, Share2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import React from 'react';

const API_URL = "http://localhost:4000/api/products";

// Funções utilitárias para favoritos
async function fetchFavorites(token: string) {
  const res = await fetch('/api/users/me/favorites', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

async function addFavorite(productId: string, token: string) {
  const res = await fetch('/api/users/me/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ productId })
  });
  return res.json();
}

async function removeFavorite(productId: string, token: string) {
  const res = await fetch(`/api/users/me/favorites/${productId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

const ProductDetails = () => {
  const { addToCart } = useCart();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [mainImageIndex, setMainImageIndex] = React.useState(0);
  const [isZoomed, setIsZoomed] = React.useState(false);

  // Favoritos
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const token = localStorage.getItem('token');

  React.useEffect(() => {
    if (token && product?.id) {
      fetchFavorites(token).then(favs => {
        setFavorites(favs);
        setIsFavorite(favs.includes(product.id));
      });
    }
  }, [product?.id, token]);

  const handleToggleFavorite = async () => {
    if (!token) {
      alert('Faça login para favoritar produtos!');
      return;
    }
    if (isFavorite) {
      const favs = await removeFavorite(product.id, token);
      setFavorites(favs);
      setIsFavorite(false);
    } else {
      const favs = await addFavorite(product.id, token);
      setFavorites(favs);
      setIsFavorite(true);
    }
  };


  React.useEffect(() => {
    fetch(`${API_URL}/${id}`)
      .then((res) => res.json())
      .then(async (data) => {
        let images = data.images || [];
        if (!data.images && data.image_ids && data.image_ids.length > 0) {
          try {
            const imagePromises = data.image_ids.map(async (imageId: string) => {
              if (!imageId) return null;
              const response = await fetch(`http://localhost:4000/api/images/${imageId}`);
              if (response.ok) {
                const imageData = await response.json();
                return imageData.image_url;
              }
              return null;
            });
            
            const imageUrls = await Promise.all(imagePromises);
            images = imageUrls.filter(url => url !== null);
          } catch (error) {
            console.error("Erro ao buscar URLs das imagens:", error);
          }
        }
        
        setProduct({ ...data, images });
        setLoading(false);
        setMainImageIndex(0);
      })
      .catch((err) => {
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Carregando...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Produto não encontrado.</p>
        </div>
        <Footer />
      </div>
    );
  }
  const discount = Math.round(((product.original_price - product.price) / product.original_price) * 100);

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
          <div className="flex gap-4">
            {/* Thumbnail images - Coluna à esquerda */}
            <div className="flex flex-col gap-2">
              {product.images && product.images.map((image: string, index: number) => {
                return (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 ${mainImageIndex === index ? "border-primary" : "border-transparent"}`}
                    onClick={() => setMainImageIndex(index)}
                  />
                );
              })}
            </div>
            
            {/* Imagem principal */}
            <div className="flex-1">
              <div
                className="relative overflow-hidden group w-full h-[600px]"
                style={{ maxWidth: '100%' }}
                onMouseMove={e => {
                  const container = e.currentTarget;
                  const img = container.querySelector('img');
                  if (!img) return;
                  const rect = container.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  img.style.transformOrigin = `${x}% ${y}%`;
                }}
                onMouseLeave={e => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transformOrigin = 'center center';
                }}
              >
                <img
                  src={product.images && product.images.length > 0 ? product.images[mainImageIndex] : product.image}
                  alt={product.name}
                  className="w-full h-[600px] object-cover rounded-lg transition-transform duration-300 cursor-zoom-in"
                  style={{ transformOrigin: 'center center', transition: 'transform 0.3s', transform: isZoomed ? 'scale(2)' : 'scale(1)' }}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={e => { setIsZoomed(false); e.currentTarget.style.transformOrigin = 'center center'; }}
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
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <Card className="p-6 bg-muted/30">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                  {discount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {discount}% OFF
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  ou 3x de {formatPrice(product.price / 3)} sem juros
                </p>
              </div>
            </Card>

            {/* Size Selection */}
            <div>
              <h3 className="font-semibold mb-3">Tamanho:</h3>
              <div className="flex gap-2">
                {Array.isArray(product.sizes) &&
                  product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      className="w-12 h-12"
                    >
                      {size}
                    </Button>
                  ))
                }
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-semibold mb-3">Cor:</h3>
              <div className="flex gap-2">
                {Array.isArray(product.colors) &&
                  product.colors.map((color) => (
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

            <div>
              <h3 className="font-semibold mb-3">Descrição:</h3>
              <p className="text-muted-foreground">{product.description}</p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-pink-dark text-white font-semibold py-4"
                  disabled={product.stock === 0}
                  onClick={() => {
                    addToCart({
                      id: String(product.id),
                      name: product.name,
                      price: product.price,
                      image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image,
                    });
                    toast({
                      title: "Adicionado ao carrinho",
                      description: `${product.name} foi adicionado ao seu carrinho!`,
                      variant: "default",
                    });
                  }}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {product.stock > 0 ? "Adicionar ao Carrinho" : "Produto Esgotado"}
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant={isFavorite ? "default" : "outline"}
                    size="lg"
                    className="flex-1"
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "text-pink-500" : ""}`} />
                    {isFavorite ? "Favoritado" : "Favoritar"}
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
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
      </div >

      <Footer />
    </div >
  );
};

export default ProductDetails;
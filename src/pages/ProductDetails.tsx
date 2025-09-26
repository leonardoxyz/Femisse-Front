import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Heart, Share2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import React from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { extractIdFromSlug, slugToText, removeAccents } from '@/utils/slugs';
import { secureLog, obfuscateUrl } from '@/utils/secureApi';

// Funções utilitárias para favoritos
async function fetchFavorites(token: string) {
  const { API_ENDPOINTS } = await import('@/config/api');
  const res = await fetch(`${API_ENDPOINTS.favorites}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

async function addFavorite(productId: string, token: string) {
  const { API_ENDPOINTS } = await import('@/config/api');
  const res = await fetch(`${API_ENDPOINTS.favorites}`, {
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
  const { API_ENDPOINTS } = await import('@/config/api');
  const res = await fetch(`${API_ENDPOINTS.favorites}/${productId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

const ProductDetails = () => {
  const { addToCart } = useCart();
  const { favoriteIds, addFavorite, removeFavorite } = useFavorites();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [mainImageIndex, setMainImageIndex] = React.useState(0);
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [similarProducts, setSimilarProducts] = React.useState<any[]>([]);
  const [loadingSimilar, setLoadingSimilar] = React.useState(false);

  // Verificar se produto está nos favoritos
  const isFavorite = product ? favoriteIds.includes(product.id) : false;
  const token = localStorage.getItem('token');

  const handleToggleFavorite = async () => {
    if (!token) {
      toast({
        title: "Login necessário",
        description: "Faça login para favoritar produtos!",
        variant: "destructive",
      });
      return;
    }
    
    if (!product?.id) return;
    
    try {
      if (isFavorite) {
        await removeFavorite(product.id);
        toast({
          title: "Removido dos favoritos",
          description: "O produto foi removido dos seus favoritos!",
          variant: "default",
        });
      } else {
        await addFavorite(product.id);
        toast({
          title: "Adicionado aos favoritos",
          description: "O produto foi adicionado aos seus favoritos!",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos. Tente novamente.",
        variant: "destructive",
      });
    }
  };


  React.useEffect(() => {
    if (!slug) return;
    
    // Reset do estado quando slug muda
    setLoading(true);
    setProduct(null);
    setMainImageIndex(0);
    
    const fetchProduct = async () => {
      try {
        secureLog('Buscando produtos:', obfuscateUrl(API_ENDPOINTS.products));
        const response = await fetch(API_ENDPOINTS.products);
        const products = await response.json();
        
        // Converter slug de volta para nome e procurar produto correspondente
        const searchName = slug.replace(/-/g, ' ').toLowerCase();
        console.log('Buscando produto com slug:', slug, 'searchName:', searchName);
        
        const foundProduct = products.find((product: any) => {
          const productName = product.name.toLowerCase();
          console.log('Comparando com produto:', productName);
          
          // Criar slug do nome do produto para comparação exata
          const productSlug = productName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9-]/g, '');
          
          const normalizedSlug = slug
            .toLowerCase()
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9-]/g, '');
          
          console.log('Comparando slugs:', normalizedSlug, 'vs', productSlug);
          
          // Primeiro tenta match exato do slug
          if (normalizedSlug === productSlug) {
            return true;
          }
          
          // Se não encontrou match exato, tenta busca por palavras completas
          const searchWords = searchName.split(' ').filter(word => word.length > 2);
          const productWords = productName.split(' ').filter(word => word.length > 2);
          
          // Verifica se todas as palavras da busca estão no nome do produto
          const allWordsMatch = searchWords.every(searchWord => 
            productWords.some(productWord => 
              productWord.includes(searchWord) || searchWord.includes(productWord)
            )
          );
          
          return allWordsMatch;
        });
        
        console.log('Produto encontrado:', foundProduct);
        if (foundProduct) {
          await processProductData(foundProduct);
          console.log('Produto encontrado:', foundProduct);
          
          // Buscar produtos similares da mesma categoria
          fetchSimilarProducts(foundProduct, products);
        } else {
          console.log('Produto não encontrado');
          navigate('/404');
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    const processProductData = async (data: any) => {
      let images = data.images || [];
      if (!data.images && data.image_ids && data.image_ids.length > 0) {
        try {
          const imagePromises = data.image_ids.map(async (imageId: string) => {
            if (!imageId) return null;
            const response = await fetch(`${API_ENDPOINTS.images}/${imageId}`);
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
    };

    const fetchSimilarProducts = (currentProduct: any, allProducts: any[]) => {
      setLoadingSimilar(true);
      try {
        // Extrair palavras-chave do slug da URL atual
        const urlKeywords = slug ? slug.split('-').filter(word => word.length > 2) : [];
        
        // Também extrair palavras-chave do nome do produto como fallback
        const nameKeywords = currentProduct.name.toLowerCase()
          .split(' ')
          .filter(word => word.length > 2);
        
        // Combinar palavras-chave da URL e do nome (URL tem prioridade)
        const searchKeywords = [...new Set([...urlKeywords, ...nameKeywords])];
        
        console.log(`Produto atual: "${currentProduct.name}"`);
        console.log(`Slug da URL: "${slug}"`);
        console.log('Palavras-chave para busca:', searchKeywords);
        
        // Filtrar produtos similares baseado nas palavras-chave
        const similar = allProducts
          .filter(p => {
            if (p.id === currentProduct.id) return false; // Excluir produto atual
            
            const productName = p.name.toLowerCase();
            const productSlug = productName
              .replace(/\s+/g, '-')
              .replace(/[àáâãäå]/g, 'a')
              .replace(/[èéêë]/g, 'e')
              .replace(/[ìíîï]/g, 'i')
              .replace(/[òóôõö]/g, 'o')
              .replace(/[ùúûü]/g, 'u')
              .replace(/[ç]/g, 'c')
              .replace(/[^a-z0-9-]/g, '');
            
            // Verificar se alguma palavra-chave da busca está presente no nome ou slug do produto
            return searchKeywords.some(keyword => 
              productName.includes(keyword) || 
              productSlug.includes(keyword) ||
              keyword.includes(productName.split(' ')[0]) // Primeira palavra do produto
            );
          })
          .slice(0, 8); // Limitar a 8 produtos similares
        
        setSimilarProducts(similar);
        console.log('Produtos similares encontrados:', similar.length);
        console.log('Produtos similares:', similar.map(p => p.name));
      } catch (error) {
        console.error('Erro ao buscar produtos similares:', error);
        setSimilarProducts([]);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

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
                    className={`w-20 h-20 object-cover cursor-pointer hover:opacity-80 transition-opacity ${mainImageIndex === index ? "border-primary" : "border-transparent"}`}
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
                  className="w-full h-[600px] object-cover transition-transform duration-300 cursor-zoom-in"
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
      </div>

      {/* Seção de Produtos Similares */}
      {similarProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
                PRODUTOS SIMILARES
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
                Descubra outros produtos da mesma categoria que você pode gostar.
              </p>
            </div>

            {loadingSimilar ? (
              <div className="text-center py-12">Carregando produtos similares...</div>
            ) : (
              <div className="relative">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={1}
                  navigation={similarProducts.length > 4 ? {
                    nextEl: '.swiper-button-next-similar',
                    prevEl: '.swiper-button-prev-similar',
                  } : false}
                  pagination={{
                    el: '.swiper-pagination-similar',
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet-similar',
                    bulletActiveClass: 'swiper-pagination-bullet-active-similar',
                  }}
                  autoplay={similarProducts.length > 4 ? {
                    delay: 4000,
                    disableOnInteraction: false,
                  } : false}
                  breakpoints={{
                    640: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },
                    768: {
                      slidesPerView: 3,
                      spaceBetween: 24,
                    },
                    1024: {
                      slidesPerView: 4,
                      spaceBetween: 32,
                    },
                  }}
                  className="similar-products-swiper"
                  style={{
                    '--swiper-navigation-color': '#000',
                    '--swiper-pagination-color': '#000',
                  } as React.CSSProperties}
                >
                  {similarProducts.map((product, index) => (
                    <SwiperSlide key={product.id}>
                      <div
                        className="animate-fade-in h-full"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <ProductCard
                          id={product.id}
                          name={product.name}
                          price={product.price}
                          stock={product.stock}
                          originalPrice={product.original_price}
                          images={product.images}
                          image={product.image}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Navegação customizada - só aparece se houver mais de 4 produtos */}
                {similarProducts.length > 4 && (
                  <>
                    <div className="swiper-button-prev-similar absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-50 shadow-lg flex items-center justify-center cursor-pointer z-10 transition-all duration-300 hover:scale-110">
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                    <div className="swiper-button-next-similar absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-50 shadow-lg flex items-center justify-center cursor-pointer z-10 transition-all duration-300 hover:scale-110">
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </>
                )}

                {/* Indicadores customizados */}
                <div className="swiper-pagination-similar flex justify-center mt-8 gap-2"></div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Estilos customizados para o Swiper */}
      <style jsx global>{`
        .similar-products-swiper .swiper-pagination-bullet-similar {
          width: 8px;
          height: 8px;
          background: rgba(0, 0, 0, 0.3);
          opacity: 1;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 0 4px;
        }
        
        .similar-products-swiper .swiper-pagination-bullet-active-similar {
          background: rgba(0, 0, 0, 0.8);
          transform: scale(1.2);
        }
        
        .similar-products-swiper .swiper-slide {
          height: auto;
          display: flex;
          align-items: stretch;
        }
        
        .similar-products-swiper .swiper-slide > div {
          width: 100%;
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default ProductDetails;
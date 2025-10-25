import React from "react";
import { createPortal } from "react-dom";
import { Search, ShoppingCart, User, Menu, X, Heart, ShoppingBag, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "../hooks/useUserData";
import SidebarCart from "./SidebarCart";
import { API_ENDPOINTS } from "@/config/api";
import { createSlug } from '@/utils/slugs';
import { convertToCloudinary } from '@/utils/cloudinary';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import logo from "@/assets/logo.png";

const promotionalMessages = [
  "★ PRIMEIRA COMPRA COM 10% DE DESCONTO",
  "★ PARCELAMENTO EM ATÉ 5X SEM JUROS",
  "★ ENVIAMOS PARA TODO BRASIL",
  "★ FRETE GRÁTIS A PARTIR DE R$ 120,00",
  "★ DEVOLUÇÃO GRÁTIS EM 30 DIAS",
  "★ PAGAMENTO VIA PIX COM DESCONTO",
];

const Header = () => {
  const [cartOpen, setCartOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<{ id: string, name: string }[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isInteractiveSearchOpen, setIsInteractiveSearchOpen] = React.useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const navigate = useNavigate();
  const { cart } = useCart();
  const { favoriteIds, addFavorite, removeFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { userData } = useUserData();

  const handleCloseInteractiveSearch = React.useCallback(() => {
    setIsInteractiveSearchOpen(false);
    setSearchTerm("");
    setSuggestions([]);
  }, []);

  const handleOverlayOuterPointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (
      target.closest('[data-interactive-search-card="true"]') ||
      target.closest('[data-interactive-search-input="true"]') ||
      target.closest('[data-interactive-search-action="true"]')
    ) {
      return;
    }

    handleCloseInteractiveSearch();
  }, [handleCloseInteractiveSearch]);

  React.useEffect(() => {
    fetch(API_ENDPOINTS.categories)
      .then(res => res.json())
      .then((payload) => {
        const data = Array.isArray(payload?.data) ? payload.data : payload;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]));
  }, []);

  React.useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMenuOpen]);

  React.useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    const timeout = setTimeout(() => {
      fetch(`${API_ENDPOINTS.products}?search=${encodeURIComponent(searchTerm)}`)
        .then(res => res.json())
        .then(payload => {
          const data = Array.isArray(payload?.data) ? payload.data : payload;
          setSuggestions(Array.isArray(data) ? data : []);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoadingSuggestions(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  React.useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSuggestions([]);
        if (isInteractiveSearchOpen) {
          setIsInteractiveSearchOpen(false);
          setSearchTerm("");
        }
      }
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isInteractiveSearchOpen]);

  React.useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;

    if (isInteractiveSearchOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isInteractiveSearchOpen]);

  function handleSuggestionClick(product: any) {
    navigate(`/produto/${createSlug(product.name || product.nome)}`);
    setSearchTerm("");
    setSuggestions([]);
  }

  const handleFavoriteToggle = React.useCallback(async (product: any) => {
    const productId = String(product.id);
    const alreadyFavorite = favoriteIds.includes(productId);

    if (!isAuthenticated) {
      toast({
        title: "Faça login",
        description: "Entre na sua conta para salvar favoritos.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (alreadyFavorite) {
        await removeFavorite(productId);
        toast({
          title: "Removido dos favoritos",
          description: `${product.name} foi removido da sua lista.`,
        });
      } else {
        await addFavorite(productId);
        toast({
          title: "Adicionado aos favoritos",
          description: `${product.name} foi adicionado à sua lista!`,
        });
      }
    } catch (error) {
      toast({
        title: "Não foi possível atualizar",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  }, [favoriteIds, addFavorite, removeFavorite, isAuthenticated]);

  const handleSubmitSearch = React.useCallback(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    navigate(`/busca?q=${encodeURIComponent(trimmed)}`);
    handleCloseInteractiveSearch();
  }, [searchTerm, navigate, handleCloseInteractiveSearch]);

  const limitedSuggestions = React.useMemo(() => suggestions.slice(0, 8), [suggestions]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      {/* Promotional banner */}
      <div className="bg-gradient-to-r from-[#58090d] via-rose-700 to-[#58090d] text-white py-2 shadow-sm">
        <div className="marquee-wrapper">
          <div
            className="marquee-content"
            style={{ "--marquee-duration": "18s" } as React.CSSProperties}
          >
            {promotionalMessages.concat(promotionalMessages).map((message, index) => (
              <span key={`${message}-${index}`} className="text-xs md:text-sm font-medium flex-shrink-0 tracking-wide">
                {message}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-card border-b sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="mx-auto w-full max-w-[1590px] px-4 lg:px-6">
          {/* Main header layout */}
          <div className="flex items-center justify-between py-6 md:py-8">

            {/* Left: Mobile menu + search (desktop keeps logo here) */}
            <div className="flex items-center gap-3 md:gap-4 flex-1 md:flex-none">
              {/* Menu mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Menu"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              {isMenuOpen && createPortal(
                <div className="fixed inset-0 z-[999] md:hidden">
                  <div
                    className="absolute inset-0 bg-black/60"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-background shadow-2xl animate-in slide-in-from-left duration-300">
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Fechar menu"
                      className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-8 w-8" />
                    </button>
                    <div className="pt-16 pb-6 h-full overflow-y-auto">
                      <nav className="flex flex-col text-sm">
                        {categories.map((category, index) => (
                          <React.Fragment key={`mobile-category-${category.id ?? category.name}`}>
                            <Link
                              to={`/categoria/${createSlug(category.name)}`}
                              className="px-6 py-3 text-lg font-medium text-foreground"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {category.name}
                            </Link>
                            {index < categories.length - 1 && (
                              <div className="h-px bg-border/60 w-full" aria-hidden="true"></div>
                            )}
                          </React.Fragment>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>,
                document.body
              )}

              {/* Search button mobile */}
              <Link to="/" className="hidden md:flex">
                <img src={logo} alt="Femisse" className="h-10 md:h-12 lg:h-14 w-auto" />
              </Link>

              {/* Search button desktop */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => {
                  setIsInteractiveSearchOpen(true);
                  setSearchTerm("");
                  setSuggestions([]);
                }}
                aria-label="Buscar"
              >
                <Search className="h-7 w-7" strokeWidth={1} />
              </Button>
            </div>

            {/* Center: Logo mobile */}
            <div className="flex flex-1 md:hidden justify-center">
              <Link to="/">
                <img src={logo} alt="Femisse" className="h-10 w-auto" />
              </Link>
            </div>

            {/* Center: Search field (desktop) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4 justify-center">
              <button
                type="button"
                className="group relative flex w-full items-center gap-3 border border-transparent bg-muted/30 py-2.5 pl-4 pr-3 text-left text-sm text-muted-foreground transition-all "
                onClick={() => setIsInteractiveSearchOpen(true)}
                aria-label="Buscar produtos"
              >
                <Search className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.5} />
                <span className="flex-1 truncate">Buscar produtos, marcas e mais...</span>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-1 md:flex-none justify-end">
              <Button
                className="relative"
                variant="ghost"
                onClick={() => setCartOpen(true)}
                aria-label="Cestinha"
              >
                <ShoppingBag className="h-6 w-6" strokeWidth={1} />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {isAuthenticated && userData ? (
                <Button variant="ghost" onClick={() => navigate('/perfil')}>
                  <User className="h-7 w-7" strokeWidth={1} />
                </Button>
              ) : (
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 text-xs"
                    onClick={() => navigate('/login')}
                  >
                    <User className="h-7 w-7" strokeWidth={1} />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center md:pb-8">
          {/* Center: Categories (desktop only) */}
          <nav className="hidden md:flex items-center gap-6">
            {categories.map((category) => (
              <a
                key={`desktop-category-${category.id ?? category.name}`}
                href={`/categoria/${createSlug(category.name)}`}
                className="text-foreground hover:text-primary transition-colors duration-300 relative group text-sm font-medium"
              >
                {category.name}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
            ))}
          </nav>
        </div>
      </header>

      <SidebarCart open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Interactive Search Overlay - Full Modal Experience */}
      {isInteractiveSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col animate-in fade-in duration-300"
          onPointerDown={handleOverlayOuterPointerDown}
        >
          <div className="relative z-10 flex h-full flex-col pointer-events-auto">
            {/* Header with close button and search bar */}
            <div className="flex items-center justify-center py-12 px-6 border-b border-white/20 bg-black/20 backdrop-blur-sm animate-in slide-in-from-top-4 duration-500" data-interactive-search-input="true">
              {/* Search bar centered */}
              <div className="flex-1 max-w-md">
                <div className="relative" data-interactive-search-input="true">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 text-base text-white bg-transparent border-b-2 border-white/30 focus:border-white focus:bg-black/10 transition-all duration-300 outline-none placeholder:text-white/60"
                    placeholder="Digite o que você procura"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSubmitSearch();
                      }
                    }}
                    autoFocus
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                  {searchTerm && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-xl transition-colors"
                      onClick={() => {
                        setSearchTerm("");
                      }}
                      aria-label="Limpar busca"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Content area - only results */}
            <div className="flex-1 overflow-y-auto px-4 py-8">
              {searchTerm && (
                <div className="w-full px-0 md:max-w-[1500px] md:mx-auto md:px-4">
                  {loadingSuggestions ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      <span className="ml-3 text-white">Buscando produtos...</span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <>
                      {/* Products grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
                        {limitedSuggestions.map((product, index) => {
                          const rawImages = Array.isArray(product.images)
                            ? product.images.filter((img: string) => Boolean(img))
                            : [];
                          const fallbackImage = product.image_url || product.image || rawImages[0] || '';
                          const mainImage = rawImages[0]
                            ? convertToCloudinary(rawImages[0], { width: 320, height: 480, quality: 80, format: 'auto' })
                            : fallbackImage;
                          const hoverImageSource = rawImages[1] || rawImages[0] || fallbackImage;
                          const hoverImage = hoverImageSource
                            ? convertToCloudinary(hoverImageSource, { width: 320, height: 480, quality: 80, format: 'auto' })
                            : mainImage;

                          return (
                            <div
                              key={product.id}
                              className="group cursor-pointer animate-fade-in-up transform transition-all duration-300 hover:scale-105"
                              data-interactive-search-card="true"
                              style={{ animationDelay: `${index * 0.1}s` }}
                              onClick={() => {
                                handleSuggestionClick(product);
                                handleCloseInteractiveSearch();
                              }}
                            >
                              <div className="bg-white overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 relative">
                                {/* Wishlist button */}
                                <div className="absolute top-3 right-3 z-10">
                                  <button
                                    className="w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                                    data-interactive-search-action="true"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleFavoriteToggle(product);
                                    }}
                                  >
                                    <Heart
                                      className={`w-5 h-5 transition-colors ${favoriteIds.includes(String(product.id)) ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                                      fill={favoriteIds.includes(String(product.id)) ? 'currentColor' : 'none'}
                                    />
                                  </button>
                                </div>

                                {/* Product images with hover swap */}
                                <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
                                  <img
                                    src={mainImage}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                                    loading="lazy"
                                  />
                                  <img
                                    src={hoverImage}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                    loading="lazy"
                                  />
                                </div>

                                {/* Product info */}
                                <div className="py-4 px-4 text-center">
                                  <h3 className="flex items-center justify-center uppercase">
                                    {product.name}
                                  </h3>

                                  <div className="flex items-center justify-center">
                                    <div className="flex flex-col">
                                      <span className="text-xl font-bold text-gray-900">
                                        R$ {product.price?.toFixed(2) || '0,00'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* View more results */}
                      {suggestions.length > limitedSuggestions.length && (
                        <div className="text-center mt-8">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSubmitSearch();
                            }}
                            className="bg-white text-black px-8 py-3 font-bold text-base hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                            data-interactive-search-action="true"
                          >
                            VER MAIS
                          </button>
                        </div>
                      )}
                    </>
                  ) : searchTerm.trim() && !loadingSuggestions ? (
                    <div className="text-center py-12">
                      <p className="text-[#BFBFBF] text-lg">
                        Nenhum produto encontrado para sua pesquisa.
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

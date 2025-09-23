import { Search, Heart, ShoppingBag, Menu, User } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import SidebarCart from "./SidebarCart";
import { useCart } from "@/contexts/CartContext";
import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useUserData } from "../hooks/useUserData";
import { API_ENDPOINTS } from "@/config/api";
import { createSlug } from '@/utils/slugs';

// Função para truncar o nome no header
const truncateName = (name: string, maxLength: number = 8): string => {
  if (!name) return '';
  const firstName = name.split(' ')[0];
  if (firstName.length > maxLength) {
    return firstName.substring(0, maxLength) + '...';
  }
  return firstName;
};

const Header = () => {
  const [cartOpen, setCartOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<{ id: string, name: string }[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const navigate = useNavigate();
  const { favoriteIds } = useFavorites();
  const { cart } = useCart();

  React.useEffect(() => {
    fetch(API_ENDPOINTS.categories)
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Buscar sugestões ao digitar
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
        .then(data => {
          setSuggestions(data);
        })
        .finally(() => setLoadingSuggestions(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Fecha sugestões ao clicar fora
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node) &&
        !(document.getElementById("search-suggestions")?.contains(e.target as Node))
      ) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fecha sugestões ao pressionar ESC
  React.useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSuggestions([]);
      }
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  function handleSuggestionClick(product: any) {
    navigate(`/produto/${createSlug(product.name || product.nome)}`);
    setSearchTerm("");
    setSuggestions([]);
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      {/* Promotional banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-medium overflow-hidden">
        <div
          className="flex whitespace-nowrap"
          style={{
            animation: 'scroll-banner 10s linear infinite'
          }}
        >
          {[
            "★ PRIMEIRA COMPRA COM 10% DE DESCONTO",
            "★ PARCELAMENTO EM ATÉ 12X SEM JUROS",
            "★ ENVIAMOS PARA TODO BRASIL",
            "★ FRETE GRÁTIS ACIMA DE R$ 200",
            "★ DEVOLUÇÃO GRÁTIS EM 30 DIAS",
            "★ PAGAMENTO VIA PIX COM DESCONTO"
          ].concat([
            "★ PRIMEIRA COMPRA COM 10% DE DESCONTO",
            "★ PARCELAMENTO EM ATÉ 12X SEM JUROS",
            "★ ENVIAMOS PARA TODO BRASIL",
            "★ FRETE GRÁTIS ACIMA DE R$ 200",
            "★ DEVOLUÇÃO GRÁTIS EM 30 DIAS",
            "★ PAGAMENTO VIA PIX COM DESCONTO"
          ]).map((text, index) => (
            <span key={index} className="mx-12 flex-shrink-0">
              {text}
            </span>
          ))}
        </div>

        <style>{`
          @keyframes scroll-banner {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>

      {/* Main header */}
      <header className="bg-card border-b sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4">
          {/* Main header layout */}
          <div className="flex items-center justify-between py-6 md:py-8">
            {/* Center: Categories (desktop only) */}
            <nav className="hidden md:flex items-center gap-6">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`/categoria/${createSlug(category.name)}`}
                  className="text-foreground hover:text-primary transition-colors duration-300 relative group text-sm font-medium"
                >
                  {category.name}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
              ))}
            </nav>

            {/* Left: Logo + Menu mobile */}
            <div className="flex items-center gap-4">
              {/* Menu mobile */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>

              {/* Logo */}
              <Link to="/">
                <img src={logo} alt="Femisse" className="h-10 md:h-12 lg:h-14 w-auto" />
              </Link>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (searchTerm.trim()) {
                      navigate(`/busca?q=${encodeURIComponent(searchTerm)}`);
                      setSuggestions([]);
                    }
                  }}
                  className="relative"
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full px-4 py-2 pl-10 border border-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm text-foreground bg-background transition-all duration-200 shadow-sm"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  {searchTerm && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary text-lg"
                      onClick={() => setSearchTerm("")}
                      tabIndex={-1}
                      aria-label="Limpar busca"
                    >×</button>
                  )}
                  {/* Dropdown de sugestões */}
                  {searchTerm && (
                    <div id="search-suggestions" className="absolute left-0 mt-2 w-full bg-white border border-gray-200 shadow-lg z-50 max-h-64 overflow-y-auto">
                      {loadingSuggestions ? (
                        <div className="px-4 py-2 text-sm text-muted-foreground">Carregando...</div>
                      ) : suggestions.length > 0 ? (
                        suggestions.slice(0, 5).map((product) => (
                          <div
                            key={product.id}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            onClick={() => handleSuggestionClick(product)}
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={product.image_url || product.image}
                                alt={product.name || product.nome}
                                className="w-8 h-8 object-cover"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name || product.nome}
                                </div>
                                <div className="text-xs text-gray-500">
                                  R$ {product.price?.toFixed(2) || '0,00'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : searchTerm.trim() && !loadingSuggestions ? (
                        <div className="px-4 py-2 text-sm text-muted-foreground">Nenhum produto encontrado</div>
                      ) : null}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Search button for mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => navigate('/busca')}
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Link to="/perfil/favorites">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label="Favoritos"
                >
                  <Heart className="h-5 w-5" />
                  {favoriteIds.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                      {favoriteIds.length}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartOpen(true)}
                aria-label="Carrinho"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {(() => {
                const { isAuthenticated } = useAuth();
                const { userData } = useUserData();

                if (isAuthenticated && userData) {
                  return (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-1 text-xs"
                      onClick={() => navigate('/perfil')}
                    >
                      <User className="h-3 w-3 mr-1" />
                      {truncateName(userData.name || userData.nome || '')}
                    </Button>
                  );
                }

                return (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-1 text-xs"
                    onClick={() => navigate('/login')}
                  >
                    Entrar / Cadastrar
                  </Button>
                );
              })()}
            </div>
          </div>
        </div>
      </header>

      <SidebarCart open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Header;

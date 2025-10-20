import React from "react";
import { Search, ShoppingCart, User, Menu, X, Heart, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "../hooks/useUserData";
import SidebarCart from "./SidebarCart";
import { API_ENDPOINTS } from "@/config/api";
import { createSlug } from '@/utils/slugs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const assignSearchInputRef = React.useCallback((node: HTMLInputElement | null) => {
    searchInputRef.current = node;
  }, []);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const navigate = useNavigate();
  const { cart } = useCart();
  const { isAuthenticated } = useAuth();
  const { userData } = useUserData();

  React.useEffect(() => {
    fetch(API_ENDPOINTS.categories)
      .then(res => res.json())
      .then((payload) => {
        const data = Array.isArray(payload?.data) ? payload.data : payload;
        setCategories(Array.isArray(data) ? data : []);
      })
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
      if (isMobileSearchOpen) return;
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
  }, [isMobileSearchOpen]);

  // Fecha sugestões ao pressionar ESC
  React.useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSuggestions([]);
        setIsMobileSearchOpen(false);
      }
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  React.useEffect(() => {
    if (isMobileSearchOpen) {
      const timeout = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [isMobileSearchOpen]);

  function handleSuggestionClick(product: any) {
    navigate(`/produto/${createSlug(product.name || product.nome)}`);
    setSearchTerm("");
    setSuggestions([]);
    setIsMobileSearchOpen(false);
  }

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
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85%] p-0">
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <nav className="flex flex-col gap-2">
                          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Categorias</h3>
                          <div className="flex flex-col gap-2 text-sm">
                            {categories.map((category) => (
                              <Link
                                key={`mobile-category-${category.id ?? category.name}`}
                                to={`/categoria/${createSlug(category.name)}`}
                                className="py-2 text-lg font-medium text-foreground border-b border-border/60"
                              >
                                {category.name}
                              </Link>
                            ))}
                          </div>
                        </nav>
                      </div>
                      <div key="mobile-account">
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Minha conta</h3>
                        <div className="flex flex-col gap-2 text-sm">
                          <Link
                            key="mobile-favorites-link"
                            to="/perfil/favorites"
                            className="py-2 text-lg font-medium text-foreground border-b border-border/60"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Meus favoritos
                          </Link>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Ajuda</h3>
                        <div className="flex flex-col gap-2 text-sm">
                          <Link
                            key="mobile-orders-link"
                            to="/perfil/pedidos"
                            className="py-2 text-lg font-medium text-foreground border-b border-border/60"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Meus pedidos
                          </Link>
                          <Link
                            key="mobile-help-link"
                            to="/perfil/ajuda"
                            className="py-2 text-lg font-medium text-foreground border-b border-border/60"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Suporte & FAQ
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop logo */}
              <Link to="/" className="hidden md:flex">
                <img src={logo} alt="Femisse" className="h-10 md:h-12 lg:h-14 w-auto" />
              </Link>

              {/* Search button mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => {
                  setIsMobileSearchOpen(true);
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

            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (searchTerm.trim()) {
                      navigate(`/busca?q=${encodeURIComponent(searchTerm)}`);
                      setSuggestions([]);
                      setIsMobileSearchOpen(false);
                    }
                  }}
                  className="relative"
                >
                  <input
                    ref={assignSearchInputRef}
                    type="text"
                    className="w-full px-4 py-2 pl-10 border-0 border-b-2 border-muted focus:outline-none focus:border-b-primary focus:ring-0 focus:shadow-none text-sm text-foreground bg-transparent transition-all duration-200 appearance-none"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                      border: 'none',
                      borderBottom: '2px solid hsl(var(--muted))',
                      boxShadow: 'none',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderBottom = '2px solid hsl(var(--primary))';
                      e.target.style.boxShadow = 'none';
                      e.target.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderBottom = '2px solid hsl(var(--muted))';
                    }}
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

      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-start bg-background/20 backdrop-blur-[2px] px-4 pt-12 pb-8 md:hidden">
          <div
            className="absolute inset-0"
            onClick={() => {
              setIsMobileSearchOpen(false);
              setSuggestions([]);
            }}
          />
          <div className="relative w-full max-w-sm border border-muted bg-white shadow-xl pointer-events-auto rounded-sm">
            <div className="flex items-center justify-between px-4 pt-4">
              <h2 className="text-base font-semibold text-foreground">O que está procurando?</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSuggestions([]);
                }}
                aria-label="Fechar busca"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchTerm.trim()) {
                  navigate(`/busca?q=${encodeURIComponent(searchTerm)}`);
                  setSuggestions([]);
                  setIsMobileSearchOpen(false);
                }
              }}
              className="flex gap-2 px-4 pb-4"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={assignSearchInputRef}
                  type="text"
                  className="w-full border-0 border-b-2 border-muted bg-transparent px-10 py-2 text-sm text-foreground focus:border-b-primary focus:outline-none focus:ring-0"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: 'none',
                    borderBottom: '2px solid hsl(var(--muted))',
                    boxShadow: 'none',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderBottom = '2px solid hsl(var(--primary))';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottom = '2px solid hsl(var(--muted))';
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary text-lg"
                    onClick={() => {
                      setSearchTerm("");
                      setSuggestions([]);
                      searchInputRef.current?.focus();
                    }}
                    tabIndex={-1}
                    aria-label="Limpar busca"
                  >×</button>
                )}
              </div>
              <Button type="submit" variant="default" className="px-4">
                Buscar
              </Button>
            </form>
            {searchTerm && (
              <div id="search-suggestions" className="mx-4 mb-4 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow">
                {loadingSuggestions ? (
                  <div className="px-4 py-2 text-sm text-muted-foreground">Carregando...</div>
                ) : suggestions.length > 0 ? (
                  suggestions.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSuggestionClick(product)}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image_url || product.image}
                          alt={product.name || product.nome}
                          className="w-10 h-10 object-cover"
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
          </div>
        </div>
      )}

      <SidebarCart open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Header;

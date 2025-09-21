import { Search, Heart, ShoppingBag, Menu } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import SidebarCart from "./SidebarCart";
import { useCart } from "@/contexts/CartContext";
import { User } from "lucide-react";
import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useUserData } from "../hooks/useUserData";
import { API_ENDPOINTS } from "@/config/api";
import { createSlug } from '@/utils/slugs';

// Função para truncar o nome no header
const truncateName = (name: string, maxLength: number = 8): string => {
  if (!name) return '';

  // Pega apenas o primeiro nome
  const firstName = name.split(' ')[0];

  // Se o primeiro nome é maior que maxLength, trunca e adiciona "..."
  if (firstName.length > maxLength) {
    return firstName.substring(0, maxLength) + '...';
  }

  return firstName;
};

const Header = () => {
  const [cartOpen, setCartOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<{ id: string, name: string }[]>([]);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);

  React.useEffect(() => {
    fetch(API_ENDPOINTS.categories)
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Buscar sugestões ao digitar
  React.useEffect(() => {
    if (!searchOpen || searchTerm.trim().length === 0) {
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
  }, [searchTerm, searchOpen]);

  // Foco automático no input ao abrir
  React.useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Fecha busca ao clicar fora
  React.useEffect(() => {
    if (!searchOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node) &&
        !(document.getElementById("search-suggestions")?.contains(e.target as Node))
      ) {
        setSearchOpen(false);
        setSearchTerm("");
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchOpen]);

  // Fecha busca ao pressionar ESC
  React.useEffect(() => {
    if (!searchOpen) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchTerm("");
        setSuggestions([]);
      }
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [searchOpen]);

  const navigate = useNavigate();
  function handleSuggestionClick(product: any) {
    navigate(`/produto/${createSlug(product.name || product.nome)}`);
    setSearchOpen(false);
    setSearchTerm("");
    setSuggestions([]);
  }

  return (
    <>
      {/* Promotional banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-medium marquee-wrapper">
        <div className="marquee-content">
          <span className="mx-12">
            ★ PRIMEIRA COMPRA | PARCELAMENTO EM ATÉ 3X SEM JUROS | ENVIAMOS PARA TODO BRASIL | FRETE GRÁTIS A PARTIR DE R$149 ★
          </span>
          <span className="mx-12" aria-hidden="true">
            ★ PRIMEIRA COMPRA | PARCELAMENTO EM ATÉ 3X SEM JUROS | ENVIAMOS PARA TODO BRASIL | FRETE GRÁTIS A PARTIR DE R$149 ★
          </span>
          <span className="mx-12" aria-hidden="true">
            ★ PRIMEIRA COMPRA | PARCELAMENTO EM ATÉ 3X SEM JUROS | ENVIAMOS PARA TODO BRASIL | FRETE GRÁTIS A PARTIR DE R$149 ★
          </span>
          <span className="mx-12" aria-hidden="true">
            ★ PRIMEIRA COMPRA | PARCELAMENTO EM ATÉ 3X SEM JUROS | ENVIAMOS PARA TODO BRASIL | FRETE GRÁTIS A PARTIR DE R$149 ★
          </span>
          <span className="mx-12" aria-hidden="true">
            ★ PRIMEIRA COMPRA | PARCELAMENTO EM ATÉ 3X SEM JUROS | ENVIAMOS PARA TODO BRASIL | FRETE GRÁTIS A PARTIR DE R$149 ★
          </span>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-card border-b sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4">
          {/* Top navigation */}
          <nav className="hidden md:flex items-center justify-center gap-8 py-4 text-sm font-medium">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`/categoria/${createSlug(category.name)}`}
                className="text-foreground hover:text-primary transition-colors duration-300 relative group"
              >
                {category.name}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
            ))}
          </nav>

          {/* Logo and actions */}
          <div className="flex items-center justify-between py-4 border-t md:border-t-0">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>

            <div className="">
              <a href="/"><img src={logo} alt="" className="h-8" /></a>
            </div>

            <div className="flex items-center gap-2">
              {searchOpen ? (
                <div className="relative">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (searchTerm.trim()) {
                        navigate(`/busca?q=${encodeURIComponent(searchTerm)}`);
                        setSearchOpen(false);
                        setSuggestions([]);
                      }
                    }}
                    className="relative"
                  >
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="px-3 py-1.5 rounded-md border border-primary focus:outline-none focus:ring-2 focus:ring-primary w-40 md:w-64 text-sm text-foreground bg-background transition-all duration-200 shadow"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary text-xs"
                        onClick={() => setSearchTerm("")}
                        tabIndex={-1}
                        aria-label="Limpar busca"
                      >×</button>
                    )}
                    {/* Dropdown de sugestões */}
                    {searchTerm && (
                      <div id="search-suggestions" className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                        {loadingSuggestions ? (
                          <div className="px-4 py-2 text-sm text-muted-foreground">Carregando...</div>
                        ) : suggestions.length > 0 ? (
                          suggestions.map(s => (
                            <button
                              key={s.id}
                              type="button"
                              className="w-full text-left px-4 py-2 hover:bg-pink-50 text-sm text-foreground"
                              onClick={e => {
                                e.preventDefault();
                                handleSuggestionClick(s);
                              }}
                            >
                              {s.name || s.nome}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-muted-foreground">Nenhum resultado encontrado.</div>
                        )}
                      </div>
                    )}
                  </form>
                  {searchTerm && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary text-xs"
                      onClick={() => setSearchTerm("")}
                      tabIndex={-1}
                    >×</button>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-pink-light hover:text-primary transition-colors duration-300"
                  aria-label="Abrir busca"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center gap-2 md:gap-4">
                {(() => {
                  const { user, isAuthenticated, logout } = useAuth();
                  const { userData } = useUserData();

                  if (isAuthenticated && user) {
                    const displayName = userData?.nome || user.nome || '';

                    return (
                      <>
                        <span className="hidden md:inline text-sm font-medium text-muted-foreground mr-2">Olá, {truncateName(displayName)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:bg-pink-light hover:text-primary transition-colors duration-300"
                          onClick={() => window.location.href = '/perfil'}
                          aria-label="Perfil de usuário"
                        >
                          <User className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:bg-pink-light hover:text-primary transition-colors duration-300"
                          onClick={() => window.location.href = '/perfil?sec=favorites'}
                          aria-label="Favoritos"
                        >
                          <Heart className="h-5 w-5" />
                          {(() => {
                            const { favoriteIds, loading } = useFavorites();
                            return !loading && favoriteIds.length > 0 ? (
                              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-bold border-2 border-white shadow">
                                {favoriteIds.length}
                              </span>
                            ) : null;
                          })()}
                        </Button>
                        <Button variant="ghost" size="icon" className="relative hover:bg-pink-light hover:text-primary transition-colors duration-300" onClick={() => setCartOpen(true)}>
                          <ShoppingBag className="h-5 w-5" />
                          {(() => {
                            const { cart } = useCart();
                            const count = cart.reduce((acc, item) => acc + item.quantity, 0);
                            return count > 0 ? (
                              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {count}
                              </span>
                            ) : null;
                          })()}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-1 text-xs"
                          onClick={logout}
                        >
                          Sair
                        </Button>
                      </>
                    );
                  }
                  return (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-1 text-xs"
                      onClick={() => window.location.href = '/login'}
                    >
                      Entrar / Cadastrar
                    </Button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <SidebarCart open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Header;
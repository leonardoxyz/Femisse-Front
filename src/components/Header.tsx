import { Search, Heart, ShoppingBag, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const categories = [
    "WINTER COLLECTION",
    "PROMOS", 
    "TODA LOJA",
    "CROPPEDS",
    "SAIAS",
    "BODIES",
    "VESTIDOS",
    "CALÇAS"
  ];

  return (
    <>
      {/* Promotional banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-medium overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          ★ PRIMEIRA COMPRA | PARCELAMENTO EM ATÉ 3X SEM JUROS | ENVIAMOS PARA TODO BRASIL | FRETE GRÁTIS A PARTIR DE R$149 ★
        </div>
      </div>

      {/* Main header */}
      <header className="bg-card border-b sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4">
          {/* Top navigation */}
          <nav className="hidden md:flex items-center justify-center gap-8 py-4 text-sm font-medium">
            {categories.map((category) => (
              <a
                key={category}
                href="#"
                className="text-foreground hover:text-primary transition-colors duration-300 relative group"
              >
                {category}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
            ))}
          </nav>

          {/* Logo and actions */}
          <div className="flex items-center justify-between py-4 border-t md:border-t-0">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1 flex justify-center">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Motta
                <span className="text-primary italic font-light">conf</span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hover:bg-pink-light hover:text-primary transition-colors duration-300">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-pink-light hover:text-primary transition-colors duration-300">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-pink-light hover:text-primary transition-colors duration-300">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative hover:bg-pink-light hover:text-primary transition-colors duration-300">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

    </>
  );
};

export default Header;
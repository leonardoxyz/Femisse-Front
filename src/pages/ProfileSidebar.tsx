import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { NavLink } from "react-router-dom";
import { 
  User, 
  MapPin, 
  Heart, 
  ShoppingBag, 
  CreditCard, 
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "profile", label: "Meus Dados", icon: User, path: "/profile" },
  { id: "addresses", label: "Endereços", icon: MapPin, path: "/profile/addresses" },
  { id: "favorites", label: "Favoritos", icon: Heart, path: "/profile/favorites" },
  { id: "orders", label: "Histórico de Compras", icon: ShoppingBag, path: "/profile/orders" },
  { id: "cards", label: "Cartões Salvos", icon: CreditCard, path: "/profile/cards" },
];

interface ProfileSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export function ProfileSidebar({ currentSection, onSectionChange }: ProfileSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full justify-center"
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          <span className="ml-2">Menu do Perfil</span>
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "lg:block w-full lg:w-64 bg-card border border-border rounded-lg",
        isMobileOpen ? "block" : "hidden"
      )}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Olá, {user?.nome || user?.email || "Usuário"}
              </h3>
              <p className="text-sm text-muted-foreground">Bem-vindo de volta!</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-border">
            <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
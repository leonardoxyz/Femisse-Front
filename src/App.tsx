import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductDetails from "./pages/ProductDetails";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";
import ProductsByCategory from "./pages/ProductsByCategory";
import Profile from "./pages/Profile";
import AuthPage from "./pages/AuthPage";
import CheckoutPage from "./pages/Checkout";
import PrivateRoute from "./components/PrivateRoute";
import CookieConsentManager from "./components/CookieConsentManager";

const queryClient = new QueryClient();

import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { CartProvider } from "@/contexts/CartContext";
import { ShippingProvider } from "@/contexts/ShippingContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CartProvider>
        <FavoritesProvider>
          <ShippingProvider>
            <CookieConsentProvider>
              <BrowserRouter>
                <CookieConsentManager />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/produto/:slug" element={<ProductDetails />} />
                  <Route path="/categoria/:slug" element={<ProductsByCategory />} />
                  <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/perfil/:section" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/busca" element={<SearchResults />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </CookieConsentProvider>
          </ShippingProvider>
        </FavoritesProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;

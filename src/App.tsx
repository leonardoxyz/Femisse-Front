import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import PrivateRoute from "./components/PrivateRoute";
import CookieConsentManager from "./components/CookieConsentManager";

// Lazy loading de páginas para melhor performance
const Index = lazy(() => import("./pages/Index"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const ProductsByCategory = lazy(() => import("./pages/ProductsByCategory"));
const Profile = lazy(() => import("./pages/Profile"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const CheckoutPage = lazy(() => import("./pages/Checkout"));
const OrderHistory = lazy(() => import("./components/profile/OrderHistory"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#58090d] border-t-transparent"></div>
  </div>
);

// QueryClient com configurações otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { CartProvider } from "@/contexts/CartContext";
import { ShippingProvider } from "@/contexts/ShippingContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";

const App = () => (
  <ErrorBoundary>
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
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/produto/:slug" element={<ProductDetails />} />
                      <Route path="/categoria/:slug" element={<ProductsByCategory />} />
                      <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
                      <Route path="/perfil/:section" element={<PrivateRoute><Profile /></PrivateRoute>} />
                      <Route path="/perfil/pedidos" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
                      <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
                      <Route path="/login" element={<AuthPage />} />
                      <Route path="/busca" element={<SearchResults />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </CookieConsentProvider>
            </ShippingProvider>
          </FavoritesProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
export default App;

import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from "./components/ErrorBoundary";
import PrivateRoute from "./components/PrivateRoute";
import CookieConsentManager from "./components/CookieConsentManager";
import { setupApiInterceptor } from "./utils/apiInterceptor";

// Lazy loading de páginas para melhor performance
const Index = lazy(() => import("./pages/Index"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const ProductsByCategory = lazy(() => import("./pages/ProductsByCategory"));
const BestSellers = lazy(() => import("./pages/BestSellers"));
const Profile = lazy(() => import("./pages/Profile"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const CheckoutPage = lazy(() => import("./pages/Checkout"));
const OrderHistory = lazy(() => import("./components/profile/OrderHistory"));
// Páginas de políticas
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const PaymentPolicy = lazy(() => import("./pages/PaymentPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));

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
      // Dev: 30s, Prod: 2min
      staleTime: import.meta.env.DEV ? 30 * 1000 : 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
      refetchOnWindowFocus: import.meta.env.DEV, // Revalidar em dev ao focar janela
      retry: 1,
    },
  },
});

import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { CartProvider } from "@/contexts/CartContext";
import { ShippingProvider } from "@/contexts/ShippingContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { AuthProvider } from "@/contexts/AuthContext";

const App = () => {
  // ✅ Configura interceptor de API ao montar
  useEffect(() => {
    setupApiInterceptor();
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
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
                        <Route path="/mais-vendidos" element={<BestSellers />} />
                        <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
                        <Route path="/perfil/:section" element={<PrivateRoute><Profile /></PrivateRoute>} />
                        <Route path="/perfil/pedidos" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
                        <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/busca" element={<SearchResults />} />
                        {/* Páginas de políticas */}
                        <Route path="/termos-de-uso" element={<TermsOfService />} />
                        <Route path="/privacidade" element={<PrivacyPolicy />} />
                        <Route path="/pagamento" element={<PaymentPolicy />} />
                        <Route path="/entregas-frete" element={<ShippingPolicy />} />
                        <Route path="/trocas-devolucoes" element={<ReturnPolicy />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </CookieConsentProvider>
              </ShippingProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
      </HelmetProvider>
  </ErrorBoundary>
  );
};

export default App;

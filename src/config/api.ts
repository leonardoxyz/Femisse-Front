// Configuração centralizada da API
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (isDevelopment ? 'http://localhost:4000' : 'https://femisse-back2.vercel.app');

// URLs específicas para diferentes endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: `${API_BASE_URL}/api/auth`,
  
  // User Management
  users: `${API_BASE_URL}/api/usuarios`, // Admin routes
  userProfile: `${API_BASE_URL}/api/usuarios/profile`, // User profile
  
  // Products
  products: `${API_BASE_URL}/api/products`,
  
  // Images
  images: `${API_BASE_URL}/api/images`,
  
  // Categories
  categories: `${API_BASE_URL}/api/categories`,
  
  // Banner Images
  bannerImages: `${API_BASE_URL}/api/banner-images`,
  
  // Moment Products
  momentProducts: `${API_BASE_URL}/api/moment-products`,
  
  // Popular Products
  popular: `${API_BASE_URL}/api/popular`,
  
  // User Favorites
  favorites: `${API_BASE_URL}/api/users/me/favorites`,
  
  // Address Management
  userAddresses: `${API_BASE_URL}/api/address/user/addresses`, // User addresses
  address: `${API_BASE_URL}/api/address`,
  
  // Order Management
  orders: `${API_BASE_URL}/api/orders`, // Admin routes
  userOrders: `${API_BASE_URL}/api/orders/user/orders`, // User orders
  reviews: `${API_BASE_URL}/api/orders/user/reviews`,
  reviewableProducts: `${API_BASE_URL}/api/orders/user/reviewable-products`,
  reviewStats: `${API_BASE_URL}/api/orders/products`,

  // Payment Cards
  cards: `${API_BASE_URL}/api/cards`, // Admin routes
  userCards: `${API_BASE_URL}/api/cards/user/cards` // User cards
} as const;
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>) => {
  let url = endpoint;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/utils/api";
import { API_ENDPOINTS } from "@/config/api";
import { logger } from "@/utils/logger";
import { useAuth } from "@/hooks/useAuth";

interface FavoritesContextType {
  favoriteIds: string[];
  loading: boolean;
  addFavorite: (id: string) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      setFavoriteIds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // api já envia cookies automaticamente
      const response = await api.get(`${API_ENDPOINTS.favorites}`);
      setFavoriteIds(response.data);
    } catch (error) {
      logger.error('Erro ao buscar favoritos:', error);
      setFavoriteIds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated]);

  const addFavorite = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      await api.post(`${API_ENDPOINTS.favorites}`, { productId: id });
      setFavoriteIds((prev) => prev.includes(id) ? prev : [...prev, id]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const removeFavorite = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      await api.delete(`${API_ENDPOINTS.favorites}/${id}`);
      setFavoriteIds((prev) => prev.filter((fid) => fid !== id));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, loading, addFavorite, removeFavorite, refreshFavorites: fetchFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}

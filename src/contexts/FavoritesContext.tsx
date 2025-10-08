import React, { createContext, useContext, useEffect, useState } from "react";
import { logger } from "@/utils/logger";

interface FavoritesContextType {
  favoriteIds: string[];
  loading: boolean;
  addFavorite: (id: string) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const getStoredToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(getStoredToken());

  const fetchFavorites = async () => {
    const currentToken = getStoredToken();
    setToken(currentToken);
    if (!currentToken) {
      setFavoriteIds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { API_ENDPOINTS } = await import('@/config/api');
    try {
      const res = await fetch(`${API_ENDPOINTS.favorites}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) {
        throw new Error(`Erro ao buscar favoritos: ${res.status}`);
      }
      const ids = await res.json();
      setFavoriteIds(ids);
    } catch (error) {
      logger.error('Erro ao buscar favoritos:', error);
      setFavoriteIds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line
  }, [token]);

  const addFavorite = async (id: string) => {
    const currentToken = getStoredToken();
    setToken(currentToken);
    if (!currentToken) return;
    const { API_ENDPOINTS } = await import('@/config/api');
    try {
      const res = await fetch(`${API_ENDPOINTS.favorites}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ productId: id }),
      });
      if (!res.ok) {
        throw new Error(`Erro ao adicionar favorito: ${res.status}`);
      }
      setFavoriteIds((prev) => prev.includes(id) ? prev : [...prev, id]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const removeFavorite = async (id: string) => {
    const currentToken = getStoredToken();
    setToken(currentToken);
    if (!currentToken) return;
    const { API_ENDPOINTS } = await import('@/config/api');
    try {
      const res = await fetch(`${API_ENDPOINTS.favorites}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) {
        throw new Error(`Erro ao remover favorito: ${res.status}`);
      }
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

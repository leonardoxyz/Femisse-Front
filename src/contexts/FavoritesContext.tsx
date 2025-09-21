import React, { createContext, useContext, useEffect, useState } from "react";

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
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchFavorites = async () => {
    if (!token) {
      setFavoriteIds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { API_ENDPOINTS } = await import('@/config/api');
    const res = await fetch(`${API_ENDPOINTS.favorites}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const ids = await res.json();
    setFavoriteIds(ids);
    setLoading(false);
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line
  }, [token]);

  const addFavorite = async (id: string) => {
    if (!token) return;
    const { API_ENDPOINTS } = await import('@/config/api');
    await fetch(`${API_ENDPOINTS.favorites}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: id }),
    });
    setFavoriteIds((prev) => prev.includes(id) ? prev : [...prev, id]);
  };

  const removeFavorite = async (id: string) => {
    if (!token) return;
    const { API_ENDPOINTS } = await import('@/config/api');
    await fetch(`${API_ENDPOINTS.favorites}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setFavoriteIds((prev) => prev.filter((fid) => fid !== id));
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

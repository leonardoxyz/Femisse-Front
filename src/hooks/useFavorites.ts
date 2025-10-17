import { useEffect, useState } from "react";
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/config/api';
import { tokenStorage } from '@/utils/tokenStorage';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.getAccessToken();

    if (!token) {
      setFavoriteIds([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api.get<string[]>(API_ENDPOINTS.favorites, { requiresAuth: true })
      .then((ids) => {
        if (!cancelled && Array.isArray(ids)) {
          setFavoriteIds(ids);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFavoriteIds([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { favoriteIds, loading };
}

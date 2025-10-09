import { useEffect, useState } from "react";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      setFavoriteIds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/favorites", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((ids) => setFavoriteIds(ids))
      .finally(() => setLoading(false));
  }, [token]);

  return { favoriteIds, loading };
}

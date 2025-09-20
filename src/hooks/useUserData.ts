import { useEffect, useState } from "react";
import axios from "axios";
import { getUserFromToken, getToken } from "./useAuth";

const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    || 'http://localhost:4000/api';

export function useUserData() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = getUserFromToken();

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/usuarios/${user.id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setUserData(res.data);
      } catch {
        setUserData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.id]);

  const updateUserData = (newData: any) => {
    setUserData((prevData: any) => ({
      ...prevData,
      ...newData
    }));
  };

  return { userData, loading, updateUserData };
}

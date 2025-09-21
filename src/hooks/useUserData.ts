import { useEffect, useState } from "react";
import axios from "axios";
import { getUserFromToken, getToken } from "./useAuth";
import { API_ENDPOINTS } from "@/config/api";

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
        const res = await axios.get(API_ENDPOINTS.userProfile, {
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

import { useEffect, useState } from "react";
import api from "@/utils/api";
import { useAuth } from "./useAuth";
import { API_ENDPOINTS } from "@/config/api";

export function useUserData() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchData() {
      if (!isAuthenticated) {
        setLoading(false);
        setUserData(null);
        return;
      }
      try {
        const res = await api.get(API_ENDPOINTS.userProfile);
        const payload = res.data?.data ?? res.data;
        setUserData(payload);
      } catch (error) {
        setUserData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAuthenticated]);

  const updateUserData = (newData: any) => {
    setUserData((prevData: any) => ({
      ...prevData,
      ...newData
    }));
  };

  return { userData, loading, updateUserData };
}

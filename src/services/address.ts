import api from "@/utils/api";
import { API_ENDPOINTS } from "@/config/api";

export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

interface FetchAddressesOptions {
  signal?: AbortSignal;
}

export async function fetchUserAddresses(
  options: FetchAddressesOptions = {}
): Promise<Address[]> {
  try {
    const response = await api.get(API_ENDPOINTS.userAddresses, {
      signal: options.signal,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || "Erro ao buscar endereços";
    throw new Error(message);
  }
}

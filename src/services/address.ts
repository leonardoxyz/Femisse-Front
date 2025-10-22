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
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    const message = error.response?.data?.error || "Erro ao buscar endereços";
    throw new Error(message);
  }
}

export async function createAddress(address: Omit<Address, 'id' | 'created_at' | 'updated_at'>): Promise<Address> {
  try {
    const response = await api.post(API_ENDPOINTS.userAddresses, address);
    return response.data?.data || response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || "Erro ao criar endereço";
    throw new Error(message);
  }
}

export async function updateAddress(id: string, address: Partial<Address>): Promise<Address> {
  try {
    const response = await api.put(`${API_ENDPOINTS.userAddresses}/${id}`, address);
    return response.data?.data || response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || "Erro ao atualizar endereço";
    throw new Error(message);
  }
}

export async function deleteAddress(id: string): Promise<void> {
  try {
    await api.delete(`${API_ENDPOINTS.userAddresses}/${id}`);
  } catch (error: any) {
    const message = error.response?.data?.error || "Erro ao deletar endereço";
    throw new Error(message);
  }
}

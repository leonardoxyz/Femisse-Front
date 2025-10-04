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
  token: string,
  options: FetchAddressesOptions = {}
): Promise<Address[]> {
  const { signal } = options;

  const response = await fetch(API_ENDPOINTS.userAddresses, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    let message = "Erro ao buscar endereços";
    try {
      const data = await response.json();
      if (typeof data?.error === "string") {
        message = data.error;
      }
    } catch {
      // ignore JSON parsing errors
    }
    throw new Error(message);
  }

  const data = (await response.json()) as Address[];
  return data;
}

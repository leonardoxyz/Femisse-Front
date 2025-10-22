import React from 'react';
import { logger } from '@/utils/logger';
import { secureLocalStorage } from '@/utils/secureStorage';

export interface ShippingAddress {
  cep: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

export interface ShippingInfo {
  cep: string;
  address: ShippingAddress | null;
  shippingCost: number | null;
  lastUpdatedAt?: number;
  source?: "manual" | "auto" | null;
}

interface ShippingContextValue {
  shippingInfo: ShippingInfo;
  updateShippingInfo: (partial: Partial<ShippingInfo>) => void;
  resetShippingInfo: () => void;
}

const ShippingContext = React.createContext<ShippingContextValue | undefined>(undefined);

const SHIPPING_STORAGE_KEY = 'femisse-shipping';

const defaultState: ShippingInfo = {
  cep: "",
  address: null,
  shippingCost: null,
  lastUpdatedAt: undefined,
  source: null,
};

const loadShippingFromStorage = (): ShippingInfo => {
  try {
    const stored = secureLocalStorage.getItem<ShippingInfo>(SHIPPING_STORAGE_KEY);
    return stored || defaultState;
  } catch (error) {
    logger.error('Erro ao carregar dados de frete do armazenamento seguro:', error);
    return defaultState;
  }
};

const saveShippingToStorage = (shippingInfo: ShippingInfo) => {
  try {
    secureLocalStorage.setItem<ShippingInfo>(SHIPPING_STORAGE_KEY, shippingInfo, 30 * 24 * 60 * 60 * 1000); // 30 dias
  } catch (error) {
    logger.error('Erro ao salvar dados de frete no armazenamento seguro:', error);
  }
};

export const ShippingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shippingInfo, setShippingInfo] = React.useState<ShippingInfo>(loadShippingFromStorage);

  // Salva no armazenamento seguro sempre que os dados de frete mudam
  React.useEffect(() => {
    saveShippingToStorage(shippingInfo);
  }, [shippingInfo]);

  const updateShippingInfo = React.useCallback((partial: Partial<ShippingInfo>) => {
    setShippingInfo((prev) => ({
      ...prev,
      ...partial,
      lastUpdatedAt: Date.now(),
    }));
  }, []);

  const resetShippingInfo = React.useCallback(() => {
    setShippingInfo(defaultState);
  }, []);

  const value = React.useMemo(() => ({ shippingInfo, updateShippingInfo, resetShippingInfo }), [shippingInfo, updateShippingInfo, resetShippingInfo]);

  return <ShippingContext.Provider value={value}>{children}</ShippingContext.Provider>;
};

export const useShipping = (): ShippingContextValue => {
  const context = React.useContext(ShippingContext);
  if (!context) {
    throw new Error("useShipping must be used within a ShippingProvider");
  }
  return context;
};

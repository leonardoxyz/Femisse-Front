import React, { createContext, useContext, useState } from "react";
import { logger } from "@/utils/logger-unified";
import { secureLocalStorage } from "@/utils/secureStorage";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  size?: string;
  quantity: number;
}

interface CartContextProps {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string, size?: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const CART_STORAGE_KEY = 'cart';

/**
 * Valida item do carrinho
 */
const isValidCartItem = (item: unknown): item is CartItem => {
  if (!item || typeof item !== 'object') return false;
  const i = item as CartItem;
  return (
    typeof i.id === 'string' &&
    typeof i.name === 'string' &&
    typeof i.price === 'number' &&
    typeof i.quantity === 'number' &&
    i.id.length > 0 &&
    i.name.length > 0 &&
    i.price >= 0 &&
    i.quantity > 0 &&
    i.quantity <= 100 // Limite razoável
  );
};

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = secureLocalStorage.getItem<CartItem[]>(CART_STORAGE_KEY);
    if (!stored || !Array.isArray(stored)) return [];
    
    // Valida cada item
    return stored.filter(isValidCartItem);
  } catch (error) {
    logger.error('Erro ao carregar carrinho:', error);
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]) => {
  try {
    // Valida e filtra itens antes de salvar
    const validCart = cart.filter(isValidCartItem);
    secureLocalStorage.setItem(CART_STORAGE_KEY, validCart, 30 * 24 * 60 * 60 * 1000); // 30 dias
  } catch (error) {
    logger.error('Erro ao salvar carrinho:', error);
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(loadCartFromStorage);

  // Salva no localStorage sempre que o carrinho muda
  React.useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const addToCart = React.useCallback((item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id && i.size === item.size);
      if (exists) {
        return prev.map((i) =>
          i.id === item.id && i.size === item.size ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = React.useCallback((id: string, size?: string) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && (size ? i.size === size : true))));
  }, []);

  const clearCart = React.useCallback(() => {
    setCart([]);
  }, []);

  const updateQuantity = React.useCallback((id: string, quantity: number, size?: string) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => !(i.id === id && (size ? i.size === size : true)));
      }
      return prev.map((i) => (i.id === id && (size ? i.size === size : true) ? { ...i, quantity } : i));
    });
  }, []);

  const value = React.useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity
  }), [cart, addToCart, removeFromCart, clearCart, updateQuantity]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

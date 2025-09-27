import React, { createContext, useContext, useState } from "react";

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

const CART_STORAGE_KEY = 'feminisse-cart';

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao carregar carrinho do localStorage:', error);
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Erro ao salvar carrinho no localStorage:', error);
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

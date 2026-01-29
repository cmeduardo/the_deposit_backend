"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { cartApi, CarritoCompra, ItemCarrito } from "./api";
import { useAuth } from "./auth-context";

interface CartContextType {
  cart: CarritoCompra | null;
  items: ItemCarrito[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  addItem: (presentacionId: number, cantidad: number) => Promise<void>;
  updateItem: (itemId: number, cantidad: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CarritoCompra | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    setIsLoading(true);
    try {
      const cartData = await cartApi.getCart();
      setCart(cartData);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const items = cart?.Items || [];
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);
  const total = items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0);

  const addItem = async (presentacionId: number, cantidad: number) => {
    await cartApi.addItem(presentacionId, cantidad);
    await refreshCart();
  };

  const updateItem = async (itemId: number, cantidad: number) => {
    if (cantidad <= 0) {
      await removeItem(itemId);
      return;
    }
    await cartApi.updateItem(itemId, cantidad);
    await refreshCart();
  };

  const removeItem = async (itemId: number) => {
    await cartApi.removeItem(itemId);
    await refreshCart();
  };

  const clearCart = async () => {
    await cartApi.clearCart();
    await refreshCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        total,
        isLoading,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

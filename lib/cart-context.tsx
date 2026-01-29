"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { carritoApi, type Carrito, type ItemCarrito, type ConfirmarCarritoInput } from "./api";
import { useAuth } from "./auth-context";

interface CartContextType {
  carrito: Carrito | null;
  isLoading: boolean;
  itemCount: number;
  total: number;
  agregarItem: (id_presentacion_producto: number, cantidad: number, notas?: string) => Promise<void>;
  actualizarItem: (id: number, cantidad: number) => Promise<void>;
  eliminarItem: (id: number) => Promise<void>;
  vaciarCarrito: () => Promise<void>;
  confirmarPedido: (data: ConfirmarCarritoInput) => Promise<{ pedido_id: number; total_general: number }>;
  refetch: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCarrito = useCallback(async () => {
    if (!token) {
      setCarrito(null);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await carritoApi.obtener(token);
      setCarrito(data);
    } catch (error) {
      console.error("Error cargando carrito:", error);
      setCarrito(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCarrito();
    } else {
      setCarrito(null);
    }
  }, [isAuthenticated, fetchCarrito]);

  const agregarItem = async (id_presentacion_producto: number, cantidad: number, notas?: string) => {
    if (!token) throw new Error("No autenticado");
    const response = await carritoApi.agregarItem(token, id_presentacion_producto, cantidad, notas);
    setCarrito(response.carrito);
  };

  const actualizarItem = async (id: number, cantidad: number) => {
    if (!token) throw new Error("No autenticado");
    await carritoApi.actualizarItem(token, id, { cantidad_unidad_venta: cantidad });
    await fetchCarrito();
  };

  const eliminarItem = async (id: number) => {
    if (!token) throw new Error("No autenticado");
    await carritoApi.eliminarItem(token, id);
    await fetchCarrito();
  };

  const vaciarCarrito = async () => {
    if (!token) throw new Error("No autenticado");
    await carritoApi.vaciar(token);
    await fetchCarrito();
  };

  const confirmarPedido = async (data: ConfirmarCarritoInput) => {
    if (!token) throw new Error("No autenticado");
    const response = await carritoApi.confirmar(token, data);
    await fetchCarrito();
    return { pedido_id: response.pedido_id, total_general: response.total_general };
  };

  const itemCount = carrito?.items?.reduce((acc, item) => acc + parseFloat(item.cantidad_unidad_venta), 0) || 0;
  const total = carrito?.items?.reduce((acc, item) => acc + parseFloat(item.subtotal_linea), 0) || 0;

  const value: CartContextType = {
    carrito,
    isLoading,
    itemCount,
    total,
    agregarItem,
    actualizarItem,
    eliminarItem,
    vaciarCarrito,
    confirmarPedido,
    refetch: fetchCarrito,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}

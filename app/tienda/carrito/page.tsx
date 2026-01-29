"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

export default function CarritoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { carrito, itemCount, total, actualizarItem, eliminarItem, vaciarCarrito, isLoading } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  if (authLoading || isLoading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Inicia sesión para ver tu carrito</h1>
        <p className="text-muted-foreground mb-6">
          Necesitas una cuenta para agregar productos a tu carrito
        </p>
        <Button asChild>
          <Link href="/login?redirect=/tienda/carrito">Iniciar Sesión</Link>
        </Button>
      </div>
    );
  }

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await actualizarItem(itemId, newQuantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await eliminarItem(itemId);
      toast({
        title: "Eliminado",
        description: "Producto eliminado del carrito",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await vaciarCarrito();
      toast({
        title: "Carrito vaciado",
        description: "Se eliminaron todos los productos",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito",
        variant: "destructive",
      });
    }
  };

  if (!carrito?.items || carrito.items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-6">
          Explora nuestro catálogo y agrega productos
        </p>
        <Button asChild>
          <Link href="/tienda">Ver Catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Carrito de Compras</h1>
          <p className="text-muted-foreground">
            {Math.round(itemCount)} {itemCount === 1 ? "producto" : "productos"}
          </p>
        </div>
        <Button variant="outline" onClick={handleClearCart}>
          Vaciar Carrito
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {carrito.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl text-muted-foreground">
                      {item.presentacion?.producto?.nombre?.charAt(0) || "P"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {item.presentacion?.producto?.nombre || "Producto"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.presentacion?.nombre || "Presentación"}
                    </p>
                    <p className="text-sm text-primary font-medium mt-1">
                      Q{parseFloat(item.precio_unitario).toFixed(2)} c/u
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updatingItems.has(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, parseFloat(item.cantidad_unidad_venta) - 1)}
                        disabled={updatingItems.has(item.id) || parseFloat(item.cantidad_unidad_venta) <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-10 text-center text-sm">
                        {updatingItems.has(item.id) ? (
                          <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                        ) : (
                          Math.round(parseFloat(item.cantidad_unidad_venta))
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, parseFloat(item.cantidad_unidad_venta) + 1)}
                        disabled={updatingItems.has(item.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-bold">Q{parseFloat(item.subtotal_linea).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({Math.round(itemCount)} productos)</span>
                <span>Q{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-muted-foreground">Por calcular</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">Q{total.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg" asChild>
                <Link href="/tienda/checkout">
                  Proceder al Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tienda">Seguir Comprando</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

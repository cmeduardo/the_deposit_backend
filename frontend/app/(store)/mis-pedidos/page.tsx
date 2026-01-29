"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/lib/auth-context";
import { ordersApi } from "@/lib/api";
import { formatCurrency, formatDateTime, getOrderStatusColor, getOrderStatusLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, Eye, X, ShoppingBag } from "lucide-react";

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<number | null>(null);

  const { data: ordersData, isLoading, mutate } = useSWR(
    isAuthenticated ? ["my-orders", statusFilter] : null,
    () => ordersApi.getAll({
      estado: statusFilter === "all" ? undefined : statusFilter,
    })
  );

  const { data: orderDetails, isLoading: loadingDetails } = useSWR(
    selectedOrder ? ["order-details", selectedOrder] : null,
    () => ordersApi.getOne(selectedOrder!)
  );

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login?redirect=/mis-pedidos");
    return null;
  }

  const handleCancelOrder = async (orderId: number) => {
    setCancellingOrder(orderId);
    try {
      await ordersApi.cancel(orderId);
      toast({
        title: "Pedido cancelado",
        description: "Tu pedido ha sido cancelado exitosamente",
      });
      mutate();
      setSelectedOrder(null);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "No se pudo cancelar el pedido",
        variant: "destructive",
      });
    } finally {
      setCancellingOrder(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Pedidos</h1>
          <p className="text-muted-foreground">Historial y estado de tus pedidos</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
            <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
            <SelectItem value="EN_PREPARACION">En Preparación</SelectItem>
            <SelectItem value="ENVIADO">Enviado</SelectItem>
            <SelectItem value="ENTREGADO">Entregado</SelectItem>
            <SelectItem value="CANCELADO">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : ordersData?.pedidos && ordersData.pedidos.length > 0 ? (
        <div className="space-y-4">
          {ordersData.pedidos.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Pedido #{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(order.fecha)}
                    </p>
                    <p className="mt-1 text-sm">
                      {order.tipo_entrega === "DOMICILIO" ? "Entrega a domicilio" : "Recoger en tienda"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <Badge className={getOrderStatusColor(order.estado)}>
                    {getOrderStatusLabel(order.estado)}
                  </Badge>
                  <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
                </div>
                <div className="flex gap-2">
                  <Dialog open={selectedOrder === order.id} onOpenChange={(open) => setSelectedOrder(open ? order.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        Ver Detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Pedido #{order.id}</DialogTitle>
                        <DialogDescription>
                          {formatDateTime(order.fecha)}
                        </DialogDescription>
                      </DialogHeader>
                      {loadingDetails ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : orderDetails ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Estado:</span>
                            <Badge className={getOrderStatusColor(orderDetails.estado)}>
                              {getOrderStatusLabel(orderDetails.estado)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Tipo de entrega:</span>
                            <span className="text-sm">
                              {orderDetails.tipo_entrega === "DOMICILIO" ? "Domicilio" : "Recoger en tienda"}
                            </span>
                          </div>
                          {orderDetails.direccion_entrega && (
                            <div>
                              <span className="text-sm text-muted-foreground">Dirección:</span>
                              <p className="text-sm">{orderDetails.direccion_entrega}</p>
                            </div>
                          )}
                          {orderDetails.notas && (
                            <div>
                              <span className="text-sm text-muted-foreground">Notas:</span>
                              <p className="text-sm">{orderDetails.notas}</p>
                            </div>
                          )}
                          
                          <div className="border-t pt-4">
                            <p className="mb-2 font-medium">Productos:</p>
                            <div className="space-y-2">
                              {orderDetails.Detalles?.map((detalle) => (
                                <div key={detalle.id} className="flex justify-between text-sm">
                                  <span>
                                    {detalle.cantidad}x {detalle.PresentacionProducto?.Producto?.nombre}
                                  </span>
                                  <span>{formatCurrency(detalle.subtotal)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 flex justify-between border-t pt-4 font-semibold">
                              <span>Total:</span>
                              <span>{formatCurrency(orderDetails.total)}</span>
                            </div>
                          </div>

                          {orderDetails.estado === "PENDIENTE" && (
                            <Button
                              variant="destructive"
                              className="w-full"
                              onClick={() => handleCancelOrder(orderDetails.id)}
                              disabled={cancellingOrder === orderDetails.id}
                            >
                              {cancellingOrder === orderDetails.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <X className="mr-2 h-4 w-4" />
                              )}
                              Cancelar Pedido
                            </Button>
                          )}
                        </div>
                      ) : null}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No tienes pedidos</h3>
            <p className="mt-1 text-muted-foreground">
              {statusFilter !== "all"
                ? "No hay pedidos con este estado"
                : "Comienza a comprar para ver tus pedidos aquí"}
            </p>
            <Button asChild className="mt-4">
              <Link href="/catalogo">Explorar Productos</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

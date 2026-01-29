"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, Eye, Ban, DollarSign, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { pedidosApi, ventasApi, type Pedido } from "@/lib/api";

const estadoColors = {
  PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CANCELADO: "bg-red-100 text-red-800 border-red-200",
  COMPLETADO: "bg-green-100 text-green-800 border-green-200",
};

export default function AdminPedidosPage() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [estadoFilter, setEstadoFilter] = useState<string>("all");
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: "cancel" | "convert" | null;
    pedido: Pedido | null;
  }>({ type: null, pedido: null });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPedidos = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const params = estadoFilter !== "all" ? { estado: estadoFilter as Pedido["estado"] } : undefined;
      const data = await pedidosApi.listar(token, params);
      setPedidos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, estadoFilter, toast]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const handleCancelPedido = async () => {
    if (!token || !actionDialog.pedido) return;

    setIsProcessing(true);
    try {
      await pedidosApi.cancelar(token, actionDialog.pedido.id, "Cancelado por administrador");
      toast({
        title: "Pedido Cancelado",
        description: `El pedido #${actionDialog.pedido.id} ha sido cancelado`,
      });
      fetchPedidos();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cancelar el pedido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setActionDialog({ type: null, pedido: null });
    }
  };

  const handleConvertToSale = async () => {
    if (!token || !actionDialog.pedido) return;

    setIsProcessing(true);
    try {
      await ventasApi.crear(token, {
        id_pedido: actionDialog.pedido.id,
        tipo_pago: "Contado",
        estado_pago: "PAGADO",
      });
      toast({
        title: "Venta Registrada",
        description: `El pedido #${actionDialog.pedido.id} ha sido convertido a venta`,
      });
      fetchPedidos();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo registrar la venta",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setActionDialog({ type: null, pedido: null });
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona los pedidos de clientes</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PENDIENTE">Pendientes</SelectItem>
              <SelectItem value="COMPLETADO">Completados</SelectItem>
              <SelectItem value="CANCELADO">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No hay pedidos {estadoFilter !== "all" ? "con este estado" : ""}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">#{pedido.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pedido.cliente_usuario?.nombre || "Sin cliente"}</p>
                        <p className="text-xs text-muted-foreground">{pedido.cliente_usuario?.correo}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(pedido.fecha_pedido)}</TableCell>
                    <TableCell>
                      {pedido.tipo_entrega === "DOMICILIO" ? "Domicilio" : "En local"}
                    </TableCell>
                    <TableCell>
                      <Badge className={estadoColors[pedido.estado]} variant="outline">
                        {pedido.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Q{Number(pedido.total_general).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedPedido(pedido)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {pedido.estado === "PENDIENTE" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-primary"
                              onClick={() => setActionDialog({ type: "convert", pedido })}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => setActionDialog({ type: "cancel", pedido })}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedPedido} onOpenChange={() => setSelectedPedido(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pedido #{selectedPedido?.id}</DialogTitle>
            <DialogDescription>
              Detalles completos del pedido
            </DialogDescription>
          </DialogHeader>
          {selectedPedido && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedPedido.cliente_usuario?.nombre || "Sin cliente"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge className={estadoColors[selectedPedido.estado]} variant="outline">
                    {selectedPedido.estado}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Entrega</p>
                  <p className="font-medium">
                    {selectedPedido.tipo_entrega === "DOMICILIO" ? "A Domicilio" : "Recoger en Local"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Factura</p>
                  <p className="font-medium">
                    {selectedPedido.requiere_factura ? `NIT: ${selectedPedido.nit_factura}` : "No requiere"}
                  </p>
                </div>
                {selectedPedido.direccion_entrega && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-medium">{selectedPedido.direccion_entrega}</p>
                  </div>
                )}
                {selectedPedido.notas_cliente && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Notas del Cliente</p>
                    <p className="font-medium">{selectedPedido.notas_cliente}</p>
                  </div>
                )}
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cant.</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPedido.detalles?.map((detalle) => (
                      <TableRow key={detalle.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{detalle.presentacion?.producto?.nombre || "Producto"}</p>
                            <p className="text-xs text-muted-foreground">{detalle.presentacion?.nombre}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{detalle.cantidad_unidad_venta}</TableCell>
                        <TableCell className="text-right">Q{Number(detalle.precio_unitario).toFixed(2)}</TableCell>
                        <TableCell className="text-right">Q{Number(detalle.subtotal_linea).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Q{Number(selectedPedido.subtotal_productos).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span>Q{Number(selectedPedido.cargo_envio).toFixed(2)}</span>
                </div>
                {Number(selectedPedido.descuento_total) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento</span>
                    <span>-Q{Number(selectedPedido.descuento_total).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">Q{Number(selectedPedido.total_general).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog
        open={actionDialog.type === "cancel"}
        onOpenChange={() => setActionDialog({ type: null, pedido: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Pedido</DialogTitle>
            <DialogDescription>
              Esta acción cancelará el pedido #{actionDialog.pedido?.id} y liberará el stock reservado. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ type: null, pedido: null })}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelPedido}
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Sale Dialog */}
      <Dialog
        open={actionDialog.type === "convert"}
        onOpenChange={() => setActionDialog({ type: null, pedido: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Venta</DialogTitle>
            <DialogDescription>
              Se registrará la venta del pedido #{actionDialog.pedido?.id} por un total de Q{Number(actionDialog.pedido?.total_general || 0).toFixed(2)}.
              El inventario se actualizará automáticamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ type: null, pedido: null })}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConvertToSale}
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Registrar Venta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

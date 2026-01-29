"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Eye, FileText, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ventasApi, type Venta } from "@/lib/api";

const estadoPagoColors = {
  PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PARCIAL: "bg-orange-100 text-orange-800 border-orange-200",
  PAGADO: "bg-green-100 text-green-800 border-green-200",
};

export default function AdminVentasPage() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);

  const fetchVentas = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const data = await ventasApi.listar(token);
      setVentas(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const totalVentas = ventas.reduce((acc, v) => acc + Number(v.total_general), 0);
  const ventasPagadas = ventas.filter((v) => v.estado_pago === "PAGADO").length;
  const ventasPendientes = ventas.filter((v) => v.estado_pago === "PENDIENTE").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ventas</h1>
        <p className="text-muted-foreground">Historial de ventas registradas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total en Ventas</p>
                <p className="text-2xl font-bold text-primary">
                  Q{totalVentas.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventas Pagadas</p>
                <p className="text-2xl font-bold">{ventasPagadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes de Pago</p>
                <p className="text-2xl font-bold">{ventasPendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : ventas.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No hay ventas registradas
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo Pago</TableHead>
                  <TableHead>Estado Pago</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventas.map((venta) => (
                  <TableRow key={venta.id}>
                    <TableCell className="font-medium">#{venta.id}</TableCell>
                    <TableCell>{formatDate(venta.fecha_venta)}</TableCell>
                    <TableCell>
                      {venta.nombre_cliente || venta.cliente_usuario?.nombre || "Sin cliente"}
                    </TableCell>
                    <TableCell>{venta.tipo_pago || "No especificado"}</TableCell>
                    <TableCell>
                      <Badge className={estadoPagoColors[venta.estado_pago]} variant="outline">
                        {venta.estado_pago}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Q{Number(venta.total_general).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedVenta(venta)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedVenta} onOpenChange={() => setSelectedVenta(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Venta #{selectedVenta?.id}</DialogTitle>
            <DialogDescription>
              Detalles completos de la venta
            </DialogDescription>
          </DialogHeader>
          {selectedVenta && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">
                    {selectedVenta.nombre_cliente || selectedVenta.cliente_usuario?.nombre || "Sin cliente"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado del Pago</p>
                  <Badge className={estadoPagoColors[selectedVenta.estado_pago]} variant="outline">
                    {selectedVenta.estado_pago}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Pago</p>
                  <p className="font-medium">{selectedVenta.tipo_pago || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Venta</p>
                  <p className="font-medium">{formatDate(selectedVenta.fecha_venta)}</p>
                </div>
                {selectedVenta.id_pedido && (
                  <div>
                    <p className="text-sm text-muted-foreground">Pedido Origen</p>
                    <p className="font-medium">#{selectedVenta.id_pedido}</p>
                  </div>
                )}
                {selectedVenta.notas && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Notas</p>
                    <p className="font-medium">{selectedVenta.notas}</p>
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
                    {selectedVenta.detalles?.map((detalle) => (
                      <TableRow key={detalle.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{detalle.presentacion?.producto?.nombre || "Producto"}</p>
                            <p className="text-xs text-muted-foreground">{detalle.presentacion?.nombre}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{detalle.cantidad_unidad_venta}</TableCell>
                        <TableCell className="text-right">Q{Number(detalle.precio_unitario_venta).toFixed(2)}</TableCell>
                        <TableCell className="text-right">Q{Number(detalle.subtotal_linea).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Q{Number(selectedVenta.subtotal_productos).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span>Q{Number(selectedVenta.cargo_envio).toFixed(2)}</span>
                </div>
                {Number(selectedVenta.descuento_total) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento</span>
                    <span>-Q{Number(selectedVenta.descuento_total).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">Q{Number(selectedVenta.total_general).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

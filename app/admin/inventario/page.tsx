"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Minus, Boxes, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { inventarioApi, productosApi, type InventarioSaldo, type Producto } from "@/lib/api";

export default function AdminInventarioPage() {
  const { toast } = useToast();
  const { token, isAdmin } = useAuth();
  const [saldos, setSaldos] = useState<InventarioSaldo[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showAjusteDialog, setShowAjusteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [ajusteData, setAjusteData] = useState({
    id_producto: "",
    id_ubicacion: "1",
    cantidad: 0,
    motivo: "",
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [saldosData, productosData] = await Promise.all([
        inventarioApi.saldos(),
        productosApi.listar({ activo: true }),
      ]);
      setSaldos(saldosData);
      setProductos(productosData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAjuste = () => {
    setAjusteData({
      id_producto: "",
      id_ubicacion: "1",
      cantidad: 0,
      motivo: "",
    });
    setShowAjusteDialog(true);
  };

  const handleSubmitAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isAdmin) return;

    if (!ajusteData.id_producto || ajusteData.cantidad === 0) {
      toast({
        title: "Error",
        description: "Selecciona un producto y especifica una cantidad",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await inventarioApi.ajuste(token, {
        id_producto: parseInt(ajusteData.id_producto),
        id_ubicacion: parseInt(ajusteData.id_ubicacion),
        cantidad: ajusteData.cantidad,
        motivo: ajusteData.motivo || undefined,
      });
      toast({
        title: "Ajuste Realizado",
        description: `Inventario ajustado correctamente`,
      });
      setShowAjusteDialog(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo realizar el ajuste",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSaldos = saldos.filter(
    (s) => s.producto?.nombre?.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalDisponible = saldos.reduce((acc, s) => acc + s.cantidad_disponible, 0);
  const totalReservado = saldos.reduce((acc, s) => acc + s.cantidad_reservada, 0);
  const productosBajoMinimo = saldos.filter((s) => {
    const producto = productos.find((p) => p.id === s.id_producto);
    return producto && s.cantidad_disponible <= producto.stock_minimo;
  }).length;

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h2 className="text-xl font-bold mb-2">Acceso Restringido</h2>
        <p className="text-muted-foreground">Solo los administradores pueden ver esta sección</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-muted-foreground">Control de existencias y ajustes</p>
        </div>
        <Button onClick={handleOpenAjuste}>
          <Plus className="h-4 w-4 mr-2" />
          Ajuste de Inventario
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Boxes className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Disponible</p>
                <p className="text-2xl font-bold">{totalDisponible.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Boxes className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Reservado</p>
                <p className="text-2xl font-bold">{totalReservado.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bajo Mínimo</p>
                <p className="text-2xl font-bold">{productosBajoMinimo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar productos..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSaldos.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Boxes className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros de inventario</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-right">Disponible</TableHead>
                  <TableHead className="text-right">Reservado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSaldos.map((saldo) => {
                  const producto = productos.find((p) => p.id === saldo.id_producto);
                  const bajominimo = producto && saldo.cantidad_disponible <= producto.stock_minimo;
                  
                  return (
                    <TableRow key={saldo.id}>
                      <TableCell>
                        <p className="font-medium">{saldo.producto?.nombre || "Producto"}</p>
                      </TableCell>
                      <TableCell>
                        {saldo.ubicacion?.nombre || `Ubicación ${saldo.id_ubicacion}`}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {saldo.cantidad_disponible}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {saldo.cantidad_reservada}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {saldo.cantidad_disponible + saldo.cantidad_reservada}
                      </TableCell>
                      <TableCell>
                        {bajominimo ? (
                          <Badge variant="destructive">Bajo Mínimo</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAjusteDialog} onOpenChange={setShowAjusteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajuste de Inventario</DialogTitle>
            <DialogDescription>
              Usa cantidades positivas para agregar y negativas para restar
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAjuste} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="producto">Producto *</Label>
              <Select
                value={ajusteData.id_producto}
                onValueChange={(v) => setAjusteData({ ...ajusteData, id_producto: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id.toString()}>
                      {prod.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad (+ agregar / - restar) *</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAjusteData({ ...ajusteData, cantidad: ajusteData.cantidad - 1 })}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="cantidad"
                  type="number"
                  value={ajusteData.cantidad}
                  onChange={(e) => setAjusteData({ ...ajusteData, cantidad: parseInt(e.target.value) || 0 })}
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAjusteData({ ...ajusteData, cantidad: ajusteData.cantidad + 1 })}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo del Ajuste</Label>
              <Textarea
                id="motivo"
                value={ajusteData.motivo}
                onChange={(e) => setAjusteData({ ...ajusteData, motivo: e.target.value })}
                placeholder="Ej: Conteo físico, merma, etc."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAjusteDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Aplicar Ajuste
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

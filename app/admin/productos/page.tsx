"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Edit, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { productosApi, categoriasApi, type Producto, type Categoria, type CrearProductoInput } from "@/lib/api";

export default function AdminProductosPage() {
  const { toast } = useToast();
  const { token, isAdmin } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CrearProductoInput>({
    nombre: "",
    descripcion: "",
    marca: "",
    url_imagen: "",
    id_categoria: undefined,
    id_unidad_base: 1,
    es_perecedero: false,
    stock_minimo: 10,
    activo: true,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productosData, categoriasData] = await Promise.all([
        productosApi.listar(),
        categoriasApi.listar(),
      ]);
      setProductos(productosData);
      setCategorias(categoriasData);
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

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      nombre: "",
      descripcion: "",
      marca: "",
      url_imagen: "",
      id_categoria: undefined,
      id_unidad_base: 1,
      es_perecedero: false,
      stock_minimo: 10,
      activo: true,
    });
    setShowDialog(true);
  };

  const handleOpenEdit = (producto: Producto) => {
    setEditingProduct(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      marca: producto.marca || "",
      url_imagen: producto.url_imagen || "",
      id_categoria: producto.id_categoria,
      id_unidad_base: producto.id_unidad_base,
      es_perecedero: producto.es_perecedero,
      stock_minimo: producto.stock_minimo,
      activo: producto.activo,
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isAdmin) return;

    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await productosApi.actualizar(token, editingProduct.id, formData);
        toast({
          title: "Producto Actualizado",
          description: `${formData.nombre} ha sido actualizado`,
        });
      } else {
        await productosApi.crear(token, formData);
        toast({
          title: "Producto Creado",
          description: `${formData.nombre} ha sido creado`,
        });
      }
      setShowDialog(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el producto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      p.marca?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestiona el catálogo de productos</p>
        </div>
        {isAdmin && (
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        )}
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
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay productos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Stock Mín.</TableHead>
                  <TableHead>Estado</TableHead>
                  {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          {producto.url_imagen ? (
                            <img
                              src={producto.url_imagen}
                              alt={producto.nombre}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <span className="text-lg text-muted-foreground">
                              {producto.nombre.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{producto.nombre}</p>
                          {producto.descripcion && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {producto.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{producto.categoria?.nombre || "-"}</TableCell>
                    <TableCell>{producto.marca || "-"}</TableCell>
                    <TableCell>{producto.stock_minimo}</TableCell>
                    <TableCell>
                      <Badge variant={producto.activo ? "default" : "secondary"}>
                        {producto.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(producto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Modifica los datos del producto"
                : "Ingresa los datos del nuevo producto"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  value={formData.id_categoria?.toString() || "none"}
                  onValueChange={(v) =>
                    setFormData({ ...formData, id_categoria: v === "none" ? undefined : parseInt(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url_imagen">URL de Imagen</Label>
              <Input
                id="url_imagen"
                type="url"
                value={formData.url_imagen}
                onChange={(e) => setFormData({ ...formData, url_imagen: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                <Input
                  id="stock_minimo"
                  type="number"
                  value={formData.stock_minimo}
                  onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch
                  id="es_perecedero"
                  checked={formData.es_perecedero}
                  onCheckedChange={(v) => setFormData({ ...formData, es_perecedero: v })}
                />
                <Label htmlFor="es_perecedero">Es Perecedero</Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(v) => setFormData({ ...formData, activo: v })}
              />
              <Label htmlFor="activo">Producto Activo</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProduct ? "Guardar Cambios" : "Crear Producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Edit, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { categoriasApi, type Categoria } from "@/lib/api";

export default function AdminCategoriasPage() {
  const { toast } = useToast();
  const { token, isAdmin } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await categoriasApi.listar();
      setCategorias(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
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
    setEditingCategoria(null);
    setFormData({
      nombre: "",
      descripcion: "",
      activo: true,
    });
    setShowDialog(true);
  };

  const handleOpenEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || "",
      activo: categoria.activo,
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
      if (editingCategoria) {
        await categoriasApi.actualizar(token, editingCategoria.id, formData);
        toast({
          title: "Categoría Actualizada",
          description: `${formData.nombre} ha sido actualizada`,
        });
      } else {
        await categoriasApi.crear(token, formData);
        toast({
          title: "Categoría Creada",
          description: `${formData.nombre} ha sido creada`,
        });
      }
      setShowDialog(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar la categoría",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categorías</h1>
          <p className="text-muted-foreground">Gestiona las categorías de productos</p>
        </div>
        {isAdmin && (
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Tags className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay categorías</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.map((categoria) => (
                  <TableRow key={categoria.id}>
                    <TableCell className="font-medium">{categoria.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {categoria.descripcion || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={categoria.activo ? "default" : "secondary"}>
                        {categoria.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(categoria)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
            <DialogDescription>
              {editingCategoria
                ? "Modifica los datos de la categoría"
                : "Ingresa los datos de la nueva categoría"}
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
            <div className="flex items-center gap-2">
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(v) => setFormData({ ...formData, activo: v })}
              />
              <Label htmlFor="activo">Categoría Activa</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingCategoria ? "Guardar Cambios" : "Crear Categoría"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

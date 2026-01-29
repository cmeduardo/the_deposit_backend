"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { catalogoApi, type ProductoDetalle, type Presentacion } from "@/lib/api";

export default function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { agregarItem } = useCart();

  const [producto, setProducto] = useState<ProductoDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPresentacion, setSelectedPresentacion] = useState<Presentacion | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const data = await catalogoApi.producto(parseInt(resolvedParams.id));
        setProducto(data);
        if (data.presentaciones && data.presentaciones.length > 0) {
          setSelectedPresentacion(data.presentaciones[0]);
        }
      } catch (error) {
        console.error("Error cargando producto:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducto();
  }, [resolvedParams.id, toast]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/tienda/producto/${resolvedParams.id}`);
      return;
    }

    if (!selectedPresentacion) {
      toast({
        title: "Error",
        description: "Selecciona una presentación",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      await agregarItem(selectedPresentacion.id, cantidad);
      toast({
        title: "Agregado al carrito",
        description: `${cantidad} x ${selectedPresentacion.nombre} agregado`,
      });
      setCantidad(1);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo agregar al carrito",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const formatPrice = (price?: string | null) => {
    if (!price) return null;
    return `Q${parseFloat(price).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
        <Button asChild>
          <Link href="/tienda">Volver al catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/tienda">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al catálogo
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
          {producto.url_imagen ? (
            <Image
              src={producto.url_imagen}
              alt={producto.nombre}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-6xl text-muted-foreground">
                {producto.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {producto.categoria && (
            <Badge className="w-fit mb-4" variant="secondary">
              {producto.categoria.nombre}
            </Badge>
          )}
          
          <h1 className="text-3xl font-bold mb-2">{producto.nombre}</h1>
          
          {producto.marca && (
            <p className="text-muted-foreground mb-4">{producto.marca}</p>
          )}
          
          {producto.descripcion && (
            <p className="text-muted-foreground mb-6">{producto.descripcion}</p>
          )}

          {producto.presentaciones && producto.presentaciones.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Presentaciones disponibles</h3>
              <RadioGroup
                value={selectedPresentacion?.id.toString()}
                onValueChange={(value) => {
                  const pres = producto.presentaciones?.find(p => p.id.toString() === value);
                  setSelectedPresentacion(pres || null);
                }}
                className="flex flex-col gap-3"
              >
                {producto.presentaciones.map((pres) => (
                  <Card
                    key={pres.id}
                    className={`cursor-pointer transition-colors ${
                      selectedPresentacion?.id === pres.id
                        ? "border-primary ring-1 ring-primary"
                        : "hover:border-muted-foreground/50"
                    }`}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <RadioGroupItem value={pres.id.toString()} id={`pres-${pres.id}`} />
                      <Label
                        htmlFor={`pres-${pres.id}`}
                        className="flex-1 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{pres.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {pres.unidades_por_unidad_venta} unidades
                          </p>
                        </div>
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(pres.precio_venta_por_defecto) || "Consultar"}
                        </span>
                      </Label>
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Cantidad:</span>
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{cantidad}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setCantidad(cantidad + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {selectedPresentacion && selectedPresentacion.precio_venta_por_defecto && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-2xl font-bold text-primary">
                  Q{(parseFloat(selectedPresentacion.precio_venta_por_defecto) * cantidad).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={!selectedPresentacion || isAdding}
          >
            {isAdding ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <ShoppingCart className="h-5 w-5 mr-2" />
            )}
            {isAuthenticated ? "Agregar al carrito" : "Iniciar sesión para comprar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

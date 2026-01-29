"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { catalogApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Minus, Plus, ShoppingCart, ArrowLeft, Check } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const productId = parseInt(params.id as string);
  
  const { data: product, isLoading, error } = useSWR(
    productId ? ["product", productId] : null,
    () => catalogApi.getProduct(productId)
  );

  const [selectedPresentationId, setSelectedPresentationId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const selectedPresentation = product?.Presentaciones?.find(
    (p) => p.id === selectedPresentationId
  ) || product?.Presentaciones?.[0];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/producto/${productId}`);
      return;
    }

    if (!selectedPresentation) return;

    setIsAddingToCart(true);
    try {
      await addItem(selectedPresentation.id, quantity);
      setAddedToCart(true);
      toast({
        title: "Producto agregado",
        description: `${product?.nombre} se agregó al carrito`,
      });
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "No se pudo agregar al carrito",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Producto no encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          El producto que buscas no existe o no está disponible
        </p>
        <Button asChild className="mt-4">
          <Link href="/catalogo">Volver al catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/catalogo">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al catálogo
          </Link>
        </Button>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {product.imagen_url ? (
            <Image
              src={product.imagen_url}
              alt={product.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-6xl font-bold text-muted-foreground/20">
                {product.nombre.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {product.CategoriaProducto && (
            <Badge variant="secondary" className="mb-2 w-fit">
              {product.CategoriaProducto.nombre}
            </Badge>
          )}
          
          <h1 className="text-3xl font-bold text-balance">{product.nombre}</h1>
          
          {product.descripcion && (
            <p className="mt-4 text-muted-foreground">{product.descripcion}</p>
          )}

          {/* Presentations */}
          {product.Presentaciones && product.Presentaciones.length > 0 && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Presentación
                </label>
                <Select
                  value={selectedPresentation?.id.toString()}
                  onValueChange={(value) => setSelectedPresentationId(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.Presentaciones.map((pres) => (
                      <SelectItem key={pres.id} value={pres.id.toString()}>
                        {pres.cantidad} {pres.Unidad?.abreviatura || pres.Unidad?.nombre} - {formatCurrency(pres.precio_venta)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold">
                {formatCurrency(selectedPresentation?.precio_venta || 0)}
              </div>

              {/* Quantity */}
              <div>
                <label className="mb-2 block text-sm font-medium">Cantidad</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-lg font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-xl font-bold">
                    {formatCurrency((selectedPresentation?.precio_venta || 0) * quantity)}
                  </span>
                </div>
              </div>

              {/* Add to Cart */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedPresentation}
              >
                {isAddingToCart ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : addedToCart ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                {addedToCart ? "Agregado" : "Agregar al Carrito"}
              </Button>

              {!isAuthenticated && (
                <p className="text-center text-sm text-muted-foreground">
                  <Link href="/login" className="underline hover:text-foreground">
                    Inicia sesión
                  </Link>{" "}
                  para agregar productos al carrito
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

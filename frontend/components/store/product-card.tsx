"use client";

import Image from "next/image";
import Link from "next/link";
import { Producto } from "@/lib/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Producto;
}

export function ProductCard({ product }: ProductCardProps) {
  const minPrice = product.Presentaciones?.length
    ? Math.min(...product.Presentaciones.map((p) => p.precio_venta))
    : 0;

  const hasMultiplePresentations = (product.Presentaciones?.length || 0) > 1;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/producto/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.imagen_url ? (
            <Image
              src={product.imagen_url}
              alt={product.nombre}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-4xl font-bold text-muted-foreground/20">
                {product.nombre.charAt(0)}
              </span>
            </div>
          )}
          {product.CategoriaProducto && (
            <Badge className="absolute left-2 top-2" variant="secondary">
              {product.CategoriaProducto.nombre}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-2 font-semibold leading-tight text-balance">
            {product.nombre}
          </h3>
          {product.descripcion && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {product.descripcion}
            </p>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-baseline gap-1">
            {hasMultiplePresentations && (
              <span className="text-sm text-muted-foreground">Desde</span>
            )}
            <span className="text-lg font-bold">{formatCurrency(minPrice)}</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { type ProductoCatalogo } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: ProductoCatalogo;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price?: string) => {
    if (!price) return null;
    return `Q${parseFloat(price).toFixed(2)}`;
  };

  return (
    <Link href={`/tienda/producto/${product.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-square relative bg-muted overflow-hidden">
          {product.url_imagen ? (
            <Image
              src={product.url_imagen}
              alt={product.nombre}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-secondary">
              <span className="text-4xl text-muted-foreground">
                {product.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {product.categoria && (
            <Badge className="absolute top-2 left-2" variant="secondary">
              {product.categoria.nombre}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.nombre}
          </h3>
          {product.marca && (
            <p className="text-xs text-muted-foreground mb-2">{product.marca}</p>
          )}
          {product.tiene_precio && (
            <div className="flex items-baseline gap-1">
              {product.precio_desde === product.precio_hasta ? (
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.precio_desde)}
                </span>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground">Desde</span>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(product.precio_desde)}
                  </span>
                </>
              )}
            </div>
          )}
          {!product.tiene_precio && (
            <span className="text-sm text-muted-foreground">Consultar precio</span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

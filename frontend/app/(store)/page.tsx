"use client";

import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { catalogApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { ArrowRight, Store, Truck, CreditCard, Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: productsData, isLoading } = useSWR(
    ["featured-products"],
    () => catalogApi.getProducts({ limite: 8 })
  );

  const { data: categories } = useSWR(
    ["categories"],
    () => catalogApi.getCategories()
  );

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-balance">
                Tu tienda de confianza en La Antigua
              </h1>
              <p className="max-w-md text-lg text-primary-foreground/80">
                Productos de calidad al mejor precio. Haz tu pedido en línea y recógelo en tienda o solicita entrega a domicilio.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/catalogo">
                    Ver Catálogo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link href="/registro">Crear Cuenta</Link>
                </Button>
              </div>
            </div>
            <div className="hidden justify-center md:flex">
              <Image
                src="/logo.png"
                alt="The Deposit"
                width={300}
                height={300}
                className="h-auto w-[300px] opacity-90"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary p-3">
                <Store className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Recoge en Tienda</h3>
                <p className="text-sm text-muted-foreground">
                  Haz tu pedido y recógelo cuando esté listo
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary p-3">
                <Truck className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Entrega a Domicilio</h3>
                <p className="text-sm text-muted-foreground">
                  Recibe tus productos en la puerta de tu casa
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary p-3">
                <CreditCard className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Pago Flexible</h3>
                <p className="text-sm text-muted-foreground">
                  Paga al recoger o al recibir tu pedido
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-2xl font-bold">Categorías</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  asChild
                >
                  <Link href={`/catalogo?categoria=${category.id}`}>
                    {category.nombre}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Productos Destacados</h2>
            <Button variant="ghost" asChild>
              <Link href="/catalogo">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : productsData?.productos && productsData.productos.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {productsData.productos.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No hay productos disponibles</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-balance">
            ¿Listo para hacer tu pedido?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Regístrate ahora y comienza a comprar. Es rápido, fácil y seguro.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/registro">Crear Cuenta Gratis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/catalogo">Explorar Productos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

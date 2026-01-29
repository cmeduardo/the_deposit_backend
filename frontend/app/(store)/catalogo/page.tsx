"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { catalogApi } from "@/lib/api";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, X, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("busqueda") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get("categoria") ? parseInt(searchParams.get("categoria")!) : undefined
  );
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Update URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("busqueda", debouncedSearch);
    if (categoryId) params.set("categoria", categoryId.toString());
    if (page > 1) params.set("pagina", page.toString());
    
    const query = params.toString();
    router.replace(`/catalogo${query ? `?${query}` : ""}`, { scroll: false });
  }, [debouncedSearch, categoryId, page, router]);

  const { data: productsData, isLoading } = useSWR(
    ["products", debouncedSearch, categoryId, page],
    () => catalogApi.getProducts({
      busqueda: debouncedSearch || undefined,
      categoria_id: categoryId,
      pagina: page,
      limite: 12,
    })
  );

  const { data: categories } = useSWR(
    ["categories"],
    () => catalogApi.getCategories()
  );

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategoryId(undefined);
    setPage(1);
  };

  const hasFilters = debouncedSearch || categoryId;

  const FilterContent = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Categoría</label>
        <Select
          value={categoryId?.toString() || "all"}
          onValueChange={(value) => {
            setCategoryId(value === "all" ? undefined : parseInt(value));
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full">
          <X className="mr-2 h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Catálogo de Productos</h1>
        <p className="mt-2 text-muted-foreground">
          Explora nuestra selección de productos
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar - Desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 space-y-6 rounded-lg border p-4">
            <h2 className="font-semibold">Filtros</h2>
            <FilterContent />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Mobile Filter */}
          <div className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Mobile Filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters */}
          {hasFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              {debouncedSearch && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setDebouncedSearch("");
                  }}
                >
                  &quot;{debouncedSearch}&quot;
                  <X className="ml-1 h-3 w-3" />
                </Button>
              )}
              {categoryId && categories && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCategoryId(undefined)}
                >
                  {categories.find((c) => c.id === categoryId)?.nombre}
                  <X className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : productsData?.productos && productsData.productos.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {productsData.total} producto{productsData.total !== 1 ? "s" : ""} encontrado{productsData.total !== 1 ? "s" : ""}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {productsData.productos.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {productsData.paginas > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4 text-sm">
                    Página {page} de {productsData.paginas}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(productsData.paginas, p + 1))}
                    disabled={page === productsData.paginas}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg font-medium">No se encontraron productos</p>
              <p className="mt-1 text-muted-foreground">
                Intenta con otros filtros o términos de búsqueda
              </p>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

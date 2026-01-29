"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, ChevronDown, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductCard } from "@/components/store/product-card";
import { catalogoApi, categoriasApi, type ProductoCatalogo, type Categoria, type MetaPaginacion } from "@/lib/api";

export default function TiendaPage() {
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [meta, setMeta] = useState<MetaPaginacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("nombre");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [page, setPage] = useState(1);

  const fetchCategorias = useCallback(async () => {
    try {
      const data = await categoriasApi.listar();
      setCategorias(data.filter(c => c.activo));
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  }, []);

  const fetchProductos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await catalogoApi.productos({
        texto: searchText || undefined,
        id_categoria: selectedCategoria ? parseInt(selectedCategoria) : undefined,
        sort: sortBy as "nombre" | "precio",
        order: sortOrder as "asc" | "desc",
        page,
        limit: 12,
      });
      setProductos(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchText, selectedCategoria, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProductos();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchProductos]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  const handleCategoriaChange = (value: string) => {
    setSelectedCategoria(value === "all" ? "" : value);
    setPage(1);
  };

  const FiltersContent = () => (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Categoría</label>
        <Select value={selectedCategoria || "all"} onValueChange={handleCategoriaChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Ordenar por</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nombre">Nombre</SelectItem>
            <SelectItem value="precio">Precio</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Orden</label>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascendente</SelectItem>
            <SelectItem value="desc">Descendente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Catálogo de Productos</h1>
        <p className="text-muted-foreground">
          Explora nuestra selección de productos y realiza tu pedido en línea
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <Select value={selectedCategoria || "all"} onValueChange={handleCategoriaChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
            const [sort, order] = v.split("-");
            setSortBy(sort);
            setSortOrder(order);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nombre-asc">Nombre A-Z</SelectItem>
              <SelectItem value="nombre-desc">Nombre Z-A</SelectItem>
              <SelectItem value="precio-asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="precio-desc">Precio: Mayor a Menor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No se encontraron productos</p>
          <p className="text-sm text-muted-foreground mt-1">
            Intenta con otros filtros o términos de búsqueda
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <ProductCard key={producto.id} product={producto} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Página {meta.page} de {meta.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

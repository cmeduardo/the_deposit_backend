"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, X, Package } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

export function StoreHeader() {
  const { usuario, isAuthenticated, isAdmin, isVendedor, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/tienda" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">El Depósito</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/tienda" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Catálogo
            </Link>
            {isAuthenticated && (
              <Link href="/tienda/pedidos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Mis Pedidos
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Link href="/tienda/carrito" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {Math.round(itemCount)}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{usuario?.nombre}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{usuario?.nombre}</p>
                  <p className="text-xs text-muted-foreground">{usuario?.correo}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/tienda/perfil">Mi Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tienda/pedidos">Mis Pedidos</Link>
                </DropdownMenuItem>
                {(isAdmin || isVendedor) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="text-primary font-medium">
                        Panel de Gestión
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/registro">Registrarse</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            <Link
              href="/tienda"
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Catálogo
            </Link>
            {isAuthenticated && (
              <Link
                href="/tienda/pedidos"
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mis Pedidos
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Boxes,
  Tags,
  Store,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
  { name: "Ventas", href: "/admin/ventas", icon: DollarSign },
  { name: "Productos", href: "/admin/productos", icon: Package },
  { name: "Categorías", href: "/admin/categorias", icon: Tags },
  { name: "Inventario", href: "/admin/inventario", icon: Boxes },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const filteredNavigation = navigation.filter((item) => {
    // Vendedores no pueden ver inventario
    if (!isAdmin && item.href === "/admin/inventario") return false;
    return true;
  });

  return (
    <>
      {/* Mobile backdrop */}
      {onClose && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col transition-transform lg:translate-x-0",
          onClose ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">El Depósito</span>
          </Link>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Link
            href="/tienda"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Store className="h-5 w-5" />
            Ir a la Tienda
          </Link>
        </div>
      </aside>
    </>
  );
}

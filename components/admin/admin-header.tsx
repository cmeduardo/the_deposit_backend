"use client";

import { useState } from "react";
import { Menu, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { AdminSidebar } from "./admin-sidebar";

export function AdminHeader() {
  const { usuario, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden lg:block">
          <h2 className="text-sm font-medium text-muted-foreground">
            Panel de Gestión
          </h2>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                {usuario?.nombre?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="hidden sm:inline">{usuario?.nombre}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{usuario?.nombre}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {usuario?.correo}
                </span>
                <span className="text-xs font-normal text-primary mt-1">
                  {usuario?.rol}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {sidebarOpen && <AdminSidebar onClose={() => setSidebarOpen(false)} />}
    </>
  );
}

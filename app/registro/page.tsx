"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

export default function RegistroPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { registro, isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  if (isAuthenticated) {
    router.push("/tienda");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.contrasena !== formData.confirmarContrasena) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (formData.contrasena.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await registro(formData.nombre, formData.correo, formData.contrasena);
      toast({
        title: "Cuenta Creada",
        description: "Tu cuenta ha sido creada exitosamente",
      });
      router.push("/tienda");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/tienda" className="flex items-center justify-center gap-2 mb-4">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">El Depósito</span>
          </Link>
          <CardTitle>Crear Cuenta</CardTitle>
          <CardDescription>
            Regístrate para realizar pedidos en línea
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                placeholder="Tu nombre"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="tu@correo.com"
                value={formData.correo}
                onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contrasena">Contraseña</Label>
              <Input
                id="contrasena"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.contrasena}
                onChange={(e) => setFormData(prev => ({ ...prev, contrasena: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarContrasena">Confirmar Contraseña</Label>
              <Input
                id="confirmarContrasena"
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmarContrasena}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmarContrasena: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Cuenta
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Inicia Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

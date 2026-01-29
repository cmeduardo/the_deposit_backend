"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Eye, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { pedidosApi, type Pedido } from "@/lib/api";

const estadoColors = {
  PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CANCELADO: "bg-red-100 text-red-800 border-red-200",
  COMPLETADO: "bg-green-100 text-green-800 border-green-200",
};

const estadoLabels = {
  PENDIENTE: "Pendiente",
  CANCELADO: "Cancelado",
  COMPLETADO: "Completado",
};

export default function MisPedidosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPedidos = useCallback(async () => {
    if (!token) return;
    
    try {
      const data = await pedidosApi.listar(token);
      setPedidos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPedidos();
    } else if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/tienda/pedidos");
    }
  }, [isAuthenticated, authLoading, token, fetchPedidos, router]);

  if (authLoading || isLoading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (pedidos.length === 0) {
    return (
      <div className="container py-20 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">No tienes pedidos</h1>
        <p className="text-muted-foreground mb-6">
          Explora nuestro catálogo y realiza tu primer pedido
        </p>
        <Button asChild>
          <Link href="/tienda">Ver Catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>

      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <Card key={pedido.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Pedido #{pedido.id}
                </CardTitle>
                <Badge className={estadoColors[pedido.estado]} variant="outline">
                  {estadoLabels[pedido.estado]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {new Date(pedido.fecha_pedido).toLocaleDateString("es-GT", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entrega</p>
                  <p className="font-medium">
                    {pedido.tipo_entrega === "DOMICILIO" ? "A Domicilio" : "Recoger en Local"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Productos</p>
                  <p className="font-medium">{pedido.detalles?.length || 0} items</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-bold text-primary text-lg">
                    Q{Number(pedido.total_general).toFixed(2)}
                  </p>
                </div>
              </div>
              
              {pedido.estado === "PENDIENTE" && !pedido.venta && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-md text-yellow-800 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Pendiente de pago - Te contactaremos para coordinar</span>
                </div>
              )}

              {pedido.venta && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md text-green-800 text-sm">
                  <Package className="h-4 w-4" />
                  <span>Venta registrada - Pedido completado</span>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/tienda/pedidos/${pedido.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

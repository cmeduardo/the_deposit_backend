"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Truck, Store, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { type ConfirmarCarritoInput } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { usuario, isAuthenticated, isLoading: authLoading } = useAuth();
  const { carrito, total, confirmarPedido, isLoading: cartLoading } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ pedido_id: number; total: number } | null>(null);
  
  const [formData, setFormData] = useState({
    tipo_entrega: "RECOGER_EN_LOCAL" as "DOMICILIO" | "RECOGER_EN_LOCAL",
    direccion_entrega: usuario?.direccion || "",
    requiere_factura: false,
    nit_factura: usuario?.nit || "CF",
    nombre_factura: usuario?.nombre || "",
    notas_cliente: "",
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!carrito?.items?.length) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de proceder",
        variant: "destructive",
      });
      return;
    }

    if (formData.tipo_entrega === "DOMICILIO" && !formData.direccion_entrega.trim()) {
      toast({
        title: "Dirección requerida",
        description: "Ingresa una dirección de entrega",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const data: ConfirmarCarritoInput = {
        id_ubicacion_salida: 1, // Default location
        tipo_entrega: formData.tipo_entrega,
        direccion_entrega: formData.tipo_entrega === "DOMICILIO" ? formData.direccion_entrega : undefined,
        requiere_factura: formData.requiere_factura,
        nit_factura: formData.requiere_factura ? formData.nit_factura : undefined,
        nombre_factura: formData.requiere_factura ? formData.nombre_factura : undefined,
        cargo_envio: formData.tipo_entrega === "DOMICILIO" ? 25 : 0,
        notas_cliente: formData.notas_cliente || undefined,
      };

      const result = await confirmarPedido(data);
      setOrderSuccess({ pedido_id: result.pedido_id, total: result.total_general });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el pedido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login?redirect=/tienda/checkout");
    return null;
  }

  if (orderSuccess) {
    return (
      <div className="container py-20 max-w-lg mx-auto text-center">
        <CheckCircle2 className="h-20 w-20 mx-auto text-primary mb-6" />
        <h1 className="text-3xl font-bold mb-2">Pedido Confirmado</h1>
        <p className="text-muted-foreground mb-6">
          Tu pedido #{orderSuccess.pedido_id} ha sido registrado exitosamente
        </p>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Número de pedido:</span>
                <span className="font-bold">#{orderSuccess.pedido_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-primary">Q{orderSuccess.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground mb-6">
          Te contactaremos para coordinar el pago y la entrega de tu pedido.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/tienda/pedidos">Ver Mis Pedidos</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tienda">Seguir Comprando</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!carrito?.items?.length) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
        <Button asChild>
          <Link href="/tienda">Ver Catálogo</Link>
        </Button>
      </div>
    );
  }

  const cargoEnvio = formData.tipo_entrega === "DOMICILIO" ? 25 : 0;
  const totalFinal = total + cargoEnvio;

  return (
    <div className="container py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/tienda/carrito">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al carrito
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Tipo de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.tipo_entrega}
                  onValueChange={(v) => handleChange("tipo_entrega", v)}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="RECOGER_EN_LOCAL" id="recoger" className="mt-1" />
                    <Label htmlFor="recoger" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        <Store className="h-4 w-4" />
                        Recoger en Local
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Recoge tu pedido en nuestra tienda sin costo adicional
                      </p>
                    </Label>
                    <span className="text-sm font-medium text-primary">Gratis</span>
                  </div>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="DOMICILIO" id="domicilio" className="mt-1" />
                    <Label htmlFor="domicilio" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        <Truck className="h-4 w-4" />
                        Entrega a Domicilio
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Recibe tu pedido en la dirección que indiques
                      </p>
                    </Label>
                    <span className="text-sm font-medium text-primary">Q25.00</span>
                  </div>
                </RadioGroup>

                {formData.tipo_entrega === "DOMICILIO" && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="direccion">Dirección de Entrega *</Label>
                    <Textarea
                      id="direccion"
                      placeholder="Ingresa tu dirección completa"
                      value={formData.direccion_entrega}
                      onChange={(e) => handleChange("direccion_entrega", e.target.value)}
                      required
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Facturación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="factura">Requiero Factura</Label>
                    <p className="text-sm text-muted-foreground">
                      Marca esta opción si necesitas factura
                    </p>
                  </div>
                  <Switch
                    id="factura"
                    checked={formData.requiere_factura}
                    onCheckedChange={(v) => handleChange("requiere_factura", v)}
                  />
                </div>

                {formData.requiere_factura && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="nit">NIT</Label>
                      <Input
                        id="nit"
                        placeholder="Ingresa tu NIT o CF"
                        value={formData.nit_factura}
                        onChange={(e) => handleChange("nit_factura", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombre_factura">Nombre para Factura</Label>
                      <Input
                        id="nombre_factura"
                        placeholder="Nombre o razón social"
                        value={formData.nombre_factura}
                        onChange={(e) => handleChange("nombre_factura", e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notas del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Instrucciones especiales para tu pedido (opcional)"
                  value={formData.notas_cliente}
                  onChange={(e) => handleChange("notas_cliente", e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {carrito.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {Math.round(parseFloat(item.cantidad_unidad_venta))}x {item.presentacion?.nombre || "Producto"}
                      </span>
                      <span>Q{parseFloat(item.subtotal_linea).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Q{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span>{cargoEnvio > 0 ? `Q${cargoEnvio.toFixed(2)}` : "Gratis"}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">Q{totalFinal.toFixed(2)}</span>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Confirmar Pedido"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Al confirmar, recibirás instrucciones para el pago
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

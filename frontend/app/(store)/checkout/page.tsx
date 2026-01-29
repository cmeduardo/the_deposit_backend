"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { ordersApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, Truck, ArrowLeft, CheckCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, total, clearCart, isLoading: cartLoading } = useCart();
  const { toast } = useToast();

  const [tipoEntrega, setTipoEntrega] = useState<"DOMICILIO" | "RECOGER_EN_TIENDA">("RECOGER_EN_TIENDA");
  const [direccionEntrega, setDireccionEntrega] = useState(user?.direccion || "");
  const [notas, setNotas] = useState("");
  const [requiereFactura, setRequiereFactura] = useState(false);
  const [datosFactura, setDatosFactura] = useState({
    nit: "",
    nombre: "",
    direccion: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState<number | null>(null);

  if (authLoading || cartLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login?redirect=/checkout");
    return null;
  }

  if (items.length === 0 && !orderCreated) {
    router.push("/carrito");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tipoEntrega === "DOMICILIO" && !direccionEntrega.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una dirección de entrega",
        variant: "destructive",
      });
      return;
    }

    if (requiereFactura && (!datosFactura.nit || !datosFactura.nombre)) {
      toast({
        title: "Error",
        description: "Por favor completa los datos de facturación",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const pedido = await ordersApi.create({
        tipo_entrega: tipoEntrega,
        direccion_entrega: tipoEntrega === "DOMICILIO" ? direccionEntrega : undefined,
        notas: notas || undefined,
        requiere_factura: requiereFactura,
        datos_factura: requiereFactura ? datosFactura : undefined,
      });

      setOrderCreated(pedido.id);
      await clearCart();
    } catch (err) {
      toast({
        title: "Error al crear pedido",
        description: err instanceof Error ? err.message : "Intenta de nuevo más tarde",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (orderCreated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Pedido Creado Exitosamente</h1>
          <p className="mt-2 text-muted-foreground">
            Tu pedido #{orderCreated} ha sido registrado. Te contactaremos pronto para confirmar los detalles.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button asChild>
              <Link href={`/mis-pedidos`}>Ver Mis Pedidos</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/catalogo">Seguir Comprando</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/carrito">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al carrito
          </Link>
        </Button>
      </nav>

      <h1 className="mb-8 text-3xl font-bold">Finalizar Pedido</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Delivery Type */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={tipoEntrega}
                  onValueChange={(value) => setTipoEntrega(value as "DOMICILIO" | "RECOGER_EN_TIENDA")}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <Label
                    htmlFor="recoger"
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                      tipoEntrega === "RECOGER_EN_TIENDA" ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <RadioGroupItem value="RECOGER_EN_TIENDA" id="recoger" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        <span className="font-medium">Recoger en Tienda</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Recoge tu pedido en nuestra tienda cuando esté listo
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="domicilio"
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                      tipoEntrega === "DOMICILIO" ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <RadioGroupItem value="DOMICILIO" id="domicilio" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span className="font-medium">Entrega a Domicilio</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Recibe tu pedido en la dirección que indiques
                      </p>
                    </div>
                  </Label>
                </RadioGroup>

                {tipoEntrega === "DOMICILIO" && (
                  <div className="mt-4">
                    <Label htmlFor="direccion">Dirección de Entrega</Label>
                    <Textarea
                      id="direccion"
                      value={direccionEntrega}
                      onChange={(e) => setDireccionEntrega(e.target.value)}
                      placeholder="Ingresa tu dirección completa"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notas del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Instrucciones especiales, horario de entrega preferido, etc."
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Invoice */}
            <Card>
              <CardHeader>
                <CardTitle>Facturación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiere-factura"
                    checked={requiereFactura}
                    onCheckedChange={(checked) => setRequiereFactura(checked as boolean)}
                  />
                  <Label htmlFor="requiere-factura">Requiero factura</Label>
                </div>

                {requiereFactura && (
                  <div className="grid gap-4 pt-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="nit">NIT</Label>
                      <Input
                        id="nit"
                        value={datosFactura.nit}
                        onChange={(e) =>
                          setDatosFactura((prev) => ({ ...prev, nit: e.target.value }))
                        }
                        placeholder="12345678-9"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nombre-factura">Nombre / Razón Social</Label>
                      <Input
                        id="nombre-factura"
                        value={datosFactura.nombre}
                        onChange={(e) =>
                          setDatosFactura((prev) => ({ ...prev, nombre: e.target.value }))
                        }
                        placeholder="Nombre completo o empresa"
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="direccion-factura">Dirección de Facturación</Label>
                      <Input
                        id="direccion-factura"
                        value={datosFactura.direccion}
                        onChange={(e) =>
                          setDatosFactura((prev) => ({ ...prev, direccion: e.target.value }))
                        }
                        placeholder="Dirección para la factura"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {items.map((item) => {
                    const product = item.PresentacionProducto?.Producto;
                    const presentation = item.PresentacionProducto;
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                          {product?.imagen_url ? (
                            <Image
                              src={product.imagen_url}
                              alt={product.nombre}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground/20">
                              {product?.nombre?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-sm">
                          <p className="line-clamp-1 font-medium">{product?.nombre}</p>
                          <p className="text-muted-foreground">
                            {item.cantidad} x {formatCurrency(item.precio_unitario)}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatCurrency(item.cantidad * item.precio_unitario)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-muted-foreground">
                    {tipoEntrega === "DOMICILIO" ? "Por confirmar" : "Gratis"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Confirmar Pedido"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  El pago se realizará al momento de recoger o recibir tu pedido
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

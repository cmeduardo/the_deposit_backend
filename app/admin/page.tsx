"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import {
  kpiApi,
  type KpiResumenFinanciero,
  type KpiVentasDiarias,
  type KpiTopProducto,
  type KpiBajoMinimo,
} from "@/lib/api";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const { token, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [resumen, setResumen] = useState<KpiResumenFinanciero | null>(null);
  const [ventasDiarias, setVentasDiarias] = useState<KpiVentasDiarias[]>([]);
  const [topProductos, setTopProductos] = useState<KpiTopProducto[]>([]);
  const [bajoMinimo, setBajoMinimo] = useState<KpiBajoMinimo[]>([]);

  const fetchData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const params = {
        fecha_desde: thirtyDaysAgo.toISOString().split("T")[0],
        fecha_hasta: today.toISOString().split("T")[0],
      };

      const [resumenData, ventasData, topData, bajoData] = await Promise.all([
        isAdmin ? kpiApi.resumenFinanciero(token, params) : Promise.resolve(null),
        kpiApi.ventasDiarias(token, params),
        kpiApi.topProductos(token, { ...params, limite: 5 }),
        kpiApi.inventarioBajoMinimo(token),
      ]);

      setResumen(resumenData);
      setVentasDiarias(ventasData);
      setTopProductos(topData);
      setBajoMinimo(bajoData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatCurrency = (value: number) => `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;

  const chartData = ventasDiarias.map((d) => ({
    fecha: new Date(d.fecha).toLocaleDateString("es-GT", { day: "2-digit", month: "short" }),
    ventas: parseFloat(d.total_ventas),
    cantidad: parseInt(d.cantidad_ventas),
  }));

  const topChartData = topProductos.map((p) => ({
    nombre: p.nombre_producto.length > 15 ? p.nombre_producto.substring(0, 15) + "..." : p.nombre_producto,
    ventas: parseFloat(p.total_ventas),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de los últimos 30 días</p>
      </div>

      {isAdmin && resumen && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(resumen.resumen.total_ventas)}
              </div>
              <p className="text-xs text-muted-foreground">Últimos 30 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(resumen.resumen.total_gastos)}
              </div>
              <p className="text-xs text-muted-foreground">Últimos 30 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
              {resumen.resumen.utilidad_neta_estimada >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                resumen.resumen.utilidad_neta_estimada >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {formatCurrency(resumen.resumen.utilidad_neta_estimada)}
              </div>
              <p className="text-xs text-muted-foreground">
                Margen: {(resumen.resumen.margen_sobre_ventas * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(resumen.resumen.cuentas_por_cobrar_estimadas)}
              </div>
              <p className="text-xs text-muted-foreground">Cobrado: {formatCurrency(resumen.resumen.total_cobros_clientes)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Diarias</CardTitle>
            <CardDescription>Evolución de ventas en los últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  ventas: { label: "Ventas", color: "hsl(var(--primary))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <XAxis
                      dataKey="fecha"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `Q${value}`}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                    />
                    <Area
                      type="monotone"
                      dataKey="ventas"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos de ventas
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Productos</CardTitle>
            <CardDescription>Productos más vendidos por monto</CardDescription>
          </CardHeader>
          <CardContent>
            {topChartData.length > 0 ? (
              <ChartContainer
                config={{
                  ventas: { label: "Ventas", color: "hsl(var(--primary))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topChartData} layout="vertical">
                    <XAxis
                      type="number"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `Q${value}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey="ventas"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos de productos
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {bajoMinimo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Productos Bajo Stock Mínimo
            </CardTitle>
            <CardDescription>
              Estos productos necesitan reabastecimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bajoMinimo.slice(0, 5).map((item) => (
                <div
                  key={item.id_producto}
                  className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.nombre_producto}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.categoria?.nombre || "Sin categoría"}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      Stock: {item.stock_disponible} / Mínimo: {item.stock_minimo}
                    </Badge>
                  </div>
                </div>
              ))}
              {bajoMinimo.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  Y {bajoMinimo.length - 5} productos más...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

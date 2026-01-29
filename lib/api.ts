const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ApiOptions extends RequestInit {
  token?: string;
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ mensaje: "Error de conexión" }));
    throw new Error(error.mensaje || `Error ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (correo: string, contrasena: string) =>
    apiRequest<{ token: string; usuario: Usuario }>("/autenticacion/login", {
      method: "POST",
      body: JSON.stringify({ correo, contrasena }),
    }),
  
  registro: (nombre: string, correo: string, contrasena: string) =>
    apiRequest<{ token: string; usuario: Usuario }>("/autenticacion/registro", {
      method: "POST",
      body: JSON.stringify({ nombre, correo, contrasena }),
    }),
  
  perfil: (token: string) =>
    apiRequest<Usuario>("/autenticacion/perfil", { token }),
  
  actualizarPerfil: (token: string, data: Partial<Usuario>) =>
    apiRequest<{ mensaje: string; usuario: Usuario }>("/autenticacion/perfil", {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    }),
};

// Catalog API (public)
export const catalogoApi = {
  productos: (params?: CatalogoParams) => {
    const searchParams = new URLSearchParams();
    if (params?.texto) searchParams.set("texto", params.texto);
    if (params?.id_categoria) searchParams.set("id_categoria", params.id_categoria.toString());
    if (params?.marca) searchParams.set("marca", params.marca);
    if (params?.precio_min) searchParams.set("precio_min", params.precio_min.toString());
    if (params?.precio_max) searchParams.set("precio_max", params.precio_max.toString());
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.order) searchParams.set("order", params.order);
    
    const query = searchParams.toString();
    return apiRequest<{ meta: MetaPaginacion; data: ProductoCatalogo[] }>(
      `/catalogo/productos${query ? `?${query}` : ""}`
    );
  },
  
  producto: (id: number) =>
    apiRequest<ProductoDetalle>(`/catalogo/productos/${id}`),
  
  presentacion: (id: number) =>
    apiRequest<PresentacionDetalle>(`/catalogo/presentaciones/${id}`),
};

// Categories API (public)
export const categoriasApi = {
  listar: () => apiRequest<Categoria[]>("/categorias-productos"),
  obtener: (id: number) => apiRequest<Categoria>(`/categorias-productos/${id}`),
  crear: (token: string, data: Omit<Categoria, "id">) =>
    apiRequest<{ mensaje: string; categoria: Categoria }>("/categorias-productos", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),
  actualizar: (token: string, id: number, data: Partial<Categoria>) =>
    apiRequest<{ mensaje: string; categoria: Categoria }>(`/categorias-productos/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    }),
};

// Cart API (auth required)
export const carritoApi = {
  obtener: (token: string) =>
    apiRequest<Carrito>("/carrito/mi-carrito", { token }),
  
  agregarItem: (token: string, id_presentacion_producto: number, cantidad_unidad_venta: number, notas?: string) =>
    apiRequest<{ mensaje: string; carrito: Carrito }>("/carrito/items", {
      method: "POST",
      token,
      body: JSON.stringify({ id_presentacion_producto, cantidad_unidad_venta, notas }),
    }),
  
  actualizarItem: (token: string, id: number, data: { cantidad_unidad_venta?: number; notas?: string }) =>
    apiRequest<{ mensaje: string; item?: ItemCarrito }>(`/carrito/items/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    }),
  
  eliminarItem: (token: string, id: number) =>
    apiRequest<{ mensaje: string }>(`/carrito/items/${id}`, {
      method: "DELETE",
      token,
    }),
  
  vaciar: (token: string) =>
    apiRequest<{ mensaje: string }>("/carrito/mi-carrito/items", {
      method: "DELETE",
      token,
    }),
  
  confirmar: (token: string, data: ConfirmarCarritoInput) =>
    apiRequest<{ mensaje: string; pedido_id: number; total_general: number }>("/carrito/confirmar", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),
};

// Orders API
export const pedidosApi = {
  listar: (token: string, params?: PedidoParams) => {
    const searchParams = new URLSearchParams();
    if (params?.estado) searchParams.set("estado", params.estado);
    if (params?.id_cliente) searchParams.set("id_cliente", params.id_cliente.toString());
    if (params?.fecha_desde) searchParams.set("fecha_desde", params.fecha_desde);
    if (params?.fecha_hasta) searchParams.set("fecha_hasta", params.fecha_hasta);
    
    const query = searchParams.toString();
    return apiRequest<Pedido[]>(`/pedidos${query ? `?${query}` : ""}`, { token });
  },
  
  obtener: (token: string, id: number) =>
    apiRequest<Pedido>(`/pedidos/${id}`, { token }),
  
  crear: (token: string, data: CrearPedidoInput) =>
    apiRequest<{ mensaje: string; pedido: Pedido }>("/pedidos", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),
  
  cancelar: (token: string, id: number, motivo?: string) =>
    apiRequest<{ mensaje: string; pedido: Pedido }>(`/pedidos/${id}/cancelar`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ motivo }),
    }),
};

// Sales API (admin/vendedor)
export const ventasApi = {
  listar: (token: string) =>
    apiRequest<Venta[]>("/ventas", { token }),
  
  obtener: (token: string, id: number) =>
    apiRequest<Venta>(`/ventas/${id}`, { token }),
  
  crear: (token: string, data: CrearVentaInput) =>
    apiRequest<{ mensaje: string; venta: Venta }>("/ventas", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),
};

// Products API (admin)
export const productosApi = {
  listar: (params?: { activo?: boolean; id_categoria?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.activo !== undefined) searchParams.set("activo", params.activo.toString());
    if (params?.id_categoria) searchParams.set("id_categoria", params.id_categoria.toString());
    
    const query = searchParams.toString();
    return apiRequest<Producto[]>(`/productos${query ? `?${query}` : ""}`);
  },
  
  obtener: (id: number) =>
    apiRequest<ProductoConPresentaciones>(`/productos/${id}`),
  
  crear: (token: string, data: CrearProductoInput) =>
    apiRequest<{ mensaje: string; producto: Producto }>("/productos", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),
  
  actualizar: (token: string, id: number, data: Partial<CrearProductoInput>) =>
    apiRequest<{ mensaje: string; producto: Producto }>(`/productos/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    }),
};

// Inventory API
export const inventarioApi = {
  saldos: (params?: { id_producto?: number; id_ubicacion?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.id_producto) searchParams.set("id_producto", params.id_producto.toString());
    if (params?.id_ubicacion) searchParams.set("id_ubicacion", params.id_ubicacion.toString());
    
    const query = searchParams.toString();
    return apiRequest<InventarioSaldo[]>(`/inventario${query ? `?${query}` : ""}`);
  },
  
  ajuste: (token: string, data: AjusteInventarioInput) =>
    apiRequest<{ mensaje: string; saldo: InventarioSaldo; movimiento: MovimientoInventario }>("/inventario/ajuste", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),
};

// KPI API (admin)
export const kpiApi = {
  resumenFinanciero: (token: string, params?: { fecha_desde?: string; fecha_hasta?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.fecha_desde) searchParams.set("fecha_desde", params.fecha_desde);
    if (params?.fecha_hasta) searchParams.set("fecha_hasta", params.fecha_hasta);
    
    const query = searchParams.toString();
    return apiRequest<KpiResumenFinanciero>(`/kpi/resumen-financiero${query ? `?${query}` : ""}`, { token });
  },
  
  ventasDiarias: (token: string, params?: { fecha_desde?: string; fecha_hasta?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.fecha_desde) searchParams.set("fecha_desde", params.fecha_desde);
    if (params?.fecha_hasta) searchParams.set("fecha_hasta", params.fecha_hasta);
    
    const query = searchParams.toString();
    return apiRequest<KpiVentasDiarias[]>(`/kpi/ventas-diarias${query ? `?${query}` : ""}`, { token });
  },
  
  ventasPorCategoria: (token: string, params?: { fecha_desde?: string; fecha_hasta?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.fecha_desde) searchParams.set("fecha_desde", params.fecha_desde);
    if (params?.fecha_hasta) searchParams.set("fecha_hasta", params.fecha_hasta);
    
    const query = searchParams.toString();
    return apiRequest<KpiVentasPorCategoria[]>(`/kpi/ventas-por-categoria${query ? `?${query}` : ""}`, { token });
  },
  
  topProductos: (token: string, params?: { fecha_desde?: string; fecha_hasta?: string; limite?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.fecha_desde) searchParams.set("fecha_desde", params.fecha_desde);
    if (params?.fecha_hasta) searchParams.set("fecha_hasta", params.fecha_hasta);
    if (params?.limite) searchParams.set("limite", params.limite.toString());
    
    const query = searchParams.toString();
    return apiRequest<KpiTopProducto[]>(`/kpi/top-productos${query ? `?${query}` : ""}`, { token });
  },
  
  inventarioBajoMinimo: (token: string) =>
    apiRequest<KpiBajoMinimo[]>("/kpi/inventario-bajo-minimo", { token }),
  
  gastosPorCategoria: (token: string, params?: { fecha_desde?: string; fecha_hasta?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.fecha_desde) searchParams.set("fecha_desde", params.fecha_desde);
    if (params?.fecha_hasta) searchParams.set("fecha_hasta", params.fecha_hasta);
    
    const query = searchParams.toString();
    return apiRequest<KpiGastosPorCategoria[]>(`/kpi/gastos-por-categoria${query ? `?${query}` : ""}`, { token });
  },
};

// Types
export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: "ADMINISTRADOR" | "VENDEDOR" | "CLIENTE";
  activo: boolean;
  telefono?: string;
  nit: string;
  direccion?: string;
  dpi?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface ProductoCatalogo {
  id: number;
  nombre: string;
  descripcion?: string;
  marca?: string;
  url_imagen?: string;
  stock_minimo: number;
  categoria?: Categoria;
  precio_desde?: string;
  precio_hasta?: string;
  tiene_precio: boolean;
}

export interface Presentacion {
  id: number;
  id_producto: number;
  nombre: string;
  url_imagen?: string;
  codigo_barras?: string;
  id_unidad_venta: number;
  unidades_por_unidad_venta: number;
  precio_venta_por_defecto?: string;
  precio_minimo?: string;
  activo: boolean;
}

export interface ProductoDetalle extends ProductoCatalogo {
  presentaciones: Presentacion[];
}

export interface PresentacionDetalle extends Presentacion {
  producto: ProductoDetalle;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  marca?: string;
  url_imagen?: string;
  id_categoria?: number;
  id_unidad_base: number;
  es_perecedero: boolean;
  stock_minimo: number;
  activo: boolean;
  categoria?: Categoria;
}

export interface ProductoConPresentaciones extends Producto {
  presentaciones: Presentacion[];
}

export interface ItemCarrito {
  id: number;
  id_carrito: number;
  id_presentacion_producto: number;
  cantidad_unidad_venta: string;
  precio_unitario: string;
  subtotal_linea: string;
  notas?: string;
  presentacion?: Presentacion & { producto?: Producto };
}

export interface Carrito {
  id: number;
  id_usuario_cliente: number;
  estado: "ACTIVO" | "CONVERTIDO" | "CANCELADO";
  notas?: string;
  items: ItemCarrito[];
}

export interface DetallePedido {
  id: number;
  id_pedido: number;
  id_presentacion_producto: number;
  cantidad_unidad_venta: number;
  cantidad_unidad_base: number;
  precio_unitario: number;
  origen_precio: "SISTEMA" | "MANUAL";
  subtotal_linea: number;
  presentacion?: Presentacion & { producto?: Producto };
}

export interface Pedido {
  id: number;
  id_usuario_cliente?: number;
  id_ubicacion_salida: number;
  fuente: "ONLINE" | "ADMIN" | "OTRO" | "TIENDA_EN_LINEA" | "DESDE_CARRITO";
  estado: "PENDIENTE" | "CANCELADO" | "COMPLETADO";
  fecha_pedido: string;
  tipo_entrega: "DOMICILIO" | "RECOGER_EN_LOCAL";
  direccion_entrega?: string;
  requiere_factura: boolean;
  nit_factura: string;
  nombre_factura?: string;
  subtotal_productos: number;
  cargo_envio: number;
  descuento_total: number;
  total_general: number;
  notas_cliente?: string;
  notas_internas?: string;
  cliente_usuario?: Usuario;
  ubicacion_salida?: { id: number; nombre: string; tipo?: string };
  detalles: DetallePedido[];
  venta?: Venta;
}

export interface DetalleVenta {
  id: number;
  id_venta: number;
  id_presentacion_producto: number;
  cantidad_unidad_venta: number;
  cantidad_unidad_base: number;
  precio_unitario_venta: number;
  precio_unitario_base: number;
  es_precio_manual: boolean;
  subtotal_linea: number;
  presentacion?: Presentacion & { producto?: Producto };
}

export interface Venta {
  id: number;
  id_pedido?: number;
  id_usuario_cliente?: number;
  id_ubicacion_salida: number;
  nombre_cliente?: string;
  fecha_venta: string;
  subtotal_productos: number;
  impuestos: number;
  cargo_envio: number;
  descuento_total: number;
  total_general: number;
  tipo_pago?: string;
  estado_pago: "PENDIENTE" | "PAGADO" | "PARCIAL";
  estado: "REGISTRADA" | "ANULADA";
  notas?: string;
  cliente_usuario?: Usuario;
  ubicacion_salida?: { id: number; nombre: string; tipo?: string };
  detalles: DetalleVenta[];
  pedido?: Pedido;
}

export interface InventarioSaldo {
  id: number;
  id_producto: number;
  id_ubicacion: number;
  cantidad_disponible: number;
  cantidad_reservada: number;
  producto?: Producto;
  ubicacion?: { id: number; nombre: string; tipo?: string };
}

export interface MovimientoInventario {
  id: number;
  id_producto: number;
  id_ubicacion: number;
  tipo_movimiento: string;
  cantidad: number;
  referencia_tipo?: string;
  id_referencia?: number;
  notas?: string;
}

export interface MetaPaginacion {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface CatalogoParams {
  texto?: string;
  id_categoria?: number;
  marca?: string;
  precio_min?: number;
  precio_max?: number;
  page?: number;
  limit?: number;
  sort?: "nombre" | "precio";
  order?: "asc" | "desc";
}

export interface PedidoParams {
  estado?: "PENDIENTE" | "CANCELADO" | "COMPLETADO";
  id_cliente?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface ConfirmarCarritoInput {
  id_ubicacion_salida: number;
  tipo_entrega: "DOMICILIO" | "RECOGER_EN_LOCAL";
  direccion_entrega?: string;
  requiere_factura: boolean;
  nit_factura?: string;
  nombre_factura?: string;
  cargo_envio?: number;
  notas_cliente?: string;
}

export interface CrearPedidoInput {
  id_ubicacion_salida: number;
  id_usuario_cliente?: number;
  fuente?: string;
  tipo_entrega: "DOMICILIO" | "RECOGER_EN_LOCAL";
  direccion_entrega?: string;
  requiere_factura: boolean;
  nit_factura?: string;
  nombre_factura?: string;
  cargo_envio?: number;
  notas_cliente?: string;
  detalles: { id_presentacion_producto: number; cantidad_unidad_venta: number; precio_unitario?: number }[];
}

export interface CrearVentaInput {
  id_pedido?: number;
  id_ubicacion_salida?: number;
  id_usuario_cliente?: number;
  nombre_cliente?: string;
  fecha_venta?: string;
  cargo_envio?: number;
  descuento_total?: number;
  tipo_pago?: string;
  estado_pago?: "PENDIENTE" | "PAGADO" | "PARCIAL";
  notas?: string;
  detalles?: { id_presentacion_producto: number; cantidad_unidad_venta: number; precio_unitario?: number }[];
}

export interface CrearProductoInput {
  nombre: string;
  descripcion?: string;
  marca?: string;
  url_imagen?: string;
  id_categoria?: number;
  id_unidad_base: number;
  es_perecedero?: boolean;
  stock_minimo?: number;
  activo?: boolean;
}

export interface AjusteInventarioInput {
  id_producto: number;
  id_ubicacion: number;
  cantidad: number;
  motivo?: string;
}

export interface KpiResumenFinanciero {
  rango_fechas: { fecha_desde?: string; fecha_hasta?: string };
  resumen: {
    total_ventas: number;
    total_gastos: number;
    total_cobros_clientes: number;
    utilidad_neta_estimada: number;
    margen_sobre_ventas: number;
    cuentas_por_cobrar_estimadas: number;
  };
}

export interface KpiVentasDiarias {
  fecha: string;
  total_ventas: string;
  cantidad_ventas: string;
}

export interface KpiVentasPorCategoria {
  id_categoria: number;
  nombre_categoria: string;
  total_ventas: string;
  unidades_vendidas: string;
}

export interface KpiTopProducto {
  id_producto: number;
  nombre_producto: string;
  total_ventas: string;
  unidades_vendidas_base: string;
}

export interface KpiBajoMinimo {
  id_producto: number;
  nombre_producto: string;
  categoria?: { id: number; nombre: string };
  stock_disponible: number;
  stock_reservado: number;
  stock_total: number;
  stock_minimo: number;
  es_perecedero: boolean;
  bajo_minimo: boolean;
}

export interface KpiGastosPorCategoria {
  id_categoria_gasto?: number;
  total_gasto: string;
  categoria_gasto?: { nombre: string };
}

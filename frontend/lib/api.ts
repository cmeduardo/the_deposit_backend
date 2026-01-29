const API_BASE_URL = "https://the-deposit-backend.onrender.com/api";

// Types
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  rol: "CLIENTE" | "VENDEDOR" | "ADMINISTRADOR";
  activo: boolean;
}

export interface CategoriaProducto {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Unidad {
  id: number;
  nombre: string;
  abreviatura: string;
}

export interface PresentacionProducto {
  id: number;
  producto_id: number;
  cantidad: number;
  unidad_id: number;
  precio_venta: number;
  codigo_barras?: string;
  activo: boolean;
  Unidad?: Unidad;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria_id: number;
  imagen_url?: string;
  activo: boolean;
  CategoriaProducto?: CategoriaProducto;
  Presentaciones?: PresentacionProducto[];
}

export interface ItemCarrito {
  id: number;
  carrito_id: number;
  presentacion_id: number;
  cantidad: number;
  precio_unitario: number;
  PresentacionProducto?: PresentacionProducto & {
    Producto?: Producto;
  };
}

export interface CarritoCompra {
  id: number;
  usuario_id: number;
  activo: boolean;
  Items?: ItemCarrito[];
}

export interface DetallePedido {
  id: number;
  pedido_id: number;
  presentacion_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  PresentacionProducto?: PresentacionProducto & {
    Producto?: Producto;
  };
}

export interface Pedido {
  id: number;
  usuario_id: number;
  fecha: string;
  estado: "PENDIENTE" | "CONFIRMADO" | "EN_PREPARACION" | "ENVIADO" | "ENTREGADO" | "CANCELADO";
  total: number;
  direccion_entrega?: string;
  tipo_entrega: "DOMICILIO" | "RECOGER_EN_TIENDA";
  notas?: string;
  Usuario?: Usuario;
  Detalles?: DetallePedido[];
}

export interface Venta {
  id: number;
  pedido_id?: number;
  usuario_id?: number;
  vendedor_id: number;
  fecha: string;
  subtotal: number;
  descuento: number;
  total: number;
  metodo_pago: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "CREDITO";
  estado: "COMPLETADA" | "ANULADA";
  Pedido?: Pedido;
  Usuario?: Usuario;
  Vendedor?: Usuario;
  Detalles?: DetalleVenta[];
}

export interface DetalleVenta {
  id: number;
  venta_id: number;
  presentacion_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  PresentacionProducto?: PresentacionProducto & {
    Producto?: Producto;
  };
}

export interface InventarioSaldo {
  id: number;
  presentacion_id: number;
  ubicacion_id: number;
  cantidad: number;
  stock_minimo: number;
  PresentacionProducto?: PresentacionProducto & {
    Producto?: Producto;
  };
  UbicacionInventario?: UbicacionInventario;
}

export interface UbicacionInventario {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface KPIs {
  ventas_totales: number;
  gastos_totales: number;
  utilidad_neta: number;
  cuentas_por_cobrar: number;
  pedidos_pendientes: number;
  productos_bajo_stock: number;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error de conexión" }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiCall<AuthResponse>("/autenticacion/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { nombre: string; email: string; password: string; telefono?: string; direccion?: string }) =>
    apiCall<AuthResponse>("/autenticacion/registro", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProfile: () => apiCall<Usuario>("/autenticacion/perfil"),

  updateProfile: (data: Partial<Usuario>) =>
    apiCall<Usuario>("/autenticacion/perfil", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Catalog API
export const catalogApi = {
  getProducts: (params?: {
    categoria_id?: number;
    busqueda?: string;
    pagina?: number;
    limite?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoria_id) searchParams.append("categoria_id", params.categoria_id.toString());
    if (params?.busqueda) searchParams.append("busqueda", params.busqueda);
    if (params?.pagina) searchParams.append("pagina", params.pagina.toString());
    if (params?.limite) searchParams.append("limite", params.limite.toString());
    
    const query = searchParams.toString();
    return apiCall<{ productos: Producto[]; total: number; paginas: number }>(
      `/catalogo/productos${query ? `?${query}` : ""}`
    );
  },

  getProduct: (id: number) => apiCall<Producto>(`/catalogo/productos/${id}`),

  getCategories: () => apiCall<CategoriaProducto[]>("/catalogo/categorias"),
};

// Cart API
export const cartApi = {
  getCart: () => apiCall<CarritoCompra>("/carrito"),

  addItem: (presentacion_id: number, cantidad: number) =>
    apiCall<ItemCarrito>("/carrito/items", {
      method: "POST",
      body: JSON.stringify({ presentacion_id, cantidad }),
    }),

  updateItem: (itemId: number, cantidad: number) =>
    apiCall<ItemCarrito>(`/carrito/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ cantidad }),
    }),

  removeItem: (itemId: number) =>
    apiCall<void>(`/carrito/items/${itemId}`, {
      method: "DELETE",
    }),

  clearCart: () =>
    apiCall<void>("/carrito", {
      method: "DELETE",
    }),
};

// Orders API
export const ordersApi = {
  create: (data: {
    tipo_entrega: "DOMICILIO" | "RECOGER_EN_TIENDA";
    direccion_entrega?: string;
    notas?: string;
    requiere_factura?: boolean;
    datos_factura?: {
      nit: string;
      nombre: string;
      direccion: string;
    };
  }) =>
    apiCall<Pedido>("/pedidos", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: (params?: { estado?: string; pagina?: number; limite?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.estado) searchParams.append("estado", params.estado);
    if (params?.pagina) searchParams.append("pagina", params.pagina.toString());
    if (params?.limite) searchParams.append("limite", params.limite.toString());
    
    const query = searchParams.toString();
    return apiCall<{ pedidos: Pedido[]; total: number; paginas: number }>(
      `/pedidos${query ? `?${query}` : ""}`
    );
  },

  getOne: (id: number) => apiCall<Pedido>(`/pedidos/${id}`),

  updateStatus: (id: number, estado: Pedido["estado"]) =>
    apiCall<Pedido>(`/pedidos/${id}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    }),

  cancel: (id: number) =>
    apiCall<Pedido>(`/pedidos/${id}/cancelar`, {
      method: "PUT",
    }),

  convertToSale: (id: number, data: { metodo_pago: Venta["metodo_pago"]; descuento?: number }) =>
    apiCall<Venta>(`/pedidos/${id}/convertir-venta`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Sales API
export const salesApi = {
  getAll: (params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
    pagina?: number;
    limite?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.fecha_inicio) searchParams.append("fecha_inicio", params.fecha_inicio);
    if (params?.fecha_fin) searchParams.append("fecha_fin", params.fecha_fin);
    if (params?.estado) searchParams.append("estado", params.estado);
    if (params?.pagina) searchParams.append("pagina", params.pagina.toString());
    if (params?.limite) searchParams.append("limite", params.limite.toString());
    
    const query = searchParams.toString();
    return apiCall<{ ventas: Venta[]; total: number; paginas: number }>(
      `/ventas${query ? `?${query}` : ""}`
    );
  },

  getOne: (id: number) => apiCall<Venta>(`/ventas/${id}`),

  create: (data: {
    items: { presentacion_id: number; cantidad: number; precio_unitario: number }[];
    metodo_pago: Venta["metodo_pago"];
    descuento?: number;
    usuario_id?: number;
  }) =>
    apiCall<Venta>("/ventas", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  cancel: (id: number) =>
    apiCall<Venta>(`/ventas/${id}/anular`, {
      method: "PUT",
    }),
};

// Products API (Admin)
export const productsApi = {
  getAll: (params?: { categoria_id?: number; activo?: boolean; pagina?: number; limite?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoria_id) searchParams.append("categoria_id", params.categoria_id.toString());
    if (params?.activo !== undefined) searchParams.append("activo", params.activo.toString());
    if (params?.pagina) searchParams.append("pagina", params.pagina.toString());
    if (params?.limite) searchParams.append("limite", params.limite.toString());
    
    const query = searchParams.toString();
    return apiCall<{ productos: Producto[]; total: number; paginas: number }>(
      `/productos${query ? `?${query}` : ""}`
    );
  },

  getOne: (id: number) => apiCall<Producto>(`/productos/${id}`),

  create: (data: Partial<Producto>) =>
    apiCall<Producto>("/productos", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Producto>) =>
    apiCall<Producto>(`/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiCall<void>(`/productos/${id}`, {
      method: "DELETE",
    }),
};

// Categories API (Admin)
export const categoriesApi = {
  getAll: () => apiCall<CategoriaProducto[]>("/categorias-producto"),

  create: (data: { nombre: string; descripcion?: string }) =>
    apiCall<CategoriaProducto>("/categorias-producto", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: { nombre?: string; descripcion?: string; activo?: boolean }) =>
    apiCall<CategoriaProducto>(`/categorias-producto/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiCall<void>(`/categorias-producto/${id}`, {
      method: "DELETE",
    }),
};

// Inventory API (Admin)
export const inventoryApi = {
  getAll: (params?: { ubicacion_id?: number; bajo_stock?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.ubicacion_id) searchParams.append("ubicacion_id", params.ubicacion_id.toString());
    if (params?.bajo_stock) searchParams.append("bajo_stock", "true");
    
    const query = searchParams.toString();
    return apiCall<InventarioSaldo[]>(`/inventario${query ? `?${query}` : ""}`);
  },

  adjustStock: (presentacion_id: number, data: { cantidad: number; tipo: "ENTRADA" | "SALIDA" | "AJUSTE"; motivo: string }) =>
    apiCall<InventarioSaldo>(`/inventario/${presentacion_id}/ajuste`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getLocations: () => apiCall<UbicacionInventario[]>("/ubicaciones-inventario"),
};

// KPIs API (Admin)
export const kpiApi = {
  getDashboard: (params?: { fecha_inicio?: string; fecha_fin?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.fecha_inicio) searchParams.append("fecha_inicio", params.fecha_inicio);
    if (params?.fecha_fin) searchParams.append("fecha_fin", params.fecha_fin);
    
    const query = searchParams.toString();
    return apiCall<KPIs>(`/kpis/dashboard${query ? `?${query}` : ""}`);
  },

  getSalesByDay: (params?: { fecha_inicio?: string; fecha_fin?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.fecha_inicio) searchParams.append("fecha_inicio", params.fecha_inicio);
    if (params?.fecha_fin) searchParams.append("fecha_fin", params.fecha_fin);
    
    const query = searchParams.toString();
    return apiCall<{ fecha: string; total: number }[]>(`/kpis/ventas-por-dia${query ? `?${query}` : ""}`);
  },

  getTopProducts: (limite?: number) => {
    const query = limite ? `?limite=${limite}` : "";
    return apiCall<{ producto: string; cantidad: number; total: number }[]>(`/kpis/productos-mas-vendidos${query}`);
  },

  getLowStock: () => apiCall<InventarioSaldo[]>("/kpis/productos-bajo-stock"),
};

// Users API (Admin)
export const usersApi = {
  getAll: (params?: { rol?: string; activo?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.rol) searchParams.append("rol", params.rol);
    if (params?.activo !== undefined) searchParams.append("activo", params.activo.toString());
    
    const query = searchParams.toString();
    return apiCall<Usuario[]>(`/usuarios${query ? `?${query}` : ""}`);
  },

  getOne: (id: number) => apiCall<Usuario>(`/usuarios/${id}`),

  create: (data: Partial<Usuario> & { password: string }) =>
    apiCall<Usuario>("/usuarios", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Usuario>) =>
    apiCall<Usuario>(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiCall<void>(`/usuarios/${id}`, {
      method: "DELETE",
    }),
};

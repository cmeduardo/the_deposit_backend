// Mock Data for The Deposit - Independent Frontend
// This file contains all mock data for the application

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  marca?: string;
  url_imagen?: string;
  id_categoria?: number;
  categoria?: Categoria;
  stock_minimo: number;
  activo: boolean;
  presentaciones: Presentacion[];
}

export interface Presentacion {
  id: number;
  id_producto: number;
  nombre: string;
  url_imagen?: string;
  codigo_barras?: string;
  precio_venta: number;
  precio_minimo?: number;
  activo: boolean;
  stock_disponible: number;
}

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: "ADMINISTRADOR" | "VENDEDOR" | "CLIENTE";
  activo: boolean;
  telefono?: string;
  nit: string;
  direccion?: string;
}

export interface ItemCarrito {
  id: number;
  presentacion: Presentacion & { producto: Producto };
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas?: string;
}

export interface Pedido {
  id: number;
  cliente?: Usuario;
  fecha_pedido: string;
  estado: "PENDIENTE" | "COMPLETADO" | "CANCELADO";
  tipo_entrega: "DOMICILIO" | "RECOGER_EN_LOCAL";
  direccion_entrega?: string;
  requiere_factura: boolean;
  nit_factura?: string;
  nombre_factura?: string;
  subtotal: number;
  cargo_envio: number;
  total: number;
  notas?: string;
  detalles: DetallePedido[];
}

export interface DetallePedido {
  id: number;
  presentacion: Presentacion & { producto: Producto };
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  id_pedido?: number;
  cliente?: Usuario;
  fecha_venta: string;
  subtotal: number;
  impuestos: number;
  cargo_envio: number;
  descuento: number;
  total: number;
  tipo_pago: string;
  estado_pago: "PENDIENTE" | "PAGADO" | "PARCIAL";
  estado: "REGISTRADA" | "ANULADA";
  detalles: DetalleVenta[];
}

export interface DetalleVenta {
  id: number;
  presentacion: Presentacion & { producto: Producto };
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface InventarioSaldo {
  id: number;
  producto: Producto;
  ubicacion: { id: number; nombre: string };
  cantidad_disponible: number;
  cantidad_reservada: number;
}

// Categories
export const mockCategorias: Categoria[] = [
  { id: 1, nombre: "Bebidas", descripcion: "Refrescos, jugos, agua y más", activo: true },
  { id: 2, nombre: "Snacks", descripcion: "Botanas, galletas y dulces", activo: true },
  { id: 3, nombre: "Lácteos", descripcion: "Leche, quesos y yogurt", activo: true },
  { id: 4, nombre: "Abarrotes", descripcion: "Productos básicos de despensa", activo: true },
  { id: 5, nombre: "Limpieza", descripcion: "Productos de limpieza del hogar", activo: true },
  { id: 6, nombre: "Higiene Personal", descripcion: "Jabones, shampoo y más", activo: true },
];

// Products with presentations
export const mockProductos: Producto[] = [
  {
    id: 1,
    nombre: "Coca-Cola",
    descripcion: "Refresco de cola clásico",
    marca: "Coca-Cola",
    url_imagen: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=400&fit=crop",
    id_categoria: 1,
    categoria: mockCategorias[0],
    stock_minimo: 24,
    activo: true,
    presentaciones: [
      { id: 1, id_producto: 1, nombre: "Lata 355ml", precio_venta: 12.00, activo: true, stock_disponible: 120 },
      { id: 2, id_producto: 1, nombre: "Botella 600ml", precio_venta: 15.00, activo: true, stock_disponible: 80 },
      { id: 3, id_producto: 1, nombre: "Botella 2L", precio_venta: 28.00, activo: true, stock_disponible: 45 },
    ],
  },
  {
    id: 2,
    nombre: "Pepsi",
    descripcion: "Refresco de cola",
    marca: "PepsiCo",
    url_imagen: "https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=400&h=400&fit=crop",
    id_categoria: 1,
    categoria: mockCategorias[0],
    stock_minimo: 24,
    activo: true,
    presentaciones: [
      { id: 4, id_producto: 2, nombre: "Lata 355ml", precio_venta: 11.00, activo: true, stock_disponible: 100 },
      { id: 5, id_producto: 2, nombre: "Botella 600ml", precio_venta: 14.00, activo: true, stock_disponible: 75 },
    ],
  },
  {
    id: 3,
    nombre: "Agua Pura",
    descripcion: "Agua purificada",
    marca: "Salvavidas",
    url_imagen: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop",
    id_categoria: 1,
    categoria: mockCategorias[0],
    stock_minimo: 48,
    activo: true,
    presentaciones: [
      { id: 6, id_producto: 3, nombre: "Botella 500ml", precio_venta: 5.00, activo: true, stock_disponible: 200 },
      { id: 7, id_producto: 3, nombre: "Botella 1L", precio_venta: 8.00, activo: true, stock_disponible: 150 },
      { id: 8, id_producto: 3, nombre: "Garrafón 5L", precio_venta: 25.00, activo: true, stock_disponible: 30 },
    ],
  },
  {
    id: 4,
    nombre: "Doritos Nacho",
    descripcion: "Tortillas de maíz sabor nacho",
    marca: "Sabritas",
    url_imagen: "https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&h=400&fit=crop",
    id_categoria: 2,
    categoria: mockCategorias[1],
    stock_minimo: 20,
    activo: true,
    presentaciones: [
      { id: 9, id_producto: 4, nombre: "Bolsa 45g", precio_venta: 12.00, activo: true, stock_disponible: 60 },
      { id: 10, id_producto: 4, nombre: "Bolsa 145g", precio_venta: 28.00, activo: true, stock_disponible: 40 },
    ],
  },
  {
    id: 5,
    nombre: "Cheetos Flamin Hot",
    descripcion: "Frituras de maíz picantes",
    marca: "Sabritas",
    url_imagen: "https://images.unsplash.com/photo-1568702846914-96b305d2uj33?w=400&h=400&fit=crop",
    id_categoria: 2,
    categoria: mockCategorias[1],
    stock_minimo: 20,
    activo: true,
    presentaciones: [
      { id: 11, id_producto: 5, nombre: "Bolsa 52g", precio_venta: 14.00, activo: true, stock_disponible: 55 },
      { id: 12, id_producto: 5, nombre: "Bolsa 145g", precio_venta: 32.00, activo: true, stock_disponible: 35 },
    ],
  },
  {
    id: 6,
    nombre: "Leche Entera",
    descripcion: "Leche de vaca pasteurizada",
    marca: "Foremost",
    url_imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
    id_categoria: 3,
    categoria: mockCategorias[2],
    stock_minimo: 30,
    activo: true,
    presentaciones: [
      { id: 13, id_producto: 6, nombre: "Litro", precio_venta: 14.00, activo: true, stock_disponible: 80 },
      { id: 14, id_producto: 6, nombre: "Galón", precio_venta: 48.00, activo: true, stock_disponible: 25 },
    ],
  },
  {
    id: 7,
    nombre: "Queso Fresco",
    descripcion: "Queso fresco artesanal",
    marca: "La Vaquita",
    url_imagen: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop",
    id_categoria: 3,
    categoria: mockCategorias[2],
    stock_minimo: 10,
    activo: true,
    presentaciones: [
      { id: 15, id_producto: 7, nombre: "Libra", precio_venta: 35.00, activo: true, stock_disponible: 20 },
      { id: 16, id_producto: 7, nombre: "Media Libra", precio_venta: 18.00, activo: true, stock_disponible: 15 },
    ],
  },
  {
    id: 8,
    nombre: "Arroz",
    descripcion: "Arroz blanco de grano largo",
    marca: "Gallo Dorado",
    url_imagen: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
    id_categoria: 4,
    categoria: mockCategorias[3],
    stock_minimo: 25,
    activo: true,
    presentaciones: [
      { id: 17, id_producto: 8, nombre: "Libra", precio_venta: 8.00, activo: true, stock_disponible: 100 },
      { id: 18, id_producto: 8, nombre: "5 Libras", precio_venta: 38.00, activo: true, stock_disponible: 40 },
      { id: 19, id_producto: 8, nombre: "Quintal", precio_venta: 350.00, activo: true, stock_disponible: 10 },
    ],
  },
  {
    id: 9,
    nombre: "Frijol Negro",
    descripcion: "Frijol negro entero",
    marca: "Del Monte",
    url_imagen: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop",
    id_categoria: 4,
    categoria: mockCategorias[3],
    stock_minimo: 20,
    activo: true,
    presentaciones: [
      { id: 20, id_producto: 9, nombre: "Libra", precio_venta: 12.00, activo: true, stock_disponible: 85 },
      { id: 21, id_producto: 9, nombre: "5 Libras", precio_venta: 55.00, activo: true, stock_disponible: 30 },
    ],
  },
  {
    id: 10,
    nombre: "Azúcar",
    descripcion: "Azúcar blanca estándar",
    marca: "Caña Real",
    url_imagen: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop",
    id_categoria: 4,
    categoria: mockCategorias[3],
    stock_minimo: 30,
    activo: true,
    presentaciones: [
      { id: 22, id_producto: 10, nombre: "Libra", precio_venta: 6.00, activo: true, stock_disponible: 120 },
      { id: 23, id_producto: 10, nombre: "5 Libras", precio_venta: 28.00, activo: true, stock_disponible: 45 },
      { id: 24, id_producto: 10, nombre: "Quintal", precio_venta: 280.00, activo: true, stock_disponible: 8 },
    ],
  },
  {
    id: 11,
    nombre: "Detergente Líquido",
    descripcion: "Detergente para ropa",
    marca: "Ariel",
    url_imagen: "https://images.unsplash.com/photo-1585441695325-21557e48b9a8?w=400&h=400&fit=crop",
    id_categoria: 5,
    categoria: mockCategorias[4],
    stock_minimo: 15,
    activo: true,
    presentaciones: [
      { id: 25, id_producto: 11, nombre: "1 Litro", precio_venta: 45.00, activo: true, stock_disponible: 35 },
      { id: 26, id_producto: 11, nombre: "3 Litros", precio_venta: 120.00, activo: true, stock_disponible: 20 },
    ],
  },
  {
    id: 12,
    nombre: "Jabón de Baño",
    descripcion: "Jabón de tocador",
    marca: "Dove",
    url_imagen: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=400&fit=crop",
    id_categoria: 6,
    categoria: mockCategorias[5],
    stock_minimo: 20,
    activo: true,
    presentaciones: [
      { id: 27, id_producto: 12, nombre: "Barra 90g", precio_venta: 18.00, activo: true, stock_disponible: 50 },
      { id: 28, id_producto: 12, nombre: "Pack 3 Barras", precio_venta: 48.00, activo: true, stock_disponible: 25 },
    ],
  },
];

// Users
export const mockUsuarios: Usuario[] = [
  {
    id: 1,
    nombre: "Admin Principal",
    correo: "admin@thedeposit.com",
    rol: "ADMINISTRADOR",
    activo: true,
    telefono: "54204805",
    nit: "12345678-9",
  },
  {
    id: 2,
    nombre: "Vendedor 1",
    correo: "vendedor@thedeposit.com",
    rol: "VENDEDOR",
    activo: true,
    telefono: "55667788",
    nit: "CF",
  },
  {
    id: 3,
    nombre: "Juan Pérez",
    correo: "juan@email.com",
    rol: "CLIENTE",
    activo: true,
    telefono: "44556677",
    nit: "98765432-1",
    direccion: "Calle Principal 123, Antigua Guatemala",
  },
  {
    id: 4,
    nombre: "María García",
    correo: "maria@email.com",
    rol: "CLIENTE",
    activo: true,
    telefono: "33445566",
    nit: "CF",
    direccion: "Avenida Central 456, Antigua Guatemala",
  },
];

// Orders
export const mockPedidos: Pedido[] = [
  {
    id: 1,
    cliente: mockUsuarios[2],
    fecha_pedido: "2025-01-28T10:30:00Z",
    estado: "PENDIENTE",
    tipo_entrega: "DOMICILIO",
    direccion_entrega: "Calle Principal 123, Antigua Guatemala",
    requiere_factura: true,
    nit_factura: "98765432-1",
    nombre_factura: "Juan Pérez",
    subtotal: 156.00,
    cargo_envio: 15.00,
    total: 171.00,
    detalles: [
      {
        id: 1,
        presentacion: { ...mockProductos[0].presentaciones[1], producto: mockProductos[0] },
        cantidad: 6,
        precio_unitario: 15.00,
        subtotal: 90.00,
      },
      {
        id: 2,
        presentacion: { ...mockProductos[3].presentaciones[1], producto: mockProductos[3] },
        cantidad: 2,
        precio_unitario: 28.00,
        subtotal: 56.00,
      },
    ],
  },
  {
    id: 2,
    cliente: mockUsuarios[3],
    fecha_pedido: "2025-01-28T14:15:00Z",
    estado: "PENDIENTE",
    tipo_entrega: "RECOGER_EN_LOCAL",
    requiere_factura: false,
    nit_factura: "CF",
    subtotal: 235.00,
    cargo_envio: 0,
    total: 235.00,
    detalles: [
      {
        id: 3,
        presentacion: { ...mockProductos[7].presentaciones[1], producto: mockProductos[7] },
        cantidad: 2,
        precio_unitario: 38.00,
        subtotal: 76.00,
      },
      {
        id: 4,
        presentacion: { ...mockProductos[8].presentaciones[1], producto: mockProductos[8] },
        cantidad: 1,
        precio_unitario: 55.00,
        subtotal: 55.00,
      },
      {
        id: 5,
        presentacion: { ...mockProductos[5].presentaciones[1], producto: mockProductos[5] },
        cantidad: 2,
        precio_unitario: 48.00,
        subtotal: 96.00,
      },
    ],
  },
  {
    id: 3,
    cliente: mockUsuarios[2],
    fecha_pedido: "2025-01-27T09:00:00Z",
    estado: "COMPLETADO",
    tipo_entrega: "DOMICILIO",
    direccion_entrega: "Calle Principal 123, Antigua Guatemala",
    requiere_factura: true,
    nit_factura: "98765432-1",
    nombre_factura: "Juan Pérez",
    subtotal: 320.00,
    cargo_envio: 15.00,
    total: 335.00,
    detalles: [
      {
        id: 6,
        presentacion: { ...mockProductos[9].presentaciones[2], producto: mockProductos[9] },
        cantidad: 1,
        precio_unitario: 280.00,
        subtotal: 280.00,
      },
      {
        id: 7,
        presentacion: { ...mockProductos[2].presentaciones[2], producto: mockProductos[2] },
        cantidad: 2,
        precio_unitario: 25.00,
        subtotal: 50.00,
      },
    ],
  },
];

// Sales
export const mockVentas: Venta[] = [
  {
    id: 1,
    id_pedido: 3,
    cliente: mockUsuarios[2],
    fecha_venta: "2025-01-27T09:30:00Z",
    subtotal: 320.00,
    impuestos: 0,
    cargo_envio: 15.00,
    descuento: 0,
    total: 335.00,
    tipo_pago: "EFECTIVO",
    estado_pago: "PAGADO",
    estado: "REGISTRADA",
    detalles: [
      {
        id: 1,
        presentacion: { ...mockProductos[9].presentaciones[2], producto: mockProductos[9] },
        cantidad: 1,
        precio_unitario: 280.00,
        subtotal: 280.00,
      },
      {
        id: 2,
        presentacion: { ...mockProductos[2].presentaciones[2], producto: mockProductos[2] },
        cantidad: 2,
        precio_unitario: 25.00,
        subtotal: 50.00,
      },
    ],
  },
  {
    id: 2,
    cliente: mockUsuarios[3],
    fecha_venta: "2025-01-26T16:00:00Z",
    subtotal: 186.00,
    impuestos: 0,
    cargo_envio: 0,
    descuento: 10.00,
    total: 176.00,
    tipo_pago: "TARJETA",
    estado_pago: "PAGADO",
    estado: "REGISTRADA",
    detalles: [
      {
        id: 3,
        presentacion: { ...mockProductos[10].presentaciones[1], producto: mockProductos[10] },
        cantidad: 1,
        precio_unitario: 120.00,
        subtotal: 120.00,
      },
      {
        id: 4,
        presentacion: { ...mockProductos[11].presentaciones[1], producto: mockProductos[11] },
        cantidad: 2,
        precio_unitario: 48.00,
        subtotal: 96.00,
      },
    ],
  },
  {
    id: 3,
    fecha_venta: "2025-01-25T11:00:00Z",
    subtotal: 89.00,
    impuestos: 0,
    cargo_envio: 0,
    descuento: 0,
    total: 89.00,
    tipo_pago: "EFECTIVO",
    estado_pago: "PAGADO",
    estado: "REGISTRADA",
    detalles: [
      {
        id: 5,
        presentacion: { ...mockProductos[0].presentaciones[0], producto: mockProductos[0] },
        cantidad: 5,
        precio_unitario: 12.00,
        subtotal: 60.00,
      },
      {
        id: 6,
        presentacion: { ...mockProductos[3].presentaciones[0], producto: mockProductos[3] },
        cantidad: 2,
        precio_unitario: 12.00,
        subtotal: 24.00,
      },
    ],
  },
];

// Inventory
export const mockInventario: InventarioSaldo[] = mockProductos.map((producto, index) => ({
  id: index + 1,
  producto,
  ubicacion: { id: 1, nombre: "Bodega Principal" },
  cantidad_disponible: producto.presentaciones.reduce((sum, p) => sum + p.stock_disponible, 0),
  cantidad_reservada: Math.floor(Math.random() * 10),
}));

// KPIs
export const mockKpiResumen = {
  total_ventas: 12580.00,
  total_gastos: 3250.00,
  utilidad_neta: 9330.00,
  cuentas_por_cobrar: 1850.00,
  pedidos_pendientes: 2,
  productos_bajo_minimo: 3,
};

export const mockVentasDiarias = [
  { fecha: "2025-01-22", total: 1250.00, cantidad: 8 },
  { fecha: "2025-01-23", total: 980.00, cantidad: 6 },
  { fecha: "2025-01-24", total: 1560.00, cantidad: 12 },
  { fecha: "2025-01-25", total: 890.00, cantidad: 5 },
  { fecha: "2025-01-26", total: 2100.00, cantidad: 15 },
  { fecha: "2025-01-27", total: 1780.00, cantidad: 10 },
  { fecha: "2025-01-28", total: 2020.00, cantidad: 14 },
];

export const mockTopProductos = [
  { id: 1, nombre: "Coca-Cola", total_ventas: 2850.00, unidades: 245 },
  { id: 8, nombre: "Arroz", total_ventas: 1980.00, unidades: 156 },
  { id: 3, nombre: "Agua Pura", total_ventas: 1650.00, unidades: 320 },
  { id: 10, nombre: "Azúcar", total_ventas: 1420.00, unidades: 180 },
  { id: 6, nombre: "Leche Entera", total_ventas: 1180.00, unidades: 85 },
];

export const mockProductosBajoMinimo = [
  { ...mockProductos[6], stock_actual: 8 },
  { ...mockProductos[9], stock_actual: 5 },
  { ...mockProductos[2], stock_actual: 15 },
];

// Helper functions
export function getProductoById(id: number): Producto | undefined {
  return mockProductos.find(p => p.id === id);
}

export function getPresentacionById(id: number): (Presentacion & { producto: Producto }) | undefined {
  for (const producto of mockProductos) {
    const presentacion = producto.presentaciones.find(p => p.id === id);
    if (presentacion) {
      return { ...presentacion, producto };
    }
  }
  return undefined;
}

export function getProductosByCategoria(categoriaId: number): Producto[] {
  return mockProductos.filter(p => p.id_categoria === categoriaId);
}

export function buscarProductos(texto: string): Producto[] {
  const termino = texto.toLowerCase();
  return mockProductos.filter(p => 
    p.nombre.toLowerCase().includes(termino) ||
    p.descripcion?.toLowerCase().includes(termino) ||
    p.marca?.toLowerCase().includes(termino)
  );
}

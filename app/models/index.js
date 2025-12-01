const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.URL, {
  dialect: dbConfig.dialect,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// MODELOS EXISTENTES
db.usuarios = require("./usuario.model.js")(sequelize, Sequelize);

db.unidades = require("./unidad.model.js")(sequelize, Sequelize);
db.categorias_productos = require("./categoria_producto.model.js")(sequelize, Sequelize);
db.productos = require("./producto.model.js")(sequelize, Sequelize);
db.presentaciones_productos = require("./presentacion_producto.model.js")(sequelize, Sequelize);

db.proveedores = require("./proveedor.model.js")(sequelize, Sequelize);
db.ubicaciones_inventario = require("./ubicacion_inventario.model.js")(sequelize, Sequelize);
db.inventarios_saldos = require("./inventario_saldo.model.js")(sequelize, Sequelize);
db.movimientos_inventario = require("./movimiento_inventario.model.js")(sequelize, Sequelize);
db.compras = require("./compra.model.js")(sequelize, Sequelize);
db.detalles_compras = require("./detalle_compra.model.js")(sequelize, Sequelize);

db.pedidos = require("./pedido.model.js")(sequelize, Sequelize);
db.detalles_pedidos = require("./detalle_pedido.model.js")(sequelize, Sequelize);
db.ventas = require("./venta.model.js")(sequelize, Sequelize);
db.detalles_ventas = require("./detalle_venta.model.js")(sequelize, Sequelize);


db.unidades.hasMany(db.productos, { foreignKey: "id_unidad_base", as: "productos_base" });
db.productos.belongsTo(db.unidades, { foreignKey: "id_unidad_base", as: "unidad_base" });

db.proveedores.hasMany(db.compras, { foreignKey: "id_proveedor", as: "compras" });
db.compras.belongsTo(db.proveedores, { foreignKey: "id_proveedor", as: "proveedor" });

// Categoría de producto
db.categorias_productos.hasMany(db.productos, {
  foreignKey: "id_categoria",
  as: "productos",
});
db.productos.belongsTo(db.categorias_productos, {
  foreignKey: "id_categoria",
  as: "categoria",
});

// Presentaciones de producto
db.productos.hasMany(db.presentaciones_productos, {
  foreignKey: "id_producto",
  as: "presentaciones",
});
db.presentaciones_productos.belongsTo(db.productos, {
  foreignKey: "id_producto",
  as: "producto",
});

// Unidad de venta de la presentación
db.unidades.hasMany(db.presentaciones_productos, {
  foreignKey: "id_unidad_venta",
  as: "presentaciones_venta",
});
db.presentaciones_productos.belongsTo(db.unidades, {
  foreignKey: "id_unidad_venta",
  as: "unidad_venta",
});

// Ubicación ↔ Compras
db.ubicaciones_inventario.hasMany(db.compras, {
  foreignKey: "id_ubicacion",
  as: "compras",
});
db.compras.belongsTo(db.ubicaciones_inventario, {
  foreignKey: "id_ubicacion",
  as: "ubicacion",
});

// Compra ↔ Detalles
db.compras.hasMany(db.detalles_compras, {
  foreignKey: "id_compra",
  as: "detalles",
});
db.detalles_compras.belongsTo(db.compras, {
  foreignKey: "id_compra",
  as: "compra",
});

// Detalle ↔ Presentación
db.presentaciones_productos.hasMany(db.detalles_compras, {
  foreignKey: "id_presentacion_producto",
  as: "detalles_compra",
});
db.detalles_compras.belongsTo(db.presentaciones_productos, {
  foreignKey: "id_presentacion_producto",
  as: "presentacion",
});

// Producto ↔ Saldos
db.productos.hasMany(db.inventarios_saldos, {
  foreignKey: "id_producto",
  as: "saldos_inventario",
});
db.inventarios_saldos.belongsTo(db.productos, {
  foreignKey: "id_producto",
  as: "producto",
});

// Ubicación ↔ Saldos
db.ubicaciones_inventario.hasMany(db.inventarios_saldos, {
  foreignKey: "id_ubicacion",
  as: "saldos_inventario",
});
db.inventarios_saldos.belongsTo(db.ubicaciones_inventario, {
  foreignKey: "id_ubicacion",
  as: "ubicacion",
});

// Producto ↔ Movimientos
db.productos.hasMany(db.movimientos_inventario, {
  foreignKey: "id_producto",
  as: "movimientos",
});
db.movimientos_inventario.belongsTo(db.productos, {
  foreignKey: "id_producto",
  as: "producto",
});

// Ubicación ↔ Movimientos
db.ubicaciones_inventario.hasMany(db.movimientos_inventario, {
  foreignKey: "id_ubicacion",
  as: "movimientos",
});
db.movimientos_inventario.belongsTo(db.ubicaciones_inventario, {
  foreignKey: "id_ubicacion",
  as: "ubicacion",
});

// Usuario cliente ↔ Pedidos
db.usuarios.hasMany(db.pedidos, {
  foreignKey: "id_usuario_cliente",
  as: "pedidos_cliente",
});
db.pedidos.belongsTo(db.usuarios, {
  foreignKey: "id_usuario_cliente",
  as: "cliente_usuario",
});

// Ubicación salida ↔ Pedidos
db.ubicaciones_inventario.hasMany(db.pedidos, {
  foreignKey: "id_ubicacion_salida",
  as: "pedidos",
});
db.pedidos.belongsTo(db.ubicaciones_inventario, {
  foreignKey: "id_ubicacion_salida",
  as: "ubicacion_salida",
});

// Pedido ↔ Detalles
db.pedidos.hasMany(db.detalles_pedidos, {
  foreignKey: "id_pedido",
  as: "detalles",
});
db.detalles_pedidos.belongsTo(db.pedidos, {
  foreignKey: "id_pedido",
  as: "pedido",
});

// Presentación ↔ DetallePedido
db.presentaciones_productos.hasMany(db.detalles_pedidos, {
  foreignKey: "id_presentacion_producto",
  as: "detalles_pedido",
});
db.detalles_pedidos.belongsTo(db.presentaciones_productos, {
  foreignKey: "id_presentacion_producto",
  as: "presentacion",
});

// Venta ↔ Pedido
db.pedidos.hasOne(db.ventas, {
  foreignKey: "id_pedido",
  as: "venta",
});
db.ventas.belongsTo(db.pedidos, {
  foreignKey: "id_pedido",
  as: "pedido",
});

// Usuario cliente ↔ Ventas
db.usuarios.hasMany(db.ventas, {
  foreignKey: "id_usuario_cliente",
  as: "ventas_cliente",
});
db.ventas.belongsTo(db.usuarios, {
  foreignKey: "id_usuario_cliente",
  as: "cliente_usuario",
});

// Ubicación salida ↔ Ventas
db.ubicaciones_inventario.hasMany(db.ventas, {
  foreignKey: "id_ubicacion_salida",
  as: "ventas",
});
db.ventas.belongsTo(db.ubicaciones_inventario, {
  foreignKey: "id_ubicacion_salida",
  as: "ubicacion_salida",
});

// Venta ↔ Detalles
db.ventas.hasMany(db.detalles_ventas, {
  foreignKey: "id_venta",
  as: "detalles",
});
db.detalles_ventas.belongsTo(db.ventas, {
  foreignKey: "id_venta",
  as: "venta",
});

// Presentación ↔ DetalleVenta
db.presentaciones_productos.hasMany(db.detalles_ventas, {
  foreignKey: "id_presentacion_producto",
  as: "detalles_venta",
});
db.detalles_ventas.belongsTo(db.presentaciones_productos, {
  foreignKey: "id_presentacion_producto",
  as: "presentacion",
});


module.exports = db;

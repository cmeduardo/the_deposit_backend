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

// 👉 NUEVOS MODELOS
db.unidades = require("./unidad.model.js")(sequelize, Sequelize);
db.categorias_productos = require("./categoria_producto.model.js")(sequelize, Sequelize);
db.productos = require("./producto.model.js")(sequelize, Sequelize);
db.presentaciones_productos = require("./presentacion_producto.model.js")(sequelize, Sequelize);

// ASOCIACIONES (similar a tu otro proyecto)

// Unidad base de producto
db.unidades.hasMany(db.productos, { foreignKey: "id_unidad_base", as: "productos_base" });
db.productos.belongsTo(db.unidades, { foreignKey: "id_unidad_base", as: "unidad_base" });

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

module.exports = db;

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const db = require("./app/models");
const rutasAutenticacion = require("./app/routes/autenticacion.routes");
const rutasUsuarios = require("./app/routes/usuario.routes");
const rutasUnidades = require("./app/routes/unidad.routes");
const rutasCategoriasProductos = require("./app/routes/categoria_producto.routes");
const rutasProductos = require("./app/routes/producto.routes");
const rutasPresentacionesProductos = require("./app/routes/presentacion_producto.routes");
const rutasProveedores = require("./app/routes/proveedor.routes");
const rutasUbicacionesInventario = require("./app/routes/ubicacion_inventario.routes");
const rutasInventario = require("./app/routes/inventario.routes");
const rutasCompras = require("./app/routes/compra.routes");
const rutasPedidos = require("./app/routes/pedido.routes");
const rutasVentas = require("./app/routes/venta.routes");


const { swaggerUi, swaggerSpec } = require("./swagger");

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Rutas
app.use("/api/autenticacion", rutasAutenticacion);
app.use("/api/usuarios", rutasUsuarios);
app.use("/api/unidades", rutasUnidades);
app.use("/api/categorias-productos", rutasCategoriasProductos);
app.use("/api/productos", rutasProductos);
app.use("/api/presentaciones-productos", rutasPresentacionesProductos);
app.use("/api/proveedores", rutasProveedores);
app.use("/api/ubicaciones-inventario", rutasUbicacionesInventario);
app.use("/api/inventario", rutasInventario);
app.use("/api/compras", rutasCompras);
app.use("/api/pedidos", rutasPedidos);
app.use("/api/ventas", rutasVentas);



// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404
app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
});

const PUERTO = process.env.PORT;
const RUTA = process.env.BASE_URL;

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Conectado a la base de datos");

    // 👇 ESTA ES LA PARTE IMPORTANTE
    // En desarrollo puedes usar { alter: true } para ajustar la tabla a los modelos
    return db.sequelize.sync(); // o db.sequelize.sync({ alter: true })
  })
  .then(() => {
    console.log("Modelos sincronizados con la base de datos");
    app.listen(PUERTO, () => {
      console.log(`Servidor escuchando en el puerto ${PUERTO}`);
      console.log(`Documentación disponible en http://localhost:${PUERTO}/api-docs`);
      console.log(`Documentación disponible en ${RUTA}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("Error al iniciar la aplicación:", err);
  });

module.exports = app;

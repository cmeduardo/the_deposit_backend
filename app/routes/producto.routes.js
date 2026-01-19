const express = require("express");
const router = express.Router();

const productoController = require("../controllers/producto.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       required:
 *         - nombre
 *         - id_unidad_base
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Coca Cola 600ml"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Bebida gaseosa 600ml"
 *         url_imagen:
 *           type: string
 *           nullable: true
 *           example: "https://cdn.midominio.com/productos/coca600.png"
 *         marca:
 *           type: string
 *           nullable: true
 *           example: "Coca Cola"
 *         id_categoria:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         id_unidad_base:
 *           type: integer
 *           example: 1
 *         es_perecedero:
 *           type: boolean
 *           example: false
 *         stock_minimo:
 *           type: integer
 *           example: 10
 *         activo:
 *           type: boolean
 *           example: true
 */


/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar productos
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Filtrar por activo=true/false
 *       - in: query
 *         name: id_categoria
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", productoController.listarProductos);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: No encontrado
 */
router.get("/:id", productoController.obtenerProductoPorId);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Producto'
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  productoController.crearProducto
);

/**
 * @swagger
 * /api/productos/{id}:
 *   patch:
 *     summary: Actualizar producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Producto'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       404:
 *         description: No encontrado
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  productoController.actualizarProducto
);

module.exports = router;

const express = require("express");
const router = express.Router();

const productoController = require("../controllers/producto.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos (incluye creación y edición)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *
 *     Producto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *           nullable: true
 *         marca:
 *           type: string
 *           nullable: true
 *         url_imagen:
 *           type: string
 *           nullable: true
 *         id_categoria:
 *           type: integer
 *           nullable: true
 *         id_unidad_base:
 *           type: integer
 *           nullable: true
 *         es_perecedero:
 *           type: boolean
 *         stock_minimo:
 *           type: integer
 *         activo:
 *           type: boolean
 *
 *     ProductoCreateInput:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         marca:
 *           type: string
 *         url_imagen:
 *           type: string
 *         id_categoria:
 *           type: integer
 *         id_unidad_base:
 *           type: integer
 *         es_perecedero:
 *           type: boolean
 *         stock_minimo:
 *           type: integer
 *         activo:
 *           type: boolean
 */

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar productos (filtros opcionales)
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: true|false
 *       - in: query
 *         name: id_categoria
 *         schema:
 *           type: integer
 *       - in: query
 *         name: texto
 *         schema:
 *           type: string
 *         description: Busca por nombre/descripcion/marca (si lo implementaste en controller)
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
 *         description: Error interno
 */
router.get("/", productoController.listarProductos);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener producto por ID
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error interno
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
 *             $ref: '#/components/schemas/ProductoCreateInput'
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *       400:
 *         description: Validación (nombre requerido / ids inválidos)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo ADMIN)
 *       409:
 *         description: Conflicto (por ejemplo nombre duplicado si lo validas)
 *       500:
 *         description: Error interno
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
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
 *         description: Producto actualizado correctamente
 *       404:
 *         description: No encontrado
 *       400:
 *         description: Validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo ADMIN)
 *       409:
 *         description: Conflicto (por ejemplo nombre duplicado)
 *       500:
 *         description: Error interno
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  productoController.actualizarProducto
);

module.exports = router;

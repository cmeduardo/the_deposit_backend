const express = require("express");
const router = express.Router();

const productoController = require("../controllers/producto.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * IMPORTANTE (v0-friendly)
 * - NO redefinimos tags acá (ya están en swagger.js)
 * - Evitamos redefinir ErrorResponse global
 * - Usamos mensajes reales del controller en examples
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoriaProductoResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "BEBIDAS"
 *
 *     UnidadResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         codigo:
 *           type: string
 *           example: "UND"
 *         nombre:
 *           type: string
 *           example: "Unidad"
 *
 *     PresentacionProductoResumen:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         id_producto:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Coca Cola 600ml"
 *         url_imagen:
 *           type: string
 *           nullable: true
 *           example: null
 *         codigo_barras:
 *           type: string
 *           nullable: true
 *           example: "1234567890"
 *         id_unidad_venta:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         unidades_por_unidad_venta:
 *           type: number
 *           example: 1
 *         precio_venta_por_defecto:
 *           type: number
 *           nullable: true
 *           example: 7.5
 *         precio_minimo:
 *           type: number
 *           nullable: true
 *           example: 6.5
 *         activo:
 *           type: boolean
 *           example: true
 *         unidad_venta:
 *           $ref: "#/components/schemas/UnidadResumen"
 *
 *     Producto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Coca Cola"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Bebida gaseosa"
 *         marca:
 *           type: string
 *           nullable: true
 *           example: "Coca Cola"
 *         url_imagen:
 *           type: string
 *           nullable: true
 *           example: null
 *         id_categoria:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         id_unidad_base:
 *           type: integer
 *           nullable: true
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
 *         categoria:
 *           $ref: "#/components/schemas/CategoriaProductoResumen"
 *         unidad_base:
 *           $ref: "#/components/schemas/UnidadResumen"
 *
 *     ProductoConPresentaciones:
 *       allOf:
 *         - $ref: "#/components/schemas/Producto"
 *         - type: object
 *           properties:
 *             presentaciones:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/PresentacionProductoResumen"
 *
 *     ProductoCreateInput:
 *       type: object
 *       required: [nombre, id_unidad_base]
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Coca Cola"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Bebida gaseosa"
 *         marca:
 *           type: string
 *           nullable: true
 *           example: "Coca Cola"
 *         url_imagen:
 *           type: string
 *           nullable: true
 *           example: null
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
 *
 *     ProductoUpdateInput:
 *       type: object
 *       description: Campos opcionales para actualización parcial.
 *       properties:
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
 *           oneOf:
 *             - type: integer
 *             - type: "null"
 *         id_unidad_base:
 *           type: integer
 *         es_perecedero:
 *           type: boolean
 *         stock_minimo:
 *           type: integer
 *         activo:
 *           type: boolean
 *
 *     ProductoCreateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Producto creado correctamente"
 *         producto:
 *           $ref: "#/components/schemas/Producto"
 *
 *     ProductoUpdateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Producto actualizado correctamente"
 *         producto:
 *           $ref: "#/components/schemas/Producto"
 */

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar productos (con filtros opcionales)
 *     description: |
 *       Devuelve productos con relaciones:
 *       - `categoria` (id, nombre)
 *       - `unidad_base` (id, codigo, nombre)
 *
 *       Filtros:
 *       - `activo` (true|false)
 *       - `id_categoria`
 *     tags: [Productos]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: true|false
 *         example: true
 *       - in: query
 *         name: id_categoria
 *         schema:
 *           type: integer
 *         description: ID de categoría de producto
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Producto"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               error:
 *                 value: { mensaje: "Error interno del servidor" }
 */
router.get("/", productoController.listarProductos);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener producto por ID (incluye presentaciones)
 *     description: |
 *       Devuelve un producto por `id` con relaciones:
 *       - `categoria` (id, nombre)
 *       - `unidad_base` (id, codigo, nombre)
 *       - `presentaciones` (incluye `unidad_venta`)
 *     tags: [Productos]
 *     security: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     responses:
 *       200:
 *         description: Producto encontrado (incluye presentaciones)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ProductoConPresentaciones"
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Producto no encontrado" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               error:
 *                 value: { mensaje: "Error interno del servidor" }
 */
router.get("/:id", productoController.obtenerProductoPorId);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear producto
 *     description: |
 *       Reglas del controller:
 *       - Obligatorios: `nombre`, `id_unidad_base`
 *       - Valida que `id_unidad_base` exista
 *       - Si se envía `id_categoria`, valida que exista
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProductoCreateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 nombre: "Coca Cola"
 *                 descripcion: "Bebida gaseosa"
 *                 marca: "Coca Cola"
 *                 id_categoria: 1
 *                 id_unidad_base: 1
 *                 es_perecedero: false
 *                 stock_minimo: 10
 *                 activo: true
 *     responses:
 *       201:
 *         description: Producto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ProductoCreateResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Producto creado correctamente"
 *                   producto:
 *                     id: 1
 *                     nombre: "Coca Cola"
 *       400:
 *         description: Validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltanCampos:
 *                 value: { mensaje: "Nombre y id_unidad_base son obligatorios" }
 *               unidadNoExiste:
 *                 value: { mensaje: "La unidad base no existe" }
 *               categoriaNoExiste:
 *                 value: { mensaje: "La categoría indicada no existe" }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               error:
 *                 value: { mensaje: "Error interno del servidor" }
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
 *     summary: Actualizar producto (parcial)
 *     description: |
 *       Reglas del controller:
 *       - Si `id_unidad_base` cambia, valida que exista.
 *       - `id_categoria`:
 *         - si es **null**: desasocia categoría
 *         - si es número: valida existencia
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProductoUpdateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 nombre: "Coca Cola (actualizado)"
 *                 stock_minimo: 12
 *                 id_categoria: null
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ProductoUpdateResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Producto actualizado correctamente"
 *                   producto:
 *                     id: 1
 *                     nombre: "Coca Cola (actualizado)"
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Producto no encontrado" }
 *       400:
 *         description: Validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               unidadNoExiste:
 *                 value: { mensaje: "La unidad base indicada no existe" }
 *               categoriaNoExiste:
 *                 value: { mensaje: "La categoría indicada no existe" }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               error:
 *                 value: { mensaje: "Error interno del servidor" }
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  productoController.actualizarProducto
);

module.exports = router;

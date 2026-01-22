const express = require("express");
const router = express.Router();

const presentacionController = require("../controllers/presentacion_producto.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     PresentacionProducto:
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
 *           example: "Fardo x24"
 *         url_imagen:
 *           type: string
 *           nullable: true
 *           example: "https://cdn.midominio.com/presentaciones/fardo24.jpg"
 *         codigo_barras:
 *           type: string
 *           nullable: true
 *           example: "1234567890123"
 *         id_unidad_venta:
 *           type: integer
 *           example: 2
 *         unidades_por_unidad_venta:
 *           type: integer
 *           example: 24
 *         precio_venta_por_defecto:
 *           type: number
 *           nullable: true
 *           example: 75.5
 *         precio_minimo:
 *           type: number
 *           nullable: true
 *           example: 70
 *         activo:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2026-01-20T18:20:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2026-01-20T18:20:00.000Z"
 *
 *     ProductoResumenPresentacion:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Coca Cola 600ml"
 *         url_imagen:
 *           type: string
 *           nullable: true
 *           example: "https://cdn.midominio.com/productos/cocacola.jpg"
 *
 *     UnidadResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         codigo:
 *           type: string
 *           example: "FAR"
 *         nombre:
 *           type: string
 *           example: "Fardo"
 *
 *     PresentacionProductoConRelaciones:
 *       allOf:
 *         - $ref: "#/components/schemas/PresentacionProducto"
 *         - type: object
 *           properties:
 *             producto:
 *               $ref: "#/components/schemas/ProductoResumenPresentacion"
 *             unidad_venta:
 *               $ref: "#/components/schemas/UnidadResumen"
 *
 *     PresentacionProductoCreateInput:
 *       type: object
 *       required: [id_producto, nombre, id_unidad_venta]
 *       properties:
 *         id_producto:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Fardo x24"
 *         url_imagen:
 *           type: string
 *           nullable: true
 *           example: "https://cdn.midominio.com/presentaciones/fardo24.jpg"
 *         codigo_barras:
 *           type: string
 *           nullable: true
 *           example: "1234567890123"
 *         id_unidad_venta:
 *           type: integer
 *           example: 2
 *         unidades_por_unidad_venta:
 *           type: integer
 *           example: 24
 *         precio_venta_por_defecto:
 *           type: number
 *           nullable: true
 *           example: 75.5
 *         precio_minimo:
 *           type: number
 *           nullable: true
 *           example: 70
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     PresentacionProductoUpdateInput:
 *       type: object
 *       description: Campos opcionales para actualización parcial
 *       properties:
 *         id_producto:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Fardo x24 (actualizado)"
 *         url_imagen:
 *           type: string
 *           nullable: true
 *           example: "https://cdn.midominio.com/presentaciones/fardo24_v2.jpg"
 *         codigo_barras:
 *           type: string
 *           nullable: true
 *           example: "1234567890123"
 *         id_unidad_venta:
 *           type: integer
 *           example: 2
 *         unidades_por_unidad_venta:
 *           type: integer
 *           example: 24
 *         precio_venta_por_defecto:
 *           type: number
 *           nullable: true
 *           example: 78.0
 *         precio_minimo:
 *           type: number
 *           nullable: true
 *           example: 72.0
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     PresentacionProductoCreateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Presentación creada correctamente"
 *         presentacion:
 *           $ref: "#/components/schemas/PresentacionProducto"
 *
 *     PresentacionProductoUpdateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Presentación actualizada correctamente"
 *         presentacion:
 *           $ref: "#/components/schemas/PresentacionProducto"
 */

/**
 * @swagger
 * /api/presentaciones-productos:
 *   get:
 *     summary: Listar presentaciones (SKU) con filtros opcionales
 *     description: |
 *       Devuelve presentaciones incluyendo relaciones:
 *       - `producto` (id, nombre, url_imagen)
 *       - `unidad_venta` (id, codigo, nombre)
 *
 *       Filtros opcionales:
 *       - `id_producto`
 *       - `activo` (true|false)
 *     tags: [PresentacionesProductos]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: id_producto
 *         schema:
 *           type: integer
 *         description: Filtrar por producto
 *         example: 1
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: true|false
 *         example: true
 *     responses:
 *       200:
 *         description: Lista de presentaciones con relaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/PresentacionProductoConRelaciones"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/", presentacionController.listarPresentaciones);

/**
 * @swagger
 * /api/presentaciones-productos/{id}:
 *   get:
 *     summary: Obtener presentación por ID (incluye relaciones)
 *     description: |
 *       Devuelve una presentación incluyendo:
 *       - `producto` (id, nombre, url_imagen)
 *       - `unidad_venta` (id, codigo, nombre)
 *     tags: [PresentacionesProductos]
 *     security: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     responses:
 *       200:
 *         description: Presentación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PresentacionProductoConRelaciones"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/:id", presentacionController.obtenerPresentacionPorId);

/**
 * @swagger
 * /api/presentaciones-productos:
 *   post:
 *     summary: Crear presentación (SKU)
 *     description: |
 *       Crea una presentación.
 *
 *       Reglas del controller:
 *       - Obligatorios: `id_producto`, `nombre`, `id_unidad_venta`
 *       - Valida que el producto exista
 *       - Valida que la unidad de venta exista
 *       - Si viene `codigo_barras`, valida que no exista (409)
 *
 *       Roles: **ADMINISTRADOR**
 *     tags: [PresentacionesProductos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/PresentacionProductoCreateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 id_producto: 1
 *                 nombre: "Fardo x24"
 *                 id_unidad_venta: 2
 *                 unidades_por_unidad_venta: 24
 *                 precio_venta_por_defecto: 75.5
 *                 precio_minimo: 70
 *                 codigo_barras: "1234567890123"
 *                 activo: true
 *     responses:
 *       201:
 *         description: Presentación creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PresentacionProductoCreateResponse"
 *       400:
 *         $ref: "#/components/responses/ValidationError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       409:
 *         description: Conflicto / duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               mensaje: "Ya existe una presentación con ese código de barras"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  presentacionController.crearPresentacion
);

/**
 * @swagger
 * /api/presentaciones-productos/{id}:
 *   patch:
 *     summary: Actualizar presentación (SKU) (parcial)
 *     description: |
 *       Actualiza parcialmente una presentación.
 *
 *       Reglas del controller:
 *       - Si cambia `id_producto`, valida que exista
 *       - Si cambia `id_unidad_venta`, valida que exista
 *       - Si cambia `codigo_barras`, valida que no exista (409)
 *
 *       Roles: **ADMINISTRADOR**
 *     tags: [PresentacionesProductos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/PresentacionProductoUpdateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 nombre: "Fardo x24 (actualizado)"
 *                 precio_venta_por_defecto: 78
 *                 activo: true
 *     responses:
 *       200:
 *         description: Presentación actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PresentacionProductoUpdateResponse"
 *       400:
 *         $ref: "#/components/responses/ValidationError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       409:
 *         description: Conflicto / duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               mensaje: "Ya existe una presentación con ese código de barras"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  presentacionController.actualizarPresentacion
);

module.exports = router;

const express = require("express");
const router = express.Router();

const presentacionController = require("../controllers/presentacion_producto.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: PresentacionesProductos
 *   description: Gestión de presentaciones (SKU) de productos
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
 *     PresentacionProducto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         id_producto:
 *           type: integer
 *         nombre:
 *           type: string
 *         url_imagen:
 *           type: string
 *           nullable: true
 *         codigo_barras:
 *           type: string
 *           nullable: true
 *         id_unidad_venta:
 *           type: integer
 *           nullable: true
 *         unidades_por_unidad_venta:
 *           type: number
 *           example: 1
 *         precio_venta_por_defecto:
 *           type: number
 *           nullable: true
 *         precio_minimo:
 *           type: number
 *           nullable: true
 *         activo:
 *           type: boolean
 *
 *     PresentacionProductoCreateInput:
 *       type: object
 *       required: [id_producto, nombre]
 *       properties:
 *         id_producto:
 *           type: integer
 *         nombre:
 *           type: string
 *         url_imagen:
 *           type: string
 *         codigo_barras:
 *           type: string
 *         id_unidad_venta:
 *           type: integer
 *         unidades_por_unidad_venta:
 *           type: number
 *         precio_venta_por_defecto:
 *           type: number
 *         precio_minimo:
 *           type: number
 *         activo:
 *           type: boolean
 */

/**
 * @swagger
 * /api/presentaciones-productos:
 *   get:
 *     summary: Listar presentaciones (con filtros opcionales)
 *     tags: [PresentacionesProductos]
 *     parameters:
 *       - in: query
 *         name: id_producto
 *         schema:
 *           type: integer
 *         description: Filtra por producto
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: true|false
 *     responses:
 *       200:
 *         description: Lista de presentaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PresentacionProducto'
 *       500:
 *         description: Error interno
 */
router.get("/", presentacionController.listarPresentaciones);

/**
 * @swagger
 * /api/presentaciones-productos/{id}:
 *   get:
 *     summary: Obtener presentación por ID
 *     tags: [PresentacionesProductos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Presentación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PresentacionProducto'
 *       404:
 *         description: No encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno
 */
router.get("/:id", presentacionController.obtenerPresentacionPorId);

/**
 * @swagger
 * /api/presentaciones-productos:
 *   post:
 *     summary: Crear presentación
 *     tags: [PresentacionesProductos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PresentacionProductoCreateInput'
 *     responses:
 *       201:
 *         description: Presentación creada correctamente
 *       400:
 *         description: Validación (faltan datos o producto no existe)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo ADMIN)
 *       500:
 *         description: Error interno
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
 *     summary: Actualizar presentación
 *     tags: [PresentacionesProductos]
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
 *             $ref: '#/components/schemas/PresentacionProducto'
 *     responses:
 *       200:
 *         description: Presentación actualizada
 *       404:
 *         description: No encontrada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo ADMIN)
 *       500:
 *         description: Error interno
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  presentacionController.actualizarPresentacion
);

module.exports = router;

const express = require("express");
const router = express.Router();

const presentacionController = require("../controllers/presentacion_producto.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: PresentacionesProductos
 *   description: Gestión de presentaciones de productos (SKUs)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PresentacionProducto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         id_producto:
 *           type: integer
 *         nombre:
 *           type: string
 *         codigo_barras:
 *           type: string
 *         id_unidad_venta:
 *           type: integer
 *         unidades_por_unidad_venta:
 *           type: integer
 *         precio_venta_por_defecto:
 *           type: number
 *           format: float
 *         precio_minimo:
 *           type: number
 *           format: float
 *         activo:
 *           type: boolean
 */

/**
 * @swagger
 * /api/presentaciones-productos:
 *   get:
 *     summary: Listar presentaciones de productos
 *     tags: [PresentacionesProductos]
 *     parameters:
 *       - in: query
 *         name: id_producto
 *         schema:
 *           type: integer
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de presentaciones
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
 *       404:
 *         description: No encontrada
 */
router.get("/:id", presentacionController.obtenerPresentacionPorId);

/**
 * @swagger
 * /api/presentaciones-productos:
 *   post:
 *     summary: Crear presentación de producto
 *     tags: [PresentacionesProductos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PresentacionProducto'
 *     responses:
 *       201:
 *         description: Presentación creada
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  presentacionController.crearPresentacion
);

/**
 * @swagger
 * /api/presentaciones-productos/{id}:
 *   patch:
 *     summary: Actualizar presentación de producto
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
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  presentacionController.actualizarPresentacion
);

module.exports = router;

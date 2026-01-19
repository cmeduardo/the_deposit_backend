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
 *       required:
 *         - id_producto
 *         - nombre
 *         - id_unidad_venta
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_producto:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Fardo x24"
 *         url_imagen:
 *           type: string
 *           nullable: true
 *           example: "https://cdn.midominio.com/presentaciones/coca-fardo24.png"
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
 *           format: float
 *           nullable: true
 *           example: 150.00
 *         precio_minimo:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 140.00
 *         activo:
 *           type: boolean
 *           example: true
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
 *         description: Filtrar por producto
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
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
 *         description: Error interno del servidor
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

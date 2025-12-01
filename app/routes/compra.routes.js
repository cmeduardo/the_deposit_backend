const express = require("express");
const router = express.Router();

const compraController = require("../controllers/compra.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Compras
 *   description: Registro de compras y actualización de inventario
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleCompraInput:
 *       type: object
 *       required:
 *         - id_presentacion_producto
 *         - cantidad_unidad_venta
 *         - costo_unitario_unidad_venta
 *       properties:
 *         id_presentacion_producto:
 *           type: integer
 *         cantidad_unidad_venta:
 *           type: integer
 *         costo_unitario_unidad_venta:
 *           type: number
 *           format: float
 *         precio_referencia:
 *           type: number
 *           format: float
 *         precio_competencia:
 *           type: number
 *           format: float
 *         fecha_vencimiento:
 *           type: string
 *           format: date
 *     CompraInput:
 *       type: object
 *       required:
 *         - id_proveedor
 *         - id_ubicacion
 *         - fecha_compra
 *         - detalles
 *       properties:
 *         id_proveedor:
 *           type: integer
 *         id_ubicacion:
 *           type: integer
 *         fecha_compra:
 *           type: string
 *           format: date
 *         numero_documento:
 *           type: string
 *         costos_adicionales:
 *           type: number
 *           format: float
 *         notas:
 *           type: string
 *         detalles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DetalleCompraInput'
 */

/**
 * @swagger
 * /api/compras:
 *   get:
 *     summary: Listar compras
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de compras
 */
router.get(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  compraController.listarCompras
);

/**
 * @swagger
 * /api/compras/{id}:
 *   get:
 *     summary: Obtener compra por ID (con detalles)
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compra encontrada
 *       404:
 *         description: No encontrada
 */
router.get(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  compraController.obtenerCompraPorId
);

/**
 * @swagger
 * /api/compras:
 *   post:
 *     summary: Registrar una compra y actualizar el inventario
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompraInput'
 *     responses:
 *       201:
 *         description: Compra creada correctamente
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  compraController.crearCompra
);

module.exports = router;

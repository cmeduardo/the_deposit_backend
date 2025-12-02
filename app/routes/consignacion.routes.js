const express = require("express");
const router = express.Router();

const consignacionController = require("../controllers/consignacion.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Consignaciones
 *   description: Gestión de consignaciones (productos que se dejan en consignación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleConsignacion:
 *       type: object
 *       properties:
 *         id_presentacion_producto:
 *           type: integer
 *         cantidad_unidad_venta:
 *           type: number
 *         precio_unitario_estimado:
 *           type: number
 *         notas:
 *           type: string
 *     Consignacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         id_usuario_cliente:
 *           type: integer
 *         id_ubicacion_salida:
 *           type: integer
 *         fecha_envio:
 *           type: string
 *           format: date
 *         estado:
 *           type: string
 *           enum: [ABIERTA, CERRADA, CANCELADA]
 *         subtotal_estimado:
 *           type: number
 *         notas:
 *           type: string
 */

/**
 * @swagger
 * /api/consignaciones:
 *   get:
 *     summary: Listar consignaciones
 *     tags: [Consignaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [ABIERTA, CERRADA, CANCELADA]
 *       - in: query
 *         name: id_cliente
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de consignaciones
 */
router.get(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  consignacionController.listarConsignaciones
);

/**
 * @swagger
 * /api/consignaciones/{id}:
 *   get:
 *     summary: Obtener consignación por ID
 *     tags: [Consignaciones]
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
 *         description: Consignación encontrada
 *       404:
 *         description: No encontrada
 */
router.get(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  consignacionController.obtenerConsignacionPorId
);

/**
 * @swagger
 * /api/consignaciones:
 *   post:
 *     summary: Crear consignación (descontando stock de la ubicación de salida)
 *     tags: [Consignaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_ubicacion_salida, detalles]
 *             properties:
 *               id_usuario_cliente:
 *                 type: integer
 *               id_ubicacion_salida:
 *                 type: integer
 *               fecha_envio:
 *                 type: string
 *                 format: date
 *               notas:
 *                 type: string
 *               detalles:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/DetalleConsignacion'
 *     responses:
 *       201:
 *         description: Consignación creada
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  consignacionController.crearConsignacion
);

/**
 * @swagger
 * /api/consignaciones/{id}/cerrar:
 *   patch:
 *     summary: Cerrar una consignación (no modifica stock, solo estado)
 *     tags: [Consignaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notas:
 *                 type: string
 *     responses:
 *       200:
 *         description: Consignación cerrada
 *       404:
 *         description: No encontrada
 */
router.patch(
  "/:id/cerrar",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  consignacionController.cerrarConsignacion
);

module.exports = router;

// app/routes/factura.routes.js
const express = require("express");
const router = express.Router();

const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");
const facturaController = require("../controllers/factura.controller");

/**
 * @swagger
 * tags:
 *   name: Facturas
 *   description: Módulo de facturación (emisión y consulta de facturas)
 */

/**
 * @swagger
 * /api/facturas:
 *   post:
 *     summary: Crea una factura a partir de una venta existente
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_venta
 *               - numero
 *             properties:
 *               id_venta:
 *                 type: integer
 *               serie:
 *                 type: string
 *               numero:
 *                 type: string
 *               tipo_documento:
 *                 type: string
 *                 example: FACTURA
 *               nombre_cliente_factura:
 *                 type: string
 *               nit_cliente:
 *                 type: string
 *                 example: CF
 *               direccion_cliente:
 *                 type: string
 *               notas:
 *                 type: string
 *     responses:
 *       201:
 *         description: Factura creada
 *       400:
 *         description: Error de validación o ya existe factura para la venta
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Solo ADMIN puede emitir facturas
 */
router.post(
  "/",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR")],
  facturaController.crearFactura
);

/**
 * @swagger
 * /api/facturas:
 *   get:
 *     summary: Lista facturas con filtros opcionales
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: nit
 *         schema:
 *           type: string
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           example: EMITIDA
 *     responses:
 *       200:
 *         description: Lista de facturas
 */
router.get(
  "/",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR", "VENDEDOR")],
  facturaController.listarFacturas
);

/**
 * @swagger
 * /api/facturas/{id}:
 *   get:
 *     summary: Obtiene una factura por id (incluye venta y detalles)
 *     tags: [Facturas]
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
 *         description: Factura encontrada
 *       404:
 *         description: No encontrada
 */
router.get(
  "/:id",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR", "VENDEDOR")],
  facturaController.obtenerFacturaPorId
);

/**
 * @swagger
 * /api/facturas/venta/{id_venta}:
 *   get:
 *     summary: Obtiene la factura asociada a una venta
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_venta
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Factura encontrada
 *       404:
 *         description: La venta no tiene factura asociada
 */
router.get(
  "/venta/:id_venta",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR", "VENDEDOR")],
  facturaController.obtenerFacturaPorVenta
);

/**
 * @swagger
 * /api/facturas/{id}/anular:
 *   post:
 *     summary: Marca una factura como ANULADA
 *     tags: [Facturas]
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
 *               motivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Factura anulada
 *       404:
 *         description: Factura no encontrada
 */
router.post(
  "/:id/anular",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR")],
  facturaController.anularFactura
);

module.exports = router;

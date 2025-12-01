const express = require("express");
const router = express.Router();

const ventaController = require("../controllers/venta.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Ventas
 *   description: Registro de ventas y consumo de stock
 */

/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Listar ventas
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ventas
 */
router.get(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  ventaController.listarVentas
);

/**
 * @swagger
 * /api/ventas/{id}:
 *   get:
 *     summary: Obtener venta por ID
 *     tags: [Ventas]
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
 *         description: Venta encontrada
 */
router.get(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  ventaController.obtenerVentaPorId
);

/**
 * @swagger
 * /api/ventas:
 *   post:
 *     summary: Crear venta (desde pedido o directa)
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Si se envía `id_pedido`, se factura ese pedido y consume la reserva de stock.  
 *       Si no se envía `id_pedido`, se interpreta como venta directa y se consumen existencias libres.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_pedido:
 *                 type: integer
 *               id_usuario_cliente:
 *                 type: integer
 *               id_ubicacion_salida:
 *                 type: integer
 *               nombre_cliente:
 *                 type: string
 *               fecha_venta:
 *                 type: string
 *                 format: date
 *               cargo_envio:
 *                 type: number
 *               descuento_total:
 *                 type: number
 *               tipo_pago:
 *                 type: string
 *               estado_pago:
 *                 type: string
 *                 enum: [PENDIENTE, PAGADO, PARCIAL]
 *               notas:
 *                 type: string
 *               detalles:
 *                 type: array
 *                 description: Solo requerido para venta directa (sin id_pedido)
 *                 items:
 *                   type: object
 *                   required: [id_presentacion_producto, cantidad_unidad_venta]
 *                   properties:
 *                     id_presentacion_producto:
 *                       type: integer
 *                     cantidad_unidad_venta:
 *                       type: integer
 *                     precio_unitario:
 *                       type: number
 *                       description: Opcional, solo ADMIN/VENDEDOR
 *     responses:
 *       201:
 *         description: Venta creada correctamente
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  ventaController.crearVenta
);

module.exports = router;

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
 * components:
 *   schemas:
 *     ApiError:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Error interno del servidor"
 *
 *     VentaDetalleInput:
 *       type: object
 *       required: [id_presentacion_producto, cantidad_unidad_venta]
 *       properties:
 *         id_presentacion_producto:
 *           type: integer
 *           example: 12
 *         cantidad_unidad_venta:
 *           type: integer
 *           example: 3
 *         precio_unitario:
 *           type: number
 *           example: 25.5
 *           description: Opcional. Solo ADMIN/VENDEDOR. Si no se envía, usa precio_venta_por_defecto.
 *
 *     VentaDesdePedidoInput:
 *       type: object
 *       required: [id_pedido]
 *       properties:
 *         id_pedido:
 *           type: integer
 *           example: 100
 *         fecha_venta:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         cargo_envio:
 *           type: number
 *           example: 25
 *         descuento_total:
 *           type: number
 *           example: 10
 *         tipo_pago:
 *           type: string
 *           example: "Contado"
 *         estado_pago:
 *           type: string
 *           enum: [PENDIENTE, PAGADO, PARCIAL]
 *           example: "PAGADO"
 *         notas:
 *           type: string
 *           example: "Entrega inmediata"
 *
 *     VentaDirectaInput:
 *       type: object
 *       required: [id_ubicacion_salida, detalles]
 *       properties:
 *         id_usuario_cliente:
 *           type: integer
 *           nullable: true
 *           example: 50
 *         id_ubicacion_salida:
 *           type: integer
 *           example: 2
 *         nombre_cliente:
 *           type: string
 *           example: "CONSUMIDOR FINAL"
 *         fecha_venta:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         cargo_envio:
 *           type: number
 *           example: 0
 *         descuento_total:
 *           type: number
 *           example: 0
 *         tipo_pago:
 *           type: string
 *           example: "Contado"
 *         estado_pago:
 *           type: string
 *           enum: [PENDIENTE, PAGADO, PARCIAL]
 *           example: "PAGADO"
 *         notas:
 *           type: string
 *           example: "Venta mostrador"
 *         detalles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VentaDetalleInput'
 *
 *     VentaCreateInput:
 *       description: Input para crear venta. Puede ser desde pedido o venta directa.
 *       oneOf:
 *         - $ref: '#/components/schemas/VentaDesdePedidoInput'
 *         - $ref: '#/components/schemas/VentaDirectaInput'
 *
 *     VentaListado:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 2001
 *         id_pedido:
 *           type: integer
 *           nullable: true
 *           example: 100
 *         id_usuario_cliente:
 *           type: integer
 *           nullable: true
 *           example: 50
 *         id_ubicacion_salida:
 *           type: integer
 *           example: 2
 *         fecha_venta:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         subtotal_productos:
 *           type: number
 *           example: 150
 *         cargo_envio:
 *           type: number
 *           example: 25
 *         descuento_total:
 *           type: number
 *           example: 10
 *         total_general:
 *           type: number
 *           example: 165
 *         estado_pago:
 *           type: string
 *           enum: [PENDIENTE, PAGADO, PARCIAL]
 *           example: "PAGADO"
 *         estado:
 *           type: string
 *           example: "REGISTRADA"
 *
 *     VentaCreateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Venta registrada correctamente"
 *         venta:
 *           $ref: '#/components/schemas/VentaListado'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VentaListado'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         example: 2001
 *     responses:
 *       200:
 *         description: Venta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VentaListado'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Venta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               mensaje: "Venta no encontrada"
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *     description: |
 *       - Si se envía `id_pedido`, se factura el pedido, se consume reserva y stock, y el pedido pasa a COMPLETADO.
 *       - Si NO se envía `id_pedido`, es venta directa: requiere `id_ubicacion_salida` y `detalles`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VentaCreateInput'
 *           examples:
 *             desdePedido:
 *               summary: Venta desde pedido
 *               value:
 *                 id_pedido: 100
 *                 tipo_pago: "Contado"
 *                 estado_pago: "PAGADO"
 *                 notas: "Entrega inmediata"
 *             directa:
 *               summary: Venta directa
 *               value:
 *                 id_ubicacion_salida: 2
 *                 nombre_cliente: "CONSUMIDOR FINAL"
 *                 tipo_pago: "Contado"
 *                 estado_pago: "PAGADO"
 *                 detalles:
 *                   - id_presentacion_producto: 12
 *                     cantidad_unidad_venta: 3
 *     responses:
 *       201:
 *         description: Venta creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VentaCreateResponse'
 *       400:
 *         description: Validación / stock / pedido inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Recurso no encontrado (ej. venta por id)
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  ventaController.crearVenta
);

module.exports = router;

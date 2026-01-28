const express = require("express");
const router = express.Router();

const ventaController = require("../controllers/venta.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * components:
 *   schemas:
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
 *           description: Opcional. Si no se envía, usa precio_venta_por_defecto de la presentación (si existe).
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
 *           nullable: true
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
 *           nullable: true
 *           example: "Venta mostrador"
 *         detalles:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: "#/components/schemas/VentaDetalleInput"
 *
 *     VentaCreateInput:
 *       description: "Input para crear venta. Puede ser desde pedido (id_pedido) o venta directa (sin id_pedido)."
 *       oneOf:
 *         - $ref: "#/components/schemas/VentaDesdePedidoInput"
 *         - $ref: "#/components/schemas/VentaDirectaInput"
 *
 *     UsuarioMini:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 50 }
 *         nombre: { type: string, example: "Juan Pérez" }
 *         correo: { type: string, format: email, example: "juan@correo.com" }
 *
 *     UbicacionMini:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 2 }
 *         nombre: { type: string, example: "Bodega Central" }
 *         tipo: { type: string, example: "ALMACEN" }
 *
 *     ProductoMini:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         nombre: { type: string, example: "Arroz" }
 *
 *     PresentacionMini:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 12 }
 *         id_producto: { type: integer, example: 1 }
 *         nombre: { type: string, example: "Arroz 1 LB" }
 *         unidades_por_unidad_venta: { type: number, example: 1 }
 *         precio_venta_por_defecto:
 *           type: number
 *           nullable: true
 *           example: 25.5
 *         producto:
 *           $ref: "#/components/schemas/ProductoMini"
 *
 *     VentaDetalle:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 9001
 *         id_venta:
 *           type: integer
 *           example: 2001
 *         id_presentacion_producto:
 *           type: integer
 *           example: 12
 *         cantidad_unidad_venta:
 *           type: integer
 *           example: 3
 *         cantidad_unidad_base:
 *           type: number
 *           example: 3
 *         precio_unitario_venta:
 *           type: number
 *           example: 25.5
 *         precio_unitario_base:
 *           type: number
 *           example: 25.5
 *         es_precio_manual:
 *           type: boolean
 *           example: false
 *         subtotal_linea:
 *           type: number
 *           example: 76.5
 *         presentacion:
 *           $ref: "#/components/schemas/PresentacionMini"
 *
 *     Venta:
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
 *         nombre_cliente:
 *           type: string
 *           nullable: true
 *           example: "CONSUMIDOR FINAL"
 *         fecha_venta:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         subtotal_productos:
 *           type: number
 *           example: 150
 *         impuestos:
 *           type: number
 *           example: 0
 *         cargo_envio:
 *           type: number
 *           example: 25
 *         descuento_total:
 *           type: number
 *           example: 10
 *         total_general:
 *           type: number
 *           example: 165
 *         tipo_pago:
 *           type: string
 *           example: "Contado"
 *         estado_pago:
 *           type: string
 *           enum: [PENDIENTE, PAGADO, PARCIAL]
 *           example: "PAGADO"
 *         estado:
 *           type: string
 *           example: "REGISTRADA"
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Venta mostrador"
 *         created_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-01-21T10:20:30.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-01-21T10:20:30.000Z"
 *         cliente_usuario:
 *           nullable: true
 *           $ref: "#/components/schemas/UsuarioMini"
 *         ubicacion_salida:
 *           $ref: "#/components/schemas/UbicacionMini"
 *         detalles:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/VentaDetalle"
 *         pedido:
 *           type: object
 *           nullable: true
 *           description: "Pedido asociado (si la venta fue desde pedido)."
 *
 *     VentaCreateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Venta registrada correctamente"
 *         venta:
 *           $ref: "#/components/schemas/Venta"
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
 *                 $ref: "#/components/schemas/Venta"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
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
 *       - $ref: "#/components/parameters/IdPathParam"
 *     responses:
 *       200:
 *         description: Venta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Venta"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         description: Venta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Venta no encontrada" }
 *       500:
 *         $ref: "#/components/responses/ServerError"
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
 *             $ref: "#/components/schemas/VentaCreateInput"
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
 *         description: Venta registrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/VentaCreateResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Venta registrada correctamente"
 *                   venta:
 *                     id: 2001
 *                     id_pedido: null
 *                     id_usuario_cliente: 50
 *                     id_ubicacion_salida: 2
 *                     nombre_cliente: "CONSUMIDOR FINAL"
 *                     fecha_venta: "2026-01-20"
 *                     subtotal_productos: 76.5
 *                     impuestos: 0
 *                     cargo_envio: 0
 *                     descuento_total: 0
 *                     total_general: 76.5
 *                     tipo_pago: "Contado"
 *                     estado_pago: "PAGADO"
 *                     estado: "REGISTRADA"
 *                     notas: "Venta mostrador"
 *       400:
 *         description: Validación / stock / pedido inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               pedidoNoExiste:
 *                 value: { mensaje: "El pedido no existe" }
 *               pedidoNoPendiente:
 *                 value: { mensaje: "Solo se pueden facturar pedidos PENDIENTE" }
 *               ventaYaExistePedido:
 *                 value: { mensaje: "Ya existe una venta asociada a este pedido" }
 *               faltaUbicacion:
 *                 value: { mensaje: "id_ubicacion_salida es obligatorio en venta directa" }
 *               faltaDetalles:
 *                 value: { mensaje: "La venta debe incluir al menos un detalle" }
 *               ubicacionNoExiste:
 *                 value: { mensaje: "La ubicación indicada no existe" }
 *               clienteNoExiste:
 *                 value: { mensaje: "El usuario cliente indicado no existe" }
 *               presentacionesNoExisten:
 *                 value: { mensaje: "Una o más presentaciones de producto no existen" }
 *               detalleInvalido:
 *                 value: { mensaje: "Cada detalle debe tener id_presentacion_producto y cantidad_unidad_venta" }
 *               sinPrecio:
 *                 value: { mensaje: "No hay precio definido para la presentación 12. Debes enviar precio_unitario o definir precio_venta_por_defecto." }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  ventaController.crearVenta
);

module.exports = router;

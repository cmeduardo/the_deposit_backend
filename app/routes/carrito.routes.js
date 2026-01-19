const express = require("express");
const router = express.Router();

const carritoController = require("../controllers/carrito.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Carrito
 *   description: Carrito de compras (requiere autenticación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ItemCarritoInput:
 *       type: object
 *       required:
 *         - id_presentacion_producto
 *         - cantidad_unidad_venta
 *       properties:
 *         id_presentacion_producto:
 *           type: integer
 *           example: 1
 *         cantidad_unidad_venta:
 *           type: number
 *           format: float
 *           example: 2
 *           description: "Cantidad en unidad de venta de la presentación. Puede ser decimal si el negocio lo permite."
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Sin hielo"
 *
 *     ItemCarrito:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         id_carrito:
 *           type: integer
 *           example: 1
 *         id_presentacion_producto:
 *           type: integer
 *           example: 1
 *         cantidad_unidad_venta:
 *           type: string
 *           example: "2.000"
 *           description: "Se guarda como DECIMAL(12,3); puede venir como string desde la BD."
 *         precio_unitario:
 *           type: string
 *           example: "7.00"
 *           description: "Snapshot del precio al momento de agregar al carrito."
 *         subtotal_linea:
 *           type: string
 *           example: "14.00"
 *         notas:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CarritoCompra:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_usuario_cliente:
 *           type: integer
 *           example: 1
 *         estado:
 *           type: string
 *           enum: [ACTIVO, CONVERTIDO, CANCELADO]
 *           example: ACTIVO
 *         notas:
 *           type: string
 *           nullable: true
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/ItemCarrito"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ConfirmarCarritoInput:
 *       type: object
 *       required:
 *         - id_ubicacion_salida
 *       properties:
 *         id_ubicacion_salida:
 *           type: integer
 *           example: 1
 *         cargo_envio:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 15
 *         descuento_total:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 0
 *         notas_cliente:
 *           type: string
 *           nullable: true
 *           example: "Entregar en tienda"
 *
 *     ErrorRespuesta:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Error interno del servidor"
 */

/**
 * @swagger
 * /api/carrito/mi-carrito:
 *   get:
 *     summary: Obtener el carrito ACTIVO del usuario autenticado (crea uno si no existe)
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito actual con sus items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CarritoCompra"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorRespuesta"
 *       403:
 *         description: Sin permisos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorRespuesta"
 */
router.get(
  "/mi-carrito",
  autenticacionMiddleware,
  rolMiddleware("CLIENTE", "ADMINISTRADOR", "VENDEDOR"),
  carritoController.obtenerMiCarrito
);

/**
 * @swagger
 * /api/carrito/items:
 *   post:
 *     summary: Agregar un item al carrito (snapshot de precio + subtotal calculado)
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ItemCarritoInput"
 *     responses:
 *       201:
 *         description: Item agregado al carrito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Item agregado correctamente"
 *                 item:
 *                   $ref: "#/components/schemas/ItemCarrito"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorRespuesta"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorRespuesta"
 */
router.post(
  "/items",
  autenticacionMiddleware,
  rolMiddleware("CLIENTE", "ADMINISTRADOR", "VENDEDOR"),
  carritoController.agregarItemCarrito
);

/**
 * @swagger
 * /api/carrito/items/{id}:
 *   patch:
 *     summary: Actualizar un item del carrito (cantidad / notas)
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidad_unidad_venta:
 *                 type: number
 *                 format: float
 *                 example: 3
 *               notas:
 *                 type: string
 *                 example: "Cambiar por presentación unidad"
 *     responses:
 *       200:
 *         description: Item actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Item actualizado correctamente"
 *                 item:
 *                   $ref: "#/components/schemas/ItemCarrito"
 *       404:
 *         description: Item no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorRespuesta"
 */
router.patch(
  "/items/:id",
  autenticacionMiddleware,
  rolMiddleware("CLIENTE", "ADMINISTRADOR", "VENDEDOR"),
  carritoController.actualizarItemCarrito
);

/**
 * @swagger
 * /api/carrito/items/{id}:
 *   delete:
 *     summary: Eliminar un item del carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Item eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Item eliminado correctamente"
 *       404:
 *         description: Item no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorRespuesta"
 */
router.delete(
  "/items/:id",
  autenticacionMiddleware,
  rolMiddleware("CLIENTE", "ADMINISTRADOR", "VENDEDOR"),
  carritoController.eliminarItemCarrito
);

/**
 * @swagger
 * /api/carrito/mi-carrito/items:
 *   delete:
 *     summary: Vaciar el carrito del usuario (elimina todos los items)
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Carrito vaciado correctamente"
 */
router.delete(
  "/mi-carrito/items",
  autenticacionMiddleware,
  rolMiddleware("CLIENTE", "ADMINISTRADOR", "VENDEDOR"),
  carritoController.vaciarMiCarrito
);

/**
 * @swagger
 * /api/carrito/confirmar:
 *   post:
 *     summary: Confirmar el carrito y generar un pedido (reserva stock + convierte carrito)
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ConfirmarCarritoInput"
 *     responses:
 *       201:
 *         description: Pedido creado desde el carrito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Pedido creado desde el carrito"
 *                 pedido:
 *                   type: object
 *                   description: "Objeto Pedido creado (estructura depende del modelo Pedido)."
 *       400:
 *         description: Carrito vacío o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorRespuesta"
 *       409:
 *         description: Stock insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorRespuesta"
 */
router.post(
  "/confirmar",
  autenticacionMiddleware,
  rolMiddleware("CLIENTE", "ADMINISTRADOR", "VENDEDOR"),
  carritoController.confirmarCarritoCrearPedido
);

module.exports = router;

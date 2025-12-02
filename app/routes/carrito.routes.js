const express = require("express");
const router = express.Router();

const carritoController = require("../controllers/carrito.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Carrito
 *   description: Carrito de compras de la tienda en línea
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
 *         cantidad_unidad_venta:
 *           type: number
 *         notas:
 *           type: string
 */

/**
 * @swagger
 * /api/carrito/mi-carrito:
 *   get:
 *     summary: Obtener el carrito activo del usuario autenticado
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito actual con sus items
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
 *     summary: Agregar un item al carrito del usuario
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemCarritoInput'
 *     responses:
 *       201:
 *         description: Item agregado al carrito
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidad_unidad_venta:
 *                 type: number
 *               notas:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item actualizado
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
 *     responses:
 *       200:
 *         description: Item eliminado
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
 *     summary: Vaciar el carrito del usuario
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado
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
 *     summary: Confirmar el carrito y generar un pedido con reserva de stock
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_ubicacion_salida
 *             properties:
 *               id_ubicacion_salida:
 *                 type: integer
 *               cargo_envio:
 *                 type: number
 *               descuento_total:
 *                 type: number
 *               notas_cliente:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pedido creado desde el carrito
 */
router.post(
  "/confirmar",
  autenticacionMiddleware,
  rolMiddleware("CLIENTE", "ADMINISTRADOR", "VENDEDOR"),
  carritoController.confirmarCarritoCrearPedido
);

module.exports = router;

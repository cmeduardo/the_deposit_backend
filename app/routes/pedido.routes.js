const express = require("express");
const router = express.Router();

const pedidoController = require("../controllers/pedido.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Gestión de pedidos y reserva de stock
 */

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Listar pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, CANCELADO, COMPLETADO]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get(
  "/",
  autenticacionMiddleware,
  pedidoController.listarPedidos
);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   get:
 *     summary: Obtener pedido por ID
 *     tags: [Pedidos]
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
 *         description: Pedido encontrado
 *       404:
 *         description: No encontrado
 */
router.get(
  "/:id",
  autenticacionMiddleware,
  pedidoController.obtenerPedidoPorId
);

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Crear pedido y reservar stock
 *     tags: [Pedidos]
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
 *               fuente:
 *                 type: string
 *                 enum: [ONLINE, ADMIN, OTRO]
 *               cargo_envio:
 *                 type: number
 *               notas_cliente:
 *                 type: string
 *               detalles:
 *                 type: array
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
 *                       description: Opcional, solo para ADMIN/VENDEDOR
 *     responses:
 *       201:
 *         description: Pedido creado correctamente
 */
router.post(
  "/",
  autenticacionMiddleware,
  pedidoController.crearPedido
);

/**
 * @swagger
 * /api/pedidos/{id}/cancelar:
 *   patch:
 *     summary: Cancelar pedido y liberar stock reservado
 *     tags: [Pedidos]
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
 *         description: Pedido cancelado
 */
router.patch(
  "/:id/cancelar",
  autenticacionMiddleware,
  pedidoController.cancelarPedido
);

module.exports = router;

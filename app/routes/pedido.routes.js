const express = require("express");
const router = express.Router();

const pedidoController = require("../controllers/pedido.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Gestión de pedidos (creación, consulta y cancelación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *       example:
 *         mensaje: "Error interno del servidor"
 *
 *     PedidoDetalleInput:
 *       type: object
 *       required:
 *         - id_presentacion_producto
 *         - cantidad_unidad_venta
 *       properties:
 *         id_presentacion_producto:
 *           type: integer
 *           example: 10
 *         cantidad_unidad_venta:
 *           type: number
 *           example: 2
 *         precio_unitario:
 *           type: number
 *           example: 7.5
 *         notas:
 *           type: string
 *           example: "Entregar en la tarde"
 *
 *     PedidoCreateInput:
 *       type: object
 *       required:
 *         - detalles
 *       properties:
 *         id_usuario_cliente:
 *           type: integer
 *           nullable: true
 *           description: Si se omite, el pedido queda sin cliente asociado (según tu lógica).
 *           example: 5
 *         fecha_pedido:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Si se omite, se usa la fecha actual.
 *           example: "2026-01-20"
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Pedido para entrega a domicilio"
 *         detalles:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/PedidoDetalleInput'
 *
 *     PedidoEstado:
 *       type: string
 *       enum: [PENDIENTE, CANCELADO]
 *
 *     PedidoDetalle:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         id_pedido:
 *           type: integer
 *         id_presentacion_producto:
 *           type: integer
 *         cantidad_unidad_venta:
 *           type: number
 *         precio_unitario:
 *           type: number
 *         subtotal_linea:
 *           type: number
 *         notas:
 *           type: string
 *
 *     Pedido:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         id_usuario_cliente:
 *           type: integer
 *           nullable: true
 *         fecha_pedido:
 *           type: string
 *           format: date
 *         estado:
 *           $ref: '#/components/schemas/PedidoEstado'
 *         subtotal:
 *           type: number
 *         notas:
 *           type: string
 *           nullable: true
 *         cliente_usuario:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             correo:
 *               type: string
 *         detalles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PedidoDetalle'
 */

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Listar pedidos con filtros opcionales
 *     description: |
 *       Devuelve pedidos con detalles y relaciones. Requiere autenticación.
 *
 *       **Permisos (según tu lógica de negocio):**
 *       - ADMINISTRADOR / VENDEDOR: ve todos
 *       - CLIENTE: ve solo sus pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           $ref: '#/components/schemas/PedidoEstado'
 *         description: Filtrar por estado
 *       - in: query
 *         name: id_cliente
 *         schema:
 *           type: integer
 *         description: Filtrar por id de cliente (solo útil para roles internos)
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
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", autenticacionMiddleware, pedidoController.listarPedidos);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   get:
 *     summary: Obtener pedido por ID (incluye detalles)
 *     description: |
 *       Requiere autenticación. Un CLIENTE solo debe poder ver pedidos propios (según tu lógica).
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       404:
 *         description: Pedido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               mensaje: "Pedido no encontrado"
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error interno
 */
router.get("/:id", autenticacionMiddleware, pedidoController.obtenerPedidoPorId);

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Crear un pedido
 *     description: |
 *       Crea un pedido con sus detalles.
 *       - Si `fecha_pedido` se omite, se asigna la fecha actual.
 *       - Debe incluir al menos un detalle.
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoCreateInput'
 *           examples:
 *             ejemplo1:
 *               summary: Pedido con 2 líneas
 *               value:
 *                 id_usuario_cliente: 5
 *                 notas: "Entregar rápido"
 *                 detalles:
 *                   - id_presentacion_producto: 10
 *                     cantidad_unidad_venta: 2
 *                     precio_unitario: 7.5
 *                   - id_presentacion_producto: 12
 *                     cantidad_unidad_venta: 1
 *                     precio_unitario: 15
 *     responses:
 *       201:
 *         description: Pedido creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 pedido:
 *                   $ref: '#/components/schemas/Pedido'
 *       400:
 *         description: Error de validación (faltan datos / detalles vacíos / presentaciones inexistentes)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error interno
 */
router.post("/", autenticacionMiddleware, pedidoController.crearPedido);

/**
 * @swagger
 * /api/pedidos/{id}/cancelar:
 *   patch:
 *     summary: Cancelar un pedido
 *     description: |
 *       Cambia el estado del pedido a CANCELADO.
 *       Requiere autenticación (y reglas según tu negocio).
 *     tags: [Pedidos]
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
 *           example:
 *             motivo: "Cliente lo solicitó"
 *     responses:
 *       200:
 *         description: Pedido cancelado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 pedido:
 *                   $ref: '#/components/schemas/Pedido'
 *       404:
 *         description: Pedido no encontrado
 *       401:
 *         description: No autenticado
 *       400:
 *         description: No se puede cancelar (por ejemplo ya cancelado/estado inválido)
 *       500:
 *         description: Error interno
 */
router.patch(
  "/:id/cancelar",
  autenticacionMiddleware,
  pedidoController.cancelarPedido
);

module.exports = router;

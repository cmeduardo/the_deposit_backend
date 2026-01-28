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
 *     PedidoEstado:
 *       type: string
 *       enum: [PENDIENTE, CANCELADO, COMPLETADO]
 *
 *     PedidoFuente:
 *       type: string
 *       enum: [ONLINE, ADMIN, OTRO, TIENDA_EN_LINEA, DESDE_CARRITO]
 *
 *     PedidoTipoEntrega:
 *       type: string
 *       enum: [DOMICILIO, RECOGER_EN_LOCAL]
 *
 *     PedidoDetalleInput:
 *       type: object
 *       required: [id_presentacion_producto, cantidad_unidad_venta]
 *       properties:
 *         id_presentacion_producto:
 *           type: integer
 *           example: 10
 *         cantidad_unidad_venta:
 *           type: number
 *           example: 2
 *         precio_unitario:
 *           type: number
 *           nullable: true
 *           description: |
 *             Solo ADMINISTRADOR/VENDEDOR pueden enviar precio_unitario.
 *             Si no se envía, se usa precio_venta_por_defecto de la presentación.
 *           example: 7.5
 *
 *     PedidoCreateInput:
 *       type: object
 *       required: [id_ubicacion_salida, detalles, tipo_entrega, requiere_factura]
 *       properties:
 *         id_usuario_cliente:
 *           type: integer
 *           nullable: true
 *           description: |
 *             Si se omite y el rol del token es CLIENTE, se usa req.usuario.id.
 *           example: 5
 *         id_ubicacion_salida:
 *           type: integer
 *           description: Ubicación desde la cual se reserva stock.
 *           example: 2
 *         fuente:
 *           $ref: '#/components/schemas/PedidoFuente'
 *
 *         tipo_entrega:
 *           $ref: '#/components/schemas/PedidoTipoEntrega'
 *         direccion_entrega:
 *           type: string
 *           nullable: true
 *           description: |
 *             Requerida si tipo_entrega=DOMICILIO.
 *             Si no se envía, el backend usa cliente.direccion como fallback.
 *           example: "7a Avenida 10-20, Zona 1, Guatemala"
 *         requiere_factura:
 *           type: boolean
 *           example: true
 *         nit_factura:
 *           type: string
 *           nullable: true
 *           description: |
 *             Si requiere_factura=true:
 *             - si no se envía, el backend usa cliente.nit o "CF".
 *           example: "1234567-8"
 *         nombre_factura:
 *           type: string
 *           nullable: true
 *           description: |
 *             Si requiere_factura=true:
 *             - si no se envía, el backend usa cliente.nombre.
 *           example: "Juan Pérez"
 *
 *         cargo_envio:
 *           type: number
 *           nullable: true
 *           description: |
 *             Si tipo_entrega=RECOGER_EN_LOCAL, el backend fuerza cargo_envio=0.
 *           example: 0
 *         notas_cliente:
 *           type: string
 *           nullable: true
 *           example: "Entregar rápido"
 *         detalles:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/PedidoDetalleInput'
 *
 *     ProductoResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Coca Cola 600ml"
 *
 *     PresentacionResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         nombre:
 *           type: string
 *           example: "Fardo x24"
 *         unidades_por_unidad_venta:
 *           type: number
 *           example: 24
 *         precio_venta_por_defecto:
 *           type: number
 *           example: 7.5
 *         producto:
 *           $ref: '#/components/schemas/ProductoResumen'
 *
 *     PedidoDetalle:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_pedido:
 *           type: integer
 *           example: 10
 *         id_presentacion_producto:
 *           type: integer
 *           example: 10
 *         cantidad_unidad_venta:
 *           type: number
 *           example: 2
 *         cantidad_unidad_base:
 *           type: number
 *           example: 48
 *         precio_unitario:
 *           type: number
 *           example: 7.5
 *         origen_precio:
 *           type: string
 *           enum: [SISTEMA, MANUAL]
 *           example: "SISTEMA"
 *         subtotal_linea:
 *           type: number
 *           example: 15
 *         presentacion:
 *           $ref: '#/components/schemas/PresentacionResumen'
 *
 *     UsuarioResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 5
 *         nombre:
 *           type: string
 *           example: "Juan Pérez"
 *         correo:
 *           type: string
 *           example: "juan@correo.com"
 *
 *     UbicacionResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         nombre:
 *           type: string
 *           example: "Bodega Central"
 *         tipo:
 *           type: string
 *           nullable: true
 *           example: "BODEGA"
 *
 *     Pedido:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         id_usuario_cliente:
 *           type: integer
 *           nullable: true
 *           example: 5
 *         id_ubicacion_salida:
 *           type: integer
 *           example: 2
 *         fuente:
 *           $ref: '#/components/schemas/PedidoFuente'
 *         estado:
 *           $ref: '#/components/schemas/PedidoEstado'
 *         fecha_pedido:
 *           type: string
 *           format: date
 *           example: "2026-01-21"
 *
 *         tipo_entrega:
 *           $ref: '#/components/schemas/PedidoTipoEntrega'
 *         direccion_entrega:
 *           type: string
 *           nullable: true
 *         requiere_factura:
 *           type: boolean
 *           example: true
 *         nit_factura:
 *           type: string
 *           example: "CF"
 *         nombre_factura:
 *           type: string
 *           nullable: true
 *
 *         subtotal_productos:
 *           type: number
 *           example: 150
 *         cargo_envio:
 *           type: number
 *           example: 0
 *         descuento_total:
 *           type: number
 *           example: 0
 *         total_general:
 *           type: number
 *           example: 150
 *         notas_cliente:
 *           type: string
 *           nullable: true
 *         notas_internas:
 *           type: string
 *           nullable: true
 *         cliente_usuario:
 *           $ref: '#/components/schemas/UsuarioResumen'
 *         ubicacion_salida:
 *           $ref: '#/components/schemas/UbicacionResumen'
 *         detalles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PedidoDetalle'
 */

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Listar pedidos con filtros opcionales (incluye detalles)
 *     description: |
 *       Devuelve pedidos con:
 *       - cliente_usuario (id, nombre, correo)
 *       - ubicacion_salida (id, nombre, tipo)
 *       - detalles (con presentacion y producto)
 *
 *       Permisos:
 *       - ADMINISTRADOR / VENDEDOR: ve todos
 *       - CLIENTE: ve solo sus pedidos (ignora id_cliente)
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
 *         description: Filtrar por id de cliente (solo roles internos)
 *       - $ref: '#/components/parameters/FechaDesdeQuery'
 *       - $ref: '#/components/parameters/FechaHastaQuery'
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
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", autenticacionMiddleware, pedidoController.listarPedidos);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   get:
 *     summary: Obtener pedido por ID (incluye detalles)
 *     description: |
 *       Incluye:
 *       - cliente_usuario
 *       - ubicacion_salida
 *       - detalles (con presentacion y producto)
 *       - venta (si existe)
 *
 *       Regla: un CLIENTE solo puede ver pedidos propios.
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:id", autenticacionMiddleware, pedidoController.obtenerPedidoPorId);

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Crear un pedido (reserva stock)
 *     description: |
 *       Crea un pedido y reserva inventario (cantidad_reservada).
 *
 *       Reglas:
 *       - Obligatorio: id_ubicacion_salida
 *       - Debe incluir al menos un detalle
 *       - Valida que todas las presentaciones existan
 *       - Verifica stock libre (disponible - reservada) en la ubicación
 *       - Define cliente:
 *         - si rol=CLIENTE y no envía id_usuario_cliente => usa req.usuario.id
 *       - fuente default:
 *         - CLIENTE => ONLINE
 *         - otros => ADMIN
 *       - precio_unitario:
 *         - solo ADMINISTRADOR/VENDEDOR puede enviarlo (MANUAL)
 *         - si no se envía => usa precio_venta_por_defecto (SISTEMA)
 *
 *       Checkout:
 *       - tipo_entrega:
 *         - DOMICILIO: requiere direccion_entrega o usa cliente.direccion como fallback
 *         - RECOGER_EN_LOCAL: fuerza cargo_envio = 0
 *       - requiere_factura:
 *         - true: nit_factura cae a cliente.nit o "CF"; nombre_factura cae al nombre del cliente
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
 *             domicilioConFactura:
 *               summary: Domicilio con factura (usa fallback si omites dirección/NIT)
 *               value:
 *                 id_ubicacion_salida: 2
 *                 tipo_entrega: "DOMICILIO"
 *                 direccion_entrega: "7a Avenida 10-20, Zona 1"
 *                 requiere_factura: true
 *                 nit_factura: "1234567-8"
 *                 nombre_factura: "Juan Pérez"
 *                 cargo_envio: 25
 *                 detalles:
 *                   - id_presentacion_producto: 10
 *                     cantidad_unidad_venta: 2
 *             recogerSinFactura:
 *               summary: Recoger en local (cargo_envio se fuerza a 0)
 *               value:
 *                 id_ubicacion_salida: 2
 *                 tipo_entrega: "RECOGER_EN_LOCAL"
 *                 requiere_factura: false
 *                 cargo_envio: 999
 *                 detalles:
 *                   - id_presentacion_producto: 12
 *                     cantidad_unidad_venta: 1
 *     responses:
 *       201:
 *         description: Pedido creado y stock reservado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Pedido creado y stock reservado correctamente"
 *                 pedido:
 *                   $ref: '#/components/schemas/Pedido'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/", autenticacionMiddleware, pedidoController.crearPedido);

/**
 * @swagger
 * /api/pedidos/{id}/cancelar:
 *   patch:
 *     summary: Cancelar un pedido (revierte reservas)
 *     description: |
 *       Solo se puede cancelar si está en estado PENDIENTE.
 *       Revierte reservas (cantidad_reservada) en inventario.
 *
 *       Regla: un CLIENTE solo puede cancelar pedidos propios.
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *                 example: "Cliente lo solicitó"
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
 *                   example: "Pedido cancelado y reservas revertidas"
 *                 pedido:
 *                   $ref: '#/components/schemas/Pedido'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch("/:id/cancelar", autenticacionMiddleware, pedidoController.cancelarPedido);

module.exports = router;

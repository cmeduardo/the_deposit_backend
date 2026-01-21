const express = require("express");
const router = express.Router();

const envioController = require("../controllers/envio.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Envios
 *   description: Registro y seguimiento de envíos vinculados a pedidos o ventas. Requiere ADMINISTRADOR o VENDEDOR.
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
 *           example: "Error interno del servidor"
 *
 *     PedidoResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 100
 *         estado:
 *           type: string
 *           example: "PENDIENTE"
 *         fecha_pedido:
 *           type: string
 *           format: date
 *           example: "2026-01-15"
 *
 *     VentaResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 200
 *         fecha_venta:
 *           type: string
 *           format: date
 *           example: "2026-01-15"
 *         total_general:
 *           type: number
 *           format: float
 *           example: 250.00
 *         estado_pago:
 *           type: string
 *           example: "PARCIAL"
 *
 *     Envio:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_pedido:
 *           type: integer
 *           nullable: true
 *           example: 100
 *         id_venta:
 *           type: integer
 *           nullable: true
 *           example: 200
 *         fecha_envio:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         estado_envio:
 *           type: string
 *           enum: [PENDIENTE, EN_PROCESO, DESPACHADO, ENTREGADO, CANCELADO]
 *           example: "PENDIENTE"
 *         nombre_destinatario:
 *           type: string
 *           nullable: true
 *           example: "María López"
 *         direccion_entrega:
 *           type: string
 *           nullable: true
 *           example: "7a avenida 10-20, zona 1"
 *         referencia_direccion:
 *           type: string
 *           nullable: true
 *           example: "Frente al parque"
 *         telefono_contacto:
 *           type: string
 *           nullable: true
 *           example: "+502 5555-5555"
 *         zona:
 *           type: string
 *           nullable: true
 *           example: "1"
 *         ciudad:
 *           type: string
 *           nullable: true
 *           example: "Guatemala"
 *         transportista:
 *           type: string
 *           nullable: true
 *           example: "Mensajería X"
 *         tipo_envio:
 *           type: string
 *           nullable: true
 *           enum: [LOCAL, NACIONAL]
 *           example: "LOCAL"
 *         costo_cobrado:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 25.00
 *         costo_real:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 18.50
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Entregar en horario de oficina"
 *
 *     EnvioConRelaciones:
 *       allOf:
 *         - $ref: "#/components/schemas/Envio"
 *         - type: object
 *           properties:
 *             pedido:
 *               $ref: "#/components/schemas/PedidoResumen"
 *             venta:
 *               $ref: "#/components/schemas/VentaResumen"
 *
 *     EnvioCreateInput:
 *       type: object
 *       description: |
 *         Para crear un envío, debes indicar **al menos uno**: `id_pedido` o `id_venta`.
 *         Si no envías `fecha_envio`, se usa la fecha actual del servidor. Si no envías `estado_envio`, queda `PENDIENTE`.
 *       properties:
 *         id_pedido:
 *           type: integer
 *           nullable: true
 *           example: 100
 *         id_venta:
 *           type: integer
 *           nullable: true
 *           example: 200
 *         fecha_envio:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         estado_envio:
 *           type: string
 *           enum: [PENDIENTE, EN_PROCESO, DESPACHADO, ENTREGADO, CANCELADO]
 *           example: "PENDIENTE"
 *         nombre_destinatario:
 *           type: string
 *           example: "María López"
 *         direccion_entrega:
 *           type: string
 *           example: "7a avenida 10-20, zona 1"
 *         referencia_direccion:
 *           type: string
 *           example: "Frente al parque"
 *         telefono_contacto:
 *           type: string
 *           example: "+502 5555-5555"
 *         zona:
 *           type: string
 *           example: "1"
 *         ciudad:
 *           type: string
 *           example: "Guatemala"
 *         transportista:
 *           type: string
 *           example: "Mensajería X"
 *         tipo_envio:
 *           type: string
 *           enum: [LOCAL, NACIONAL]
 *           example: "LOCAL"
 *         costo_cobrado:
 *           type: number
 *           format: float
 *           example: 25
 *         costo_real:
 *           type: number
 *           format: float
 *           example: 18.5
 *         notas:
 *           type: string
 *           example: "Entregar en horario de oficina"
 *
 *     EnvioUpdateInput:
 *       type: object
 *       description: Campos actualizables del envío. (En tu controller actual no valida enums; Swagger sí los declara).
 *       properties:
 *         fecha_envio:
 *           type: string
 *           format: date
 *         estado_envio:
 *           type: string
 *           enum: [PENDIENTE, EN_PROCESO, DESPACHADO, ENTREGADO, CANCELADO]
 *         nombre_destinatario:
 *           type: string
 *           nullable: true
 *         direccion_entrega:
 *           type: string
 *           nullable: true
 *         referencia_direccion:
 *           type: string
 *           nullable: true
 *         telefono_contacto:
 *           type: string
 *           nullable: true
 *         zona:
 *           type: string
 *           nullable: true
 *         ciudad:
 *           type: string
 *           nullable: true
 *         transportista:
 *           type: string
 *           nullable: true
 *         tipo_envio:
 *           type: string
 *           nullable: true
 *           enum: [LOCAL, NACIONAL]
 *         costo_cobrado:
 *           type: number
 *           format: float
 *           nullable: true
 *         costo_real:
 *           type: number
 *           format: float
 *           nullable: true
 *         notas:
 *           type: string
 *           nullable: true
 */

/**
 * @swagger
 * /api/envios:
 *   get:
 *     summary: Listar envíos
 *     description: |
 *       Lista envíos con filtros opcionales. Incluye relaciones mínimas:
 *       - `pedido` (id, estado, fecha_pedido)
 *       - `venta` (id, fecha_venta, total_general, estado_pago)
 *
 *       Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Envios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado_envio
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, EN_PROCESO, DESPACHADO, ENTREGADO, CANCELADO]
 *         description: Filtrar por estado del envío
 *       - in: query
 *         name: id_pedido
 *         schema:
 *           type: integer
 *         description: Filtrar por pedido
 *       - in: query
 *         name: id_venta
 *         schema:
 *           type: integer
 *         description: Filtrar por venta
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar fecha_envio desde (inclusive)
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar fecha_envio hasta (inclusive)
 *     responses:
 *       200:
 *         description: Lista de envíos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/EnvioConRelaciones"
 *       401:
 *         description: No autenticado / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Sin permisos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  envioController.listarEnvios
);

/**
 * @swagger
 * /api/envios/{id}:
 *   get:
 *     summary: Obtener envío por ID
 *     description: Devuelve un envío por ID con sus relaciones `pedido` y/o `venta` (si aplica).
 *     tags: [Envios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Envío encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/EnvioConRelaciones"
 *       404:
 *         description: Envío no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Envío no encontrado" }
 *       401:
 *         description: No autenticado / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Sin permisos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  envioController.obtenerEnvioPorId
);

/**
 * @swagger
 * /api/envios:
 *   post:
 *     summary: Registrar un envío
 *     description: |
 *       Crea un envío. Reglas principales del controller:
 *       - Debes indicar **al menos uno**: `id_pedido` o `id_venta`.
 *       - Si `id_pedido` viene, se valida que exista.
 *       - Si `id_venta` viene, se valida que exista.
 *       - Defaults: `fecha_envio` = hoy; `estado_envio` = `PENDIENTE`.
 *
 *       Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Envios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/EnvioCreateInput"
 *           examples:
 *             porPedido:
 *               value:
 *                 id_pedido: 100
 *                 nombre_destinatario: "María López"
 *                 direccion_entrega: "7a avenida 10-20, zona 1"
 *                 telefono_contacto: "+502 5555-5555"
 *                 tipo_envio: "LOCAL"
 *                 costo_cobrado: 25
 *             porVenta:
 *               value:
 *                 id_venta: 200
 *                 fecha_envio: "2026-01-20"
 *                 estado_envio: "EN_PROCESO"
 *                 ciudad: "Guatemala"
 *                 transportista: "Mensajería X"
 *                 costo_real: 18.5
 *     responses:
 *       201:
 *         description: Envío creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Envío registrado correctamente"
 *                 envio:
 *                   $ref: "#/components/schemas/EnvioConRelaciones"
 *       400:
 *         description: Datos inválidos (por ejemplo, falta id_pedido/id_venta o no existen)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               sinRefs:
 *                 value: { mensaje: "Debes indicar al menos id_pedido o id_venta" }
 *               pedidoNoExiste:
 *                 value: { mensaje: "El pedido indicado no existe" }
 *               ventaNoExiste:
 *                 value: { mensaje: "La venta indicada no existe" }
 *       401:
 *         description: No autenticado / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Sin permisos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  envioController.crearEnvio
);

/**
 * @swagger
 * /api/envios/{id}:
 *   patch:
 *     summary: Actualizar un envío (estado, costos, datos de entrega)
 *     description: |
 *       Actualiza un envío por ID. En tu controller se actualizan campos **si vienen definidos**.
 *
 *       Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Envios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/EnvioUpdateInput"
 *           examples:
 *             cambiarEstado:
 *               value:
 *                 estado_envio: "DESPACHADO"
 *                 transportista: "Mensajería X"
 *                 notas: "Sale hoy en la tarde"
 *             actualizarCostos:
 *               value:
 *                 costo_real: 18.5
 *                 costo_cobrado: 25
 *     responses:
 *       200:
 *         description: Envío actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Envío actualizado correctamente"
 *                 envio:
 *                   $ref: "#/components/schemas/EnvioConRelaciones"
 *       404:
 *         description: Envío no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Envío no encontrado" }
 *       401:
 *         description: No autenticado / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Sin permisos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  envioController.actualizarEnvio
);

module.exports = router;

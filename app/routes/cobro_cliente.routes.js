const express = require("express");
const router = express.Router();

const cobroController = require("../controllers/cobro_cliente.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Cobros
 *   description: Registro y consulta de cobros de clientes (ADMINISTRADOR / VENDEDOR)
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
 *     VentaResumenCobro:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 100
 *         fecha_venta:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         total_general:
 *           type: string
 *           example: "250.00"
 *         estado_pago:
 *           type: string
 *           example: "PARCIAL"
 *
 *     UsuarioRegistroCobro:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         nombre:
 *           type: string
 *           example: "María López"
 *         correo:
 *           type: string
 *           example: "maria@correo.com"
 *
 *     CobroCliente:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 15
 *         id_venta:
 *           type: integer
 *           example: 100
 *         id_usuario_registro:
 *           type: integer
 *           example: 2
 *         fecha_cobro:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         monto:
 *           type: string
 *           example: "50.00"
 *           description: "DECIMAL en BD; puede venir como string."
 *         metodo_pago:
 *           type: string
 *           nullable: true
 *           example: "EFECTIVO"
 *         referencia_pago:
 *           type: string
 *           nullable: true
 *           example: "DEP-12345"
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Pago parcial"
 *         venta:
 *           $ref: "#/components/schemas/VentaResumenCobro"
 *         usuario_registro:
 *           $ref: "#/components/schemas/UsuarioRegistroCobro"
 *
 *     CobroCreateInput:
 *       type: object
 *       required:
 *         - id_venta
 *         - fecha_cobro
 *         - monto
 *       properties:
 *         id_venta:
 *           type: integer
 *           example: 100
 *         fecha_cobro:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         monto:
 *           type: number
 *           example: 50
 *         metodo_pago:
 *           type: string
 *           nullable: true
 *           example: "TRANSFERENCIA"
 *         referencia_pago:
 *           type: string
 *           nullable: true
 *           example: "BAN-889900"
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Abono"
 *
 *     CobroResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Cobro registrado correctamente"
 *         cobro:
 *           $ref: "#/components/schemas/CobroCliente"
 *
 *     CuentaPorCobrar:
 *       type: object
 *       properties:
 *         id_venta:
 *           type: integer
 *           example: 100
 *         fecha_venta:
 *           type: string
 *           format: date
 *           example: "2026-01-15"
 *         cliente:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nombre:
 *               type: string
 *               example: "Juan Pérez"
 *             correo:
 *               type: string
 *               example: "juan@correo.com"
 *         total_venta:
 *           type: number
 *           example: 250
 *         total_cobrado:
 *           type: number
 *           example: 50
 *         saldo_pendiente:
 *           type: number
 *           example: 200
 *         estado_pago:
 *           type: string
 *           example: "PARCIAL"
 *
 *     CuentasPorCobrarResponse:
 *       type: object
 *       properties:
 *         cantidad_ventas:
 *           type: integer
 *           example: 2
 *         total_saldo_pendiente:
 *           type: number
 *           example: 350
 *         cuentas:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/CuentaPorCobrar"
 */

/**
 * @swagger
 * /api/cobros:
 *   get:
 *     summary: Listar cobros de clientes
 *     description: |
 *       Lista cobros registrados, con información resumida de la venta y del usuario que registró el cobro.
 *       - Requiere autenticación (JWT)
 *       - Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Cobros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_venta
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtrar por venta
 *         example: 100
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha mínima (YYYY-MM-DD)
 *         example: "2026-01-01"
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha máxima (YYYY-MM-DD)
 *         example: "2026-01-31"
 *     responses:
 *       200:
 *         description: Lista de cobros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/CobroCliente"
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
  cobroController.listarCobros
);

/**
 * @swagger
 * /api/cobros/{id}:
 *   get:
 *     summary: Obtener cobro por ID
 *     description: |
 *       Devuelve el detalle de un cobro, con información resumida de la venta y del usuario que registró.
 *       - Requiere autenticación (JWT)
 *       - Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Cobros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 15
 *     responses:
 *       200:
 *         description: Cobro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CobroCliente"
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
 *       404:
 *         description: Cobro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Cobro no encontrado" }
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
  cobroController.obtenerCobroPorId
);

/**
 * @swagger
 * /api/cobros:
 *   post:
 *     summary: Registrar un cobro de cliente para una venta
 *     description: |
 *       Registra un cobro (abono o pago total) para una venta.
 *       El sistema:
 *       - bloquea la venta (transacción)
 *       - valida que la venta exista y no esté anulada
 *       - valida que el cobro NO exceda el saldo pendiente
 *       - actualiza `venta.estado_pago` a **PENDIENTE**, **PARCIAL** o **PAGADO**
 *
 *       - Requiere autenticación (JWT)
 *       - Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Cobros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CobroCreateInput"
 *           examples:
 *             pagoParcial:
 *               value:
 *                 id_venta: 100
 *                 fecha_cobro: "2026-01-20"
 *                 monto: 50
 *                 metodo_pago: "EFECTIVO"
 *                 referencia_pago: null
 *                 notas: "Abono"
 *     responses:
 *       201:
 *         description: Cobro registrado y estado de pago actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CobroResponse"
 *       400:
 *         description: Validación fallida (venta no existe, venta anulada, monto excede saldo, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltanDatos:
 *                 value: { mensaje: "id_venta, fecha_cobro y monto son obligatorios" }
 *               ventaNoExiste:
 *                 value: { mensaje: "La venta indicada no existe" }
 *               ventaAnulada:
 *                 value: { mensaje: "No se pueden registrar cobros para ventas anuladas" }
 *               excedeSaldo:
 *                 value:
 *                   mensaje: "El monto del cobro excede el saldo pendiente de la venta. Total venta: 250, ya cobrado: 50, intento: 210"
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
  cobroController.crearCobro
);

/**
 * @swagger
 * /api/cuentas-por-cobrar:
 *   get:
 *     summary: Listar cuentas por cobrar (ventas con saldo pendiente)
 *     description: |
 *       Devuelve un resumen de ventas NO anuladas cuyo saldo pendiente sea > 0.01.
 *       Calcula:
 *       - total_venta
 *       - total_cobrado (sumatoria de cobros)
 *       - saldo_pendiente
 *       - estado_pago
 *
 *       - Requiere autenticación (JWT)
 *       - Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Cobros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_cliente
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtrar por cliente (id_usuario_cliente)
 *         example: 1
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha mínima de venta (YYYY-MM-DD)
 *         example: "2026-01-01"
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha máxima de venta (YYYY-MM-DD)
 *         example: "2026-01-31"
 *     responses:
 *       200:
 *         description: Resumen de cuentas por cobrar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CuentasPorCobrarResponse"
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
  "/cuentas-por-cobrar",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  cobroController.listarCuentasPorCobrar
);

module.exports = router;

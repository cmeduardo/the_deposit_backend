const express = require("express");
const router = express.Router();

const cobroController = require("../controllers/cobro_cliente.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: CuentasPorCobrar
 *   description: Consulta de cuentas por cobrar (ventas con saldo pendiente). Requiere ADMINISTRADOR o VENDEDOR.
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
 *     ClienteResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         nombre:
 *           type: string
 *           example: "Juan Pérez"
 *         correo:
 *           type: string
 *           example: "juan@example.com"
 *
 *     CuentaPorCobrarItem:
 *       type: object
 *       properties:
 *         id_venta:
 *           type: integer
 *           example: 1001
 *         fecha_venta:
 *           type: string
 *           format: date
 *           example: "2026-01-15"
 *         cliente:
 *           $ref: "#/components/schemas/ClienteResumen"
 *         total_venta:
 *           type: number
 *           format: float
 *           example: 250.00
 *         total_cobrado:
 *           type: number
 *           format: float
 *           example: 100.00
 *         saldo_pendiente:
 *           type: number
 *           format: float
 *           example: 150.00
 *         estado_pago:
 *           type: string
 *           description: Estado de pago de la venta (según tu modelo/enum).
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
 *           format: float
 *           example: 350.00
 *         cuentas:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/CuentaPorCobrarItem"
 */

/**
 * @swagger
 * /api/cuentas-por-cobrar:
 *   get:
 *     summary: Listar cuentas por cobrar (ventas con saldo pendiente)
 *     description: |
 *       Devuelve ventas **no anuladas** que tengan **saldo pendiente** (`saldo_pendiente > 0.01`),
 *       calculando el saldo a partir de los cobros asociados.
 *
 *       - Requiere autenticación (JWT)
 *       - Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [CuentasPorCobrar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_cliente
 *         schema:
 *           type: integer
 *         description: Filtrar por id de usuario cliente (id_usuario_cliente)
 *         example: 12
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar fecha_venta desde (inclusive)
 *         example: "2026-01-01"
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar fecha_venta hasta (inclusive)
 *         example: "2026-01-31"
 *     responses:
 *       200:
 *         description: Resumen de cuentas por cobrar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CuentasPorCobrarResponse"
 *             examples:
 *               ejemplo:
 *                 value:
 *                   cantidad_ventas: 1
 *                   total_saldo_pendiente: 150
 *                   cuentas:
 *                     - id_venta: 1001
 *                       fecha_venta: "2026-01-15"
 *                       cliente:
 *                         id: 12
 *                         nombre: "Juan Pérez"
 *                         correo: "juan@example.com"
 *                       total_venta: 250
 *                       total_cobrado: 100
 *                       saldo_pendiente: 150
 *                       estado_pago: "PARCIAL"
 *       401:
 *         description: No autenticado / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noToken:
 *                 value: { mensaje: "No se proporcionó token" }
 *               tokenInvalido:
 *                 value: { mensaje: "Token inválido o expirado" }
 *       403:
 *         description: Sin permisos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               sinPermisos:
 *                 value: { mensaje: "No tienes permisos para esta acción" }
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
  cobroController.listarCuentasPorCobrar
);

module.exports = router;

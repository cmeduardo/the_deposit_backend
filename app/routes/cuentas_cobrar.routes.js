const express = require("express");
const router = express.Router();

const cobroController = require("../controllers/cobro_cliente.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

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
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filtrar por id de usuario cliente (id_usuario_cliente)
 *         example: 12
 *       - $ref: "#/components/parameters/FechaDesdeQuery"
 *       - $ref: "#/components/parameters/FechaHastaQuery"
 *     responses:
 *       200:
 *         description: Resumen de cuentas por cobrar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cantidad_ventas:
 *                   type: integer
 *                   example: 2
 *                 total_saldo_pendiente:
 *                   type: number
 *                   format: float
 *                   example: 350
 *                 cuentas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_venta: { type: integer, example: 1001 }
 *                       fecha_venta: { type: string, format: date, example: "2026-01-15" }
 *                       cliente:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id: { type: integer, example: 12 }
 *                           nombre: { type: string, example: "Juan Pérez" }
 *                           correo: { type: string, example: "juan@example.com" }
 *                       total_venta: { type: number, format: float, example: 250 }
 *                       total_cobrado: { type: number, format: float, example: 100 }
 *                       saldo_pendiente: { type: number, format: float, example: 150 }
 *                       estado_pago: { type: string, example: "PARCIAL" }
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
  cobroController.listarCuentasPorCobrar
);

module.exports = router;

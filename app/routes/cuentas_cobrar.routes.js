const express = require("express");
const router = express.Router();

const cobroController = require("../controllers/cobro_cliente.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: CuentasPorCobrar
 *   description: Consulta de cuentas por cobrar de clientes
 */

/**
 * @swagger
 * /api/cuentas-por-cobrar:
 *   get:
 *     summary: Listar cuentas por cobrar (ventas con saldo pendiente)
 *     tags: [CuentasPorCobrar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_cliente
 *         schema:
 *           type: integer
 *         description: Filtrar por id de usuario cliente
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
 *         description: Resumen de cuentas por cobrar
 */
router.get(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  cobroController.listarCuentasPorCobrar
);

module.exports = router;

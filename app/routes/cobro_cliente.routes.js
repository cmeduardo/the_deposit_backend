const express = require("express");
const router = express.Router();

const cobroController = require("../controllers/cobro_cliente.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Cobros
 *   description: Registro y consulta de cobros de clientes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CobroCliente:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         id_venta:
 *           type: integer
 *         id_usuario_registro:
 *           type: integer
 *         fecha_cobro:
 *           type: string
 *           format: date
 *         monto:
 *           type: number
 *         metodo_pago:
 *           type: string
 *         referencia_pago:
 *           type: string
 *         notas:
 *           type: string
 */

/**
 * @swagger
 * /api/cobros:
 *   get:
 *     summary: Listar cobros de clientes
 *     tags: [Cobros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_venta
 *         schema:
 *           type: integer
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
 *         description: Lista de cobros
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
 *     tags: [Cobros]
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
 *         description: Cobro encontrado
 *       404:
 *         description: No encontrado
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
 *     tags: [Cobros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_venta, fecha_cobro, monto]
 *             properties:
 *               id_venta:
 *                 type: integer
 *               fecha_cobro:
 *                 type: string
 *                 format: date
 *               monto:
 *                 type: number
 *               metodo_pago:
 *                 type: string
 *               referencia_pago:
 *                 type: string
 *               notas:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cobro creado
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  cobroController.crearCobro
);

module.exports = router;

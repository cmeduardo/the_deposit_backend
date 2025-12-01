const express = require("express");
const router = express.Router();

const inventarioController = require("../controllers/inventario.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Inventario
 *   description: Consulta y ajustes de inventario
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InventarioSaldo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         id_producto:
 *           type: integer
 *         id_ubicacion:
 *           type: integer
 *         cantidad_disponible:
 *           type: integer
 *         cantidad_reservada:
 *           type: integer
 */

/**
 * @swagger
 * /api/inventario:
 *   get:
 *     summary: Listar saldos de inventario
 *     tags: [Inventario]
 *     parameters:
 *       - in: query
 *         name: id_producto
 *         schema:
 *           type: integer
 *       - in: query
 *         name: id_ubicacion
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de saldos
 */
router.get("/", inventarioController.listarSaldos);

/**
 * @swagger
 * /api/inventario/ajuste:
 *   post:
 *     summary: Realizar un ajuste manual de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_producto, id_ubicacion, cantidad]
 *             properties:
 *               id_producto:
 *                 type: integer
 *               id_ubicacion:
 *                 type: integer
 *               cantidad:
 *                 type: integer
 *                 description: Positivo suma, negativo resta
 *               motivo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ajuste realizado
 */
router.post(
  "/ajuste",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  inventarioController.ajustarInventario
);

module.exports = router;

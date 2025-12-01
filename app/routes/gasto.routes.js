const express = require("express");
const router = express.Router();

const gastoController = require("../controllers/gasto.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Gastos
 *   description: Registro y consulta de gastos del negocio
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Gasto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         id_categoria_gasto:
 *           type: integer
 *         id_usuario_registro:
 *           type: integer
 *         fecha_gasto:
 *           type: string
 *           format: date
 *         tipo:
 *           type: string
 *           enum: [FIJO, VARIABLE]
 *         descripcion:
 *           type: string
 *         monto:
 *           type: number
 *           format: float
 *         metodo_pago:
 *           type: string
 *         referencia_pago:
 *           type: string
 *         es_recurrente:
 *           type: boolean
 *         periodo_recurrencia:
 *           type: string
 *           enum: [MENSUAL, TRIMESTRAL, ANUAL]
 *         notas:
 *           type: string
 */

/**
 * @swagger
 * /api/gastos:
 *   get:
 *     summary: Listar gastos
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [FIJO, VARIABLE]
 *       - in: query
 *         name: id_categoria_gasto
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de gastos
 */
router.get(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  gastoController.listarGastos
);

/**
 * @swagger
 * /api/gastos/resumen-mensual:
 *   get:
 *     summary: Resumen mensual de gastos
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *       - in: query
 *         name: mes
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *     responses:
 *       200:
 *         description: Resumen mensual por tipo y categoría
 */
router.get(
  "/resumen-mensual",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  gastoController.resumenMensual
);

/**
 * @swagger
 * /api/gastos/{id}:
 *   get:
 *     summary: Obtener gasto por ID
 *     tags: [Gastos]
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
 *         description: Gasto encontrado
 *       404:
 *         description: No encontrado
 */
router.get(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  gastoController.obtenerGastoPorId
);

/**
 * @swagger
 * /api/gastos:
 *   post:
 *     summary: Registrar un gasto
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Gasto'
 *     responses:
 *       201:
 *         description: Gasto creado
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  gastoController.crearGasto
);

/**
 * @swagger
 * /api/gastos/{id}:
 *   patch:
 *     summary: Actualizar un gasto
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Gasto'
 *     responses:
 *       200:
 *         description: Gasto actualizado
 *       404:
 *         description: No encontrado
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  gastoController.actualizarGasto
);

module.exports = router;

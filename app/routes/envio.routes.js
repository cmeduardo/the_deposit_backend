const express = require("express");
const router = express.Router();

const envioController = require("../controllers/envio.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Envios
 *   description: Registro y seguimiento de envíos y cobros de envío
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Envio:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         id_pedido:
 *           type: integer
 *         id_venta:
 *           type: integer
 *         fecha_envio:
 *           type: string
 *           format: date
 *         estado_envio:
 *           type: string
 *           enum: [PENDIENTE, EN_PROCESO, DESPACHADO, ENTREGADO, CANCELADO]
 *         nombre_destinatario:
 *           type: string
 *         direccion_entrega:
 *           type: string
 *         referencia_direccion:
 *           type: string
 *         telefono_contacto:
 *           type: string
 *         zona:
 *           type: string
 *         ciudad:
 *           type: string
 *         transportista:
 *           type: string
 *         tipo_envio:
 *           type: string
 *           enum: [LOCAL, NACIONAL]
 *         costo_cobrado:
 *           type: number
 *         costo_real:
 *           type: number
 *         notas:
 *           type: string
 */

/**
 * @swagger
 * /api/envios:
 *   get:
 *     summary: Listar envíos
 *     tags: [Envios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado_envio
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, EN_PROCESO, DESPACHADO, ENTREGADO, CANCELADO]
 *       - in: query
 *         name: id_pedido
 *         schema:
 *           type: integer
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
 *         description: Lista de envíos
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
 *     tags: [Envios]
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
 *         description: Envío encontrado
 *       404:
 *         description: No encontrado
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
 *     tags: [Envios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: []
 *             properties:
 *               id_pedido:
 *                 type: integer
 *               id_venta:
 *                 type: integer
 *               fecha_envio:
 *                 type: string
 *                 format: date
 *               estado_envio:
 *                 type: string
 *               nombre_destinatario:
 *                 type: string
 *               direccion_entrega:
 *                 type: string
 *               referencia_direccion:
 *                 type: string
 *               telefono_contacto:
 *                 type: string
 *               zona:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               transportista:
 *                 type: string
 *               tipo_envio:
 *                 type: string
 *               costo_cobrado:
 *                 type: number
 *               costo_real:
 *                 type: number
 *               notas:
 *                 type: string
 *     responses:
 *       201:
 *         description: Envío creado
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
 *     tags: [Envios]
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
 *             $ref: '#/components/schemas/Envio'
 *     responses:
 *       200:
 *         description: Envío actualizado
 *       404:
 *         description: No encontrado
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  envioController.actualizarEnvio
);

module.exports = router;

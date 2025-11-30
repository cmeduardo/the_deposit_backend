const express = require("express");
const router = express.Router();

const unidadController = require("../controllers/unidad.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Unidades
 *   description: Gestión de unidades de medida
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Unidad:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         codigo:
 *           type: string
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         activo:
 *           type: boolean
 */

/**
 * @swagger
 * /api/unidades:
 *   get:
 *     summary: Listar unidades
 *     tags: [Unidades]
 *     responses:
 *       200:
 *         description: Lista de unidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Unidad'
 */
router.get("/", unidadController.listarUnidades);

/**
 * @swagger
 * /api/unidades/{id}:
 *   get:
 *     summary: Obtener una unidad por ID
 *     tags: [Unidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unidad encontrada
 *       404:
 *         description: Unidad no encontrada
 */
router.get("/:id", unidadController.obtenerUnidadPorId);

/**
 * @swagger
 * /api/unidades:
 *   post:
 *     summary: Crear una unidad
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [codigo, nombre]
 *             properties:
 *               codigo:
 *                 type: string
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Unidad creada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  unidadController.crearUnidad
);

/**
 * @swagger
 * /api/unidades/{id}:
 *   patch:
 *     summary: Actualizar una unidad
 *     tags: [Unidades]
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
 *             $ref: '#/components/schemas/Unidad'
 *     responses:
 *       200:
 *         description: Unidad actualizada
 *       404:
 *         description: Unidad no encontrada
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  unidadController.actualizarUnidad
);

module.exports = router;

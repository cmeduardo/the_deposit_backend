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
 *           example: 1
 *         codigo:
 *           type: string
 *           example: "UND"
 *         nombre:
 *           type: string
 *           example: "Unidad"
 *         descripcion:
 *           type: string
 *           example: "Unidad estándar"
 *         activo:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     UnidadCreateInput:
 *       type: object
 *       required: [codigo, nombre]
 *       properties:
 *         codigo:
 *           type: string
 *           example: "KG"
 *         nombre:
 *           type: string
 *           example: "Kilogramo"
 *         descripcion:
 *           type: string
 *           example: "Unidad de masa"
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     UnidadUpdateInput:
 *       type: object
 *       properties:
 *         codigo:
 *           type: string
 *           example: "LT"
 *         nombre:
 *           type: string
 *           example: "Litro"
 *         descripcion:
 *           type: string
 *           example: "Unidad de volumen"
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     ApiMensajeUnidad:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Unidad creada correctamente"
 *         unidad:
 *           $ref: '#/components/schemas/Unidad'
 *
 *     ApiError:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Error interno del servidor"
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
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         example: 1
 *     responses:
 *       200:
 *         description: Unidad encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unidad'
 *       404:
 *         description: Unidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               mensaje: "Unidad no encontrada"
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *             $ref: '#/components/schemas/UnidadCreateInput'
 *           examples:
 *             crearUnidad:
 *               summary: Crear unidad
 *               value:
 *                 codigo: "CAJ"
 *                 nombre: "Caja"
 *                 descripcion: "Caja cerrada"
 *                 activo: true
 *     responses:
 *       201:
 *         description: Unidad creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMensajeUnidad'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               mensaje: "Código y nombre son obligatorios"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       409:
 *         description: Código duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               mensaje: "Ya existe una unidad con ese código"
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnidadUpdateInput'
 *           examples:
 *             actualizarUnidad:
 *               summary: Actualizar unidad
 *               value:
 *                 nombre: "Unidad (actualizada)"
 *                 activo: true
 *     responses:
 *       200:
 *         description: Unidad actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMensajeUnidad'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Unidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Código duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  unidadController.actualizarUnidad
);

module.exports = router;

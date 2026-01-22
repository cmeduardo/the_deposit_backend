const express = require("express");
const router = express.Router();

const unidadController = require("../controllers/unidad.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * IMPORTANTE (v0-friendly)
 * - NO redefinimos tags acá (ya están en swagger.js)
 * - NO redefinimos ErrorResponse global (ya está en swagger.js)
 * - Usamos mensajes reales del controller en examples
 * - En schemas usamos underscored timestamps (created_at/updated_at) porque tu Sequelize usa underscored: true
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
 *           nullable: true
 *           example: "Unidad estándar"
 *         activo:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-01-21T10:20:30.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-01-21T10:20:30.000Z"
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
 *           nullable: true
 *           example: "Unidad de masa"
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     UnidadUpdateInput:
 *       type: object
 *       description: Campos opcionales para actualización parcial.
 *       properties:
 *         codigo:
 *           type: string
 *           example: "LT"
 *         nombre:
 *           type: string
 *           example: "Litro"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Unidad de volumen"
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     UnidadCreateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Unidad creada correctamente"
 *         unidad:
 *           $ref: "#/components/schemas/Unidad"
 *
 *     UnidadUpdateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Unidad actualizada correctamente"
 *         unidad:
 *           $ref: "#/components/schemas/Unidad"
 */

/**
 * @swagger
 * /api/unidades:
 *   get:
 *     summary: Listar unidades
 *     tags: [Unidades]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de unidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Unidad"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               error:
 *                 value: { mensaje: "Error interno del servidor" }
 */
router.get("/", unidadController.listarUnidades);

/**
 * @swagger
 * /api/unidades/{id}:
 *   get:
 *     summary: Obtener una unidad por ID
 *     tags: [Unidades]
 *     security: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     responses:
 *       200:
 *         description: Unidad encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Unidad"
 *       404:
 *         description: Unidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Unidad no encontrada" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               error:
 *                 value: { mensaje: "Error interno del servidor" }
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
 *             $ref: "#/components/schemas/UnidadCreateInput"
 *           examples:
 *             crearUnidad:
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
 *               $ref: "#/components/schemas/UnidadCreateResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Unidad creada correctamente"
 *                   unidad:
 *                     id: 1
 *                     codigo: "CAJ"
 *                     nombre: "Caja"
 *                     descripcion: "Caja cerrada"
 *                     activo: true
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltanCampos:
 *                 value: { mensaje: "Código y nombre son obligatorios" }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       409:
 *         description: Código duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               duplicado:
 *                 value: { mensaje: "Ya existe una unidad con ese código" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               error:
 *                 value: { mensaje: "Error interno del servidor" }
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
 *     summary: Actualizar una unidad (parcial)
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UnidadUpdateInput"
 *           examples:
 *             actualizarUnidad:
 *               value:
 *                 nombre: "Unidad (actualizada)"
 *                 activo: true
 *     responses:
 *       200:
 *         description: Unidad actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UnidadUpdateResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Unidad actualizada correctamente"
 *                   unidad:
 *                     id: 1
 *                     codigo: "UND"
 *                     nombre: "Unidad (actualizada)"
 *                     descripcion: "Unidad estándar"
 *                     activo: true
 *       404:
 *         description: Unidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Unidad no encontrada" }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       409:
 *         description: Código duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               duplicado:
 *                 value: { mensaje: "Ya existe una unidad con ese código" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               error:
 *                 value: { mensaje: "Error interno del servidor" }
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  unidadController.actualizarUnidad
);

module.exports = router;

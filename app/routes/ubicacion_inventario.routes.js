const express = require("express");
const router = express.Router();

const ubicacionController = require("../controllers/ubicacion_inventario.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");


/**
 * @swagger
 * components:
 *   schemas:
 *     UbicacionInventarioTipo:
 *       type: string
 *       enum: [ALMACEN, CONSIGNACION, OTRO]
 *
 *     UbicacionInventario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Bodega Central"
 *         tipo:
 *           $ref: "#/components/schemas/UbicacionInventarioTipo"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Ubicación principal"
 *         activo:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2026-01-21T10:20:30.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2026-01-21T10:20:30.000Z"
 *
 *     UbicacionInventarioCreateInput:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Bodega Central"
 *         tipo:
 *           $ref: "#/components/schemas/UbicacionInventarioTipo"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Ubicación principal"
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     UbicacionInventarioUpdateInput:
 *       type: object
 *       description: Campos opcionales para actualización parcial.
 *       properties:
 *         nombre:
 *           type: string
 *         tipo:
 *           $ref: "#/components/schemas/UbicacionInventarioTipo"
 *         descripcion:
 *           type: string
 *           nullable: true
 *         activo:
 *           type: boolean
 *
 *     UbicacionInventarioCreateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Ubicación creada correctamente"
 *         ubicacion:
 *           $ref: "#/components/schemas/UbicacionInventario"
 *
 *     UbicacionInventarioUpdateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Ubicación actualizada correctamente"
 *         ubicacion:
 *           $ref: "#/components/schemas/UbicacionInventario"
 */

/**
 * @swagger
 * /api/ubicaciones-inventario:
 *   get:
 *     summary: Listar ubicaciones de inventario (filtro opcional por activo)
 *     tags: [UbicacionesInventario]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: true|false
 *         example: true
 *     responses:
 *       200:
 *         description: Lista de ubicaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/UbicacionInventario"
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
router.get("/", ubicacionController.listarUbicaciones);

/**
 * @swagger
 * /api/ubicaciones-inventario/{id}:
 *   get:
 *     summary: Obtener ubicación de inventario por ID
 *     tags: [UbicacionesInventario]
 *     security: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     responses:
 *       200:
 *         description: Ubicación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UbicacionInventario"
 *       404:
 *         description: Ubicación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Ubicación no encontrada" }
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
router.get("/:id", ubicacionController.obtenerUbicacionPorId);

/**
 * @swagger
 * /api/ubicaciones-inventario:
 *   post:
 *     summary: Crear ubicación de inventario
 *     description: |
 *       Reglas del controller:
 *       - Obligatorio: `nombre`
 *       - `tipo` si se omite: "ALMACEN"
 *     tags: [UbicacionesInventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UbicacionInventarioCreateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 nombre: "Bodega Central"
 *                 tipo: "ALMACEN"
 *                 descripcion: "Ubicación principal"
 *                 activo: true
 *     responses:
 *       201:
 *         description: Ubicación creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UbicacionInventarioCreateResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Ubicación creada correctamente"
 *                   ubicacion:
 *                     id: 1
 *                     nombre: "Bodega Central"
 *                     tipo: "ALMACEN"
 *                     descripcion: "Ubicación principal"
 *                     activo: true
 *       400:
 *         description: Validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               nombreRequerido:
 *                 value: { mensaje: "El nombre es obligatorio" }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
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
  ubicacionController.crearUbicacion
);

/**
 * @swagger
 * /api/ubicaciones-inventario/{id}:
 *   patch:
 *     summary: Actualizar ubicación de inventario (parcial)
 *     tags: [UbicacionesInventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UbicacionInventarioUpdateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 descripcion: "Reubicada en zona 2"
 *                 activo: true
 *     responses:
 *       200:
 *         description: Ubicación actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UbicacionInventarioUpdateResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Ubicación actualizada correctamente"
 *                   ubicacion:
 *                     id: 1
 *                     nombre: "Bodega Central"
 *                     tipo: "ALMACEN"
 *                     descripcion: "Reubicada en zona 2"
 *                     activo: true
 *       404:
 *         description: Ubicación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Ubicación no encontrada" }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
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
  ubicacionController.actualizarUbicacion
);

module.exports = router;

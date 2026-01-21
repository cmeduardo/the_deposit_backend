const express = require("express");
const router = express.Router();

const ubicacionController = require("../controllers/ubicacion_inventario.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: UbicacionesInventario
 *   description: Gestión de ubicaciones de inventario (almacenes, consignación, etc.)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *
 *     UbicacionInventarioTipo:
 *       type: string
 *       enum: [ALMACEN, CONSIGNACION, OTRO]
 *
 *     UbicacionInventario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         tipo:
 *           $ref: '#/components/schemas/UbicacionInventarioTipo'
 *         descripcion:
 *           type: string
 *           nullable: true
 *         activo:
 *           type: boolean
 *
 *     UbicacionInventarioCreateInput:
 *       type: object
 *       required: [nombre, tipo]
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Bodega Central"
 *         tipo:
 *           $ref: '#/components/schemas/UbicacionInventarioTipo'
 *         descripcion:
 *           type: string
 *           example: "Ubicación principal"
 *         activo:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /api/ubicaciones-inventario:
 *   get:
 *     summary: Listar ubicaciones de inventario
 *     tags: [UbicacionesInventario]
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: true|false
 *     responses:
 *       200:
 *         description: Lista de ubicaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UbicacionInventario'
 *       500:
 *         description: Error interno
 */
router.get("/", ubicacionController.listarUbicaciones);

/**
 * @swagger
 * /api/ubicaciones-inventario/{id}:
 *   get:
 *     summary: Obtener ubicación de inventario por ID
 *     tags: [UbicacionesInventario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ubicación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UbicacionInventario'
 *       404:
 *         description: No encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno
 */
router.get("/:id", ubicacionController.obtenerUbicacionPorId);

/**
 * @swagger
 * /api/ubicaciones-inventario:
 *   post:
 *     summary: Crear ubicación de inventario
 *     tags: [UbicacionesInventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UbicacionInventarioCreateInput'
 *     responses:
 *       201:
 *         description: Ubicación creada
 *       400:
 *         description: Validación (faltan campos / tipo inválido)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo ADMIN)
 *       500:
 *         description: Error interno
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
 *     summary: Actualizar ubicación de inventario
 *     tags: [UbicacionesInventario]
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
 *             $ref: '#/components/schemas/UbicacionInventario'
 *     responses:
 *       200:
 *         description: Ubicación actualizada
 *       404:
 *         description: No encontrada
 *       400:
 *         description: Validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo ADMIN)
 *       500:
 *         description: Error interno
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  ubicacionController.actualizarUbicacion
);

module.exports = router;

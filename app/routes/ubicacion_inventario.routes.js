const express = require("express");
const router = express.Router();

const ubicacionController = require("../controllers/ubicacion_inventario.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: UbicacionesInventario
 *   description: Gestión de ubicaciones de inventario
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UbicacionInventario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         tipo:
 *           type: string
 *           enum: [ALMACEN, CONSIGNACION, OTRO]
 *         descripcion:
 *           type: string
 *         activo:
 *           type: boolean
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
 *     responses:
 *       200:
 *         description: Lista de ubicaciones
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
 *       404:
 *         description: No encontrada
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
 *             $ref: '#/components/schemas/UbicacionInventario'
 *     responses:
 *       201:
 *         description: Ubicación creada
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
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  ubicacionController.actualizarUbicacion
);

module.exports = router;

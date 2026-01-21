const express = require("express");
const router = express.Router();

const proveedorController = require("../controllers/proveedor.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Proveedores
 *   description: Gestión de proveedores
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
 *     Proveedor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         telefono:
 *           type: string
 *           nullable: true
 *         correo:
 *           type: string
 *           nullable: true
 *         direccion:
 *           type: string
 *           nullable: true
 *         activo:
 *           type: boolean
 *
 *     ProveedorCreateInput:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         nombre:
 *           type: string
 *         telefono:
 *           type: string
 *         correo:
 *           type: string
 *         direccion:
 *           type: string
 *         activo:
 *           type: boolean
 */

/**
 * @swagger
 * /api/proveedores:
 *   get:
 *     summary: Listar proveedores (filtro opcional por activo)
 *     tags: [Proveedores]
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: true|false
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proveedor'
 *       500:
 *         description: Error interno
 */
router.get("/", proveedorController.listarProveedores);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   get:
 *     summary: Obtener proveedor por ID
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error interno
 */
router.get("/:id", proveedorController.obtenerProveedorPorId);

/**
 * @swagger
 * /api/proveedores:
 *   post:
 *     summary: Crear proveedor
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProveedorCreateInput'
 *     responses:
 *       201:
 *         description: Proveedor creado correctamente
 *       400:
 *         description: Validación (nombre requerido, etc.)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo ADMIN)
 *       409:
 *         description: Conflicto (si validas duplicados)
 *       500:
 *         description: Error interno
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  proveedorController.crearProveedor
);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   patch:
 *     summary: Actualizar proveedor
 *     tags: [Proveedores]
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
 *             $ref: '#/components/schemas/Proveedor'
 *     responses:
 *       200:
 *         description: Proveedor actualizado correctamente
 *       404:
 *         description: No encontrado
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
  proveedorController.actualizarProveedor
);

module.exports = router;

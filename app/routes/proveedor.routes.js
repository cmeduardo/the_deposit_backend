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
 *     Proveedor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         nit:
 *           type: string
 *         tipo:
 *           type: string
 *         telefono:
 *           type: string
 *         correo:
 *           type: string
 *         direccion:
 *           type: string
 *         notas:
 *           type: string
 *         activo:
 *           type: boolean
 */

/**
 * @swagger
 * /api/proveedores:
 *   get:
 *     summary: Listar proveedores
 *     tags: [Proveedores]
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de proveedores
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
 *       404:
 *         description: No encontrado
 */
router.get("/:id", proveedorController.obtenerProveedorPorId);

/**
 * @swagger
 * /api/proveedores/nit/{nit}:
 *   get:
 *     summary: Obtener proveedor por NIT
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: nit
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *       404:
 *         description: No encontrado
 */
router.get("/nit/:nit", proveedorController.obtenerProveedorPorNit);

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
 *             $ref: '#/components/schemas/Proveedor'
 *     responses:
 *       201:
 *         description: Proveedor creado
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
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
 *         description: Proveedor actualizado
 *       404:
 *         description: No encontrado
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  proveedorController.actualizarProveedor
);

module.exports = router;
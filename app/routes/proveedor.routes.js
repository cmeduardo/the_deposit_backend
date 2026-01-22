const express = require("express");
const router = express.Router();

const proveedorController = require("../controllers/proveedor.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Proveedor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Distribuidora Central"
 *         nit:
 *           type: string
 *           nullable: true
 *           example: "1234567-8"
 *         tipo:
 *           type: string
 *           nullable: true
 *           example: "MAYORISTA"
 *         telefono:
 *           type: string
 *           nullable: true
 *           example: "+502 5555-5555"
 *         correo:
 *           type: string
 *           nullable: true
 *           example: "ventas@proveedor.com"
 *         direccion:
 *           type: string
 *           nullable: true
 *           example: "Zona 1, Guatemala"
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Entrega martes y jueves"
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     ProveedorCreateInput:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Distribuidora Central"
 *         nit:
 *           type: string
 *           nullable: true
 *           example: "1234567-8"
 *         tipo:
 *           type: string
 *           nullable: true
 *           example: "MAYORISTA"
 *         telefono:
 *           type: string
 *           nullable: true
 *           example: "+502 5555-5555"
 *         correo:
 *           type: string
 *           nullable: true
 *           example: "ventas@proveedor.com"
 *         direccion:
 *           type: string
 *           nullable: true
 *           example: "Zona 1, Guatemala"
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Entrega martes y jueves"
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     ProveedorUpdateInput:
 *       type: object
 *       description: Campos opcionales para actualización parcial.
 *       properties:
 *         nombre:
 *           type: string
 *         nit:
 *           type: string
 *           nullable: true
 *         tipo:
 *           type: string
 *           nullable: true
 *         telefono:
 *           type: string
 *           nullable: true
 *         correo:
 *           type: string
 *           nullable: true
 *         direccion:
 *           type: string
 *           nullable: true
 *         notas:
 *           type: string
 *           nullable: true
 *         activo:
 *           type: boolean
 *
 *     ProveedorCreateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Proveedor creado correctamente"
 *         proveedor:
 *           $ref: "#/components/schemas/Proveedor"
 *
 *     ProveedorUpdateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Proveedor actualizado correctamente"
 *         proveedor:
 *           $ref: "#/components/schemas/Proveedor"
 */

/**
 * @swagger
 * /api/proveedores:
 *   get:
 *     summary: Listar proveedores (filtro opcional por activo)
 *     description: |
 *       Devuelve proveedores.
 *       Filtro:
 *       - `activo` (true|false)
 *     tags: [Proveedores]
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
 *         description: Lista de proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Proveedor"
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
router.get("/", proveedorController.listarProveedores);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   get:
 *     summary: Obtener proveedor por ID
 *     tags: [Proveedores]
 *     security: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Proveedor"
 *       404:
 *         description: Proveedor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Proveedor no encontrado" }
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
router.get("/:id", proveedorController.obtenerProveedorPorId);

/**
 * @swagger
 * /api/proveedores/nit/{nit}:
 *   get:
 *     summary: Obtener proveedor por NIT
 *     description: |
 *       Busca un proveedor por su NIT exacto.
 *     tags: [Proveedores]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: nit
 *         required: true
 *         schema:
 *           type: string
 *         example: "1234567-8"
 *         description: NIT del proveedor
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Proveedor"
 *       404:
 *         description: Proveedor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Proveedor no encontrado" }
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
router.get("/nit/:nit", proveedorController.obtenerProveedorPorNit);

/**
 * @swagger
 * /api/proveedores:
 *   post:
 *     summary: Crear proveedor
 *     description: |
 *       Reglas del controller:
 *       - Obligatorio: `nombre`
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProveedorCreateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 nombre: "Distribuidora Central"
 *                 nit: "1234567-8"
 *                 tipo: "MAYORISTA"
 *                 telefono: "+502 5555-5555"
 *                 correo: "ventas@proveedor.com"
 *                 direccion: "Zona 1, Guatemala"
 *                 notas: "Entrega martes y jueves"
 *                 activo: true
 *     responses:
 *       201:
 *         description: Proveedor creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ProveedorCreateResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Proveedor creado correctamente"
 *                   proveedor:
 *                     id: 1
 *                     nombre: "Distribuidora Central"
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
  proveedorController.crearProveedor
);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   patch:
 *     summary: Actualizar proveedor (parcial)
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProveedorUpdateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 telefono: "+502 4444-4444"
 *                 activo: false
 *     responses:
 *       200:
 *         description: Proveedor actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ProveedorUpdateResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Proveedor actualizado correctamente"
 *                   proveedor:
 *                     id: 1
 *                     nombre: "Distribuidora Central"
 *       404:
 *         description: Proveedor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Proveedor no encontrado" }
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
  proveedorController.actualizarProveedor
);

module.exports = router;

const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuario.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         nombre:
 *           type: string
 *           example: "Vendedor 1"
 *         correo:
 *           type: string
 *           format: email
 *           example: "vendedor1@deposito.com"
 *         rol:
 *           type: string
 *           enum: [ADMINISTRADOR, VENDEDOR, CLIENTE]
 *           example: "VENDEDOR"
 *         activo:
 *           type: boolean
 *           example: true
 *         telefono:
 *           type: string
 *           nullable: true
 *           example: "502 5555-5555"
 *         nit:
 *           type: string
 *           example: "CF"
 *           description: "NIT del usuario. Por defecto: CF (Consumidor Final)."
 *         direccion:
 *           type: string
 *           nullable: true
 *           example: "Zona 10, Ciudad de Guatemala"
 *         dpi:
 *           type: string
 *           nullable: true
 *           example: "1234567890101"
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
 *     CrearUsuarioInput:
 *       type: object
 *       required: [nombre, correo, contrasena, rol]
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Vendedor 1"
 *         correo:
 *           type: string
 *           format: email
 *           example: "vendedor1@deposito.com"
 *         contrasena:
 *           type: string
 *           minLength: 8
 *           example: "PasswordSegura123"
 *         rol:
 *           type: string
 *           enum: [ADMINISTRADOR, VENDEDOR, CLIENTE]
 *           example: "VENDEDOR"
 *         activo:
 *           type: boolean
 *           example: true
 *         telefono:
 *           type: string
 *           nullable: true
 *           example: "502 5555-5555"
 *         nit:
 *           type: string
 *           example: "CF"
 *           description: "Si se omite o viene vacío, se guarda como CF."
 *         direccion:
 *           type: string
 *           nullable: true
 *           example: "Zona 10, Ciudad de Guatemala"
 *         dpi:
 *           type: string
 *           nullable: true
 *           example: "1234567890101"
 *
 *     ActualizarUsuarioInput:
 *       type: object
 *       description: "Actualización parcial. Si se envía `contrasena`, se actualiza el hash."
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Vendedor 1 (editado)"
 *         correo:
 *           type: string
 *           format: email
 *           example: "vendedor1@deposito.com"
 *         contrasena:
 *           type: string
 *           minLength: 8
 *           example: "NuevaPass123"
 *         rol:
 *           type: string
 *           enum: [ADMINISTRADOR, VENDEDOR, CLIENTE]
 *           example: "VENDEDOR"
 *         activo:
 *           type: boolean
 *           example: true
 *         telefono:
 *           type: string
 *           nullable: true
 *           example: "502 5555-5555"
 *         nit:
 *           type: string
 *           example: "CF"
 *           description: "Si se envía vacío/null, se fuerza a CF."
 *         direccion:
 *           type: string
 *           nullable: true
 *           example: "Zona 10, Ciudad de Guatemala"
 *         dpi:
 *           type: string
 *           nullable: true
 *           example: "1234567890101"
 *
 *     CambiarEstadoUsuarioInput:
 *       type: object
 *       required: [activo]
 *       properties:
 *         activo:
 *           type: boolean
 *           example: false
 *
 *     UsuarioCreateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Usuario creado correctamente"
 *         usuario:
 *           $ref: "#/components/schemas/Usuario"
 *
 *     UsuarioUpdateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Usuario actualizado correctamente"
 *         usuario:
 *           $ref: "#/components/schemas/Usuario"
 *
 *     UsuarioEstadoResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Estado del usuario actualizado correctamente"
 *         usuario:
 *           $ref: "#/components/schemas/Usuario"
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar usuarios
 *     description: Obtiene la lista de usuarios registrados. Solo para administradores.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Usuario"
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
router.get(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  usuarioController.listarUsuarios
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Usuario"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Usuario no encontrado" }
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
router.get(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  usuarioController.obtenerUsuarioPorId
);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear usuario (cualquier rol)
 *     description: Crea un usuario con rol ADMINISTRADOR, VENDEDOR o CLIENTE. Solo para administradores.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CrearUsuarioInput"
 *           examples:
 *             crearVendedor:
 *               summary: Crear vendedor
 *               value:
 *                 nombre: "Vendedor 1"
 *                 correo: "vendedor1@deposito.com"
 *                 contrasena: "PasswordSegura123"
 *                 rol: "VENDEDOR"
 *                 activo: true
 *                 telefono: "502 5555-5555"
 *                 nit: "CF"
 *                 direccion: "Zona 10, Ciudad de Guatemala"
 *                 dpi: "1234567890101"
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UsuarioCreateResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Usuario creado correctamente"
 *                   usuario:
 *                     id: 10
 *                     nombre: "Vendedor 1"
 *                     correo: "vendedor1@deposito.com"
 *                     rol: "VENDEDOR"
 *                     activo: true
 *                     telefono: "502 5555-5555"
 *                     nit: "CF"
 *                     direccion: "Zona 10, Ciudad de Guatemala"
 *                     dpi: "1234567890101"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltanCampos:
 *                 value: { mensaje: "Nombre, correo, contraseña y rol son obligatorios" }
 *               rolInvalido:
 *                 value: { mensaje: "Rol inválido. Roles permitidos: ADMINISTRADOR, VENDEDOR, CLIENTE" }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       409:
 *         description: Correo en uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               correoEnUso:
 *                 value: { mensaje: "Ya existe un usuario con ese correo" }
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
  usuarioController.crearUsuario
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   patch:
 *     summary: Actualizar usuario (parcial)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ActualizarUsuarioInput"
 *           examples:
 *             actualizarRolEstado:
 *               summary: Cambiar rol/estado
 *               value:
 *                 rol: "ADMINISTRADOR"
 *                 activo: true
 *             actualizarDatosContacto:
 *               summary: Actualizar contacto
 *               value:
 *                 telefono: "502 4444-4444"
 *                 direccion: "Zona 1, Ciudad de Guatemala"
 *                 nit: "CF"
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UsuarioUpdateResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Usuario actualizado correctamente"
 *                   usuario:
 *                     id: 10
 *                     nombre: "Vendedor 1"
 *                     correo: "vendedor1@deposito.com"
 *                     rol: "ADMINISTRADOR"
 *                     activo: true
 *                     telefono: "502 4444-4444"
 *                     nit: "CF"
 *                     direccion: "Zona 1, Ciudad de Guatemala"
 *                     dpi: "1234567890101"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               rolInvalido:
 *                 value: { mensaje: "Rol inválido. Roles permitidos: ADMINISTRADOR, VENDEDOR, CLIENTE" }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Usuario no encontrado" }
 *       409:
 *         description: Correo en uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               correoEnUso:
 *                 value: { mensaje: "Ya existe un usuario con ese correo" }
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
  usuarioController.actualizarUsuario
);

/**
 * @swagger
 * /api/usuarios/{id}/estado:
 *   patch:
 *     summary: Cambiar estado (activo/inactivo) de un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CambiarEstadoUsuarioInput"
 *           examples:
 *             desactivar:
 *               summary: Desactivar usuario
 *               value:
 *                 activo: false
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UsuarioEstadoResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Estado del usuario actualizado correctamente"
 *                   usuario:
 *                     id: 10
 *                     nombre: "Vendedor 1"
 *                     correo: "vendedor1@deposito.com"
 *                     rol: "VENDEDOR"
 *                     activo: false
 *                     telefono: "502 5555-5555"
 *                     nit: "CF"
 *                     direccion: "Zona 10, Ciudad de Guatemala"
 *                     dpi: "1234567890101"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltaActivo:
 *                 value: { mensaje: "El campo 'activo' es obligatorio (true/false)" }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Usuario no encontrado" }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               error:
 *                 value: { mensaje: "Error interno del servidor" }
 */
router.patch(
  "/:id/estado",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  usuarioController.cambiarEstadoUsuario
);

module.exports = router;

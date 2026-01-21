const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuario.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Administración de usuarios (solo administrador)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UsuarioListado:
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
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
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
 *
 *     ActualizarUsuarioInput:
 *       type: object
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
 *
 *     CambiarEstadoUsuarioInput:
 *       type: object
 *       required: [activo]
 *       properties:
 *         activo:
 *           type: boolean
 *           example: false
 *
 *     ApiError:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Error interno del servidor"
 *
 *     ApiMensajeUsuario:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Usuario creado correctamente"
 *         usuario:
 *           $ref: '#/components/schemas/UsuarioListado'
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
 *                 $ref: '#/components/schemas/UsuarioListado'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioListado'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               mensaje: "Usuario no encontrado"
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *             $ref: '#/components/schemas/CrearUsuarioInput'
 *           examples:
 *             crearVendedor:
 *               summary: Crear vendedor
 *               value:
 *                 nombre: "Vendedor 1"
 *                 correo: "vendedor1@deposito.com"
 *                 contrasena: "PasswordSegura123"
 *                 rol: "VENDEDOR"
 *                 activo: true
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMensajeUsuario'
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
 *       409:
 *         description: Correo en uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               mensaje: "Ya existe un usuario con ese correo"
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
  usuarioController.crearUsuario
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   patch:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarUsuarioInput'
 *           examples:
 *             actualizarRol:
 *               summary: Cambiar rol/estado
 *               value:
 *                 rol: "ADMINISTRADOR"
 *                 activo: true
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMensajeUsuario'
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
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Correo en uso
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CambiarEstadoUsuarioInput'
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
 *               $ref: '#/components/schemas/ApiMensajeUsuario'
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
 *         description: Usuario no encontrado
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
  "/:id/estado",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  usuarioController.cambiarEstadoUsuario
);

module.exports = router;

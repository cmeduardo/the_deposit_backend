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
 *         nombre:
 *           type: string
 *         correo:
 *           type: string
 *         rol:
 *           type: string
 *           enum: [ADMINISTRADOR, VENDEDOR, CLIENTE]
 *         activo:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CrearUsuarioInput:
 *       type: object
 *       required:
 *         - nombre
 *         - correo
 *         - contrasena
 *         - rol
 *       properties:
 *         nombre:
 *           type: string
 *           example: Vendedor 1
 *         correo:
 *           type: string
 *           example: vendedor1@deposito.com
 *         contrasena:
 *           type: string
 *           example: "PasswordSegura123"
 *         rol:
 *           type: string
 *           enum: [ADMINISTRADOR, VENDEDOR, CLIENTE]
 *           example: VENDEDOR
 *         activo:
 *           type: boolean
 *           example: true
 *     ActualizarUsuarioInput:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *         correo:
 *           type: string
 *         contrasena:
 *           type: string
 *         rol:
 *           type: string
 *           enum: [ADMINISTRADOR, VENDEDOR, CLIENTE]
 *         activo:
 *           type: boolean
 *     CambiarEstadoUsuarioInput:
 *       type: object
 *       required:
 *         - activo
 *       properties:
 *         activo:
 *           type: boolean
 *           example: false
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
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
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
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       409:
 *         description: Correo en uso
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
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarUsuarioInput'
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Usuario no encontrado
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
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CambiarEstadoUsuarioInput'
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Usuario no encontrado
 */
router.patch(
  "/:id/estado",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  usuarioController.cambiarEstadoUsuario
);

module.exports = router;

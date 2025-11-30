const express = require("express");
const router = express.Router();

const autenticacionController = require("../controllers/autenticacion.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para registro y login de usuarios
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UsuarioPublico:
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
 *     RegistroUsuarioInput:
 *       type: object
 *       required:
 *         - nombre
 *         - correo
 *         - contrasena
 *       properties:
 *         nombre:
 *           type: string
 *           example: Juan Pérez
 *         correo:
 *           type: string
 *           example: juan@example.com
 *         contrasena:
 *           type: string
 *           example: "MiContraseñaSegura123"
 *     LoginInput:
 *       type: object
 *       required:
 *         - correo
 *         - contrasena
 *       properties:
 *         correo:
 *           type: string
 *           example: juan@example.com
 *         contrasena:
 *           type: string
 *           example: "MiContraseñaSegura123"
 */

/**
 * @swagger
 * /api/autenticacion/registro:
 *   post:
 *     summary: Registrar un nuevo usuario cliente
 *     description: Crea un usuario con rol CLIENTE y devuelve un JWT.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroUsuarioInput'
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Usuario registrado correctamente
 *                 token:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/UsuarioPublico'
 *       400:
 *         description: Datos incompletos
 *       409:
 *         description: Ya existe un usuario con ese correo
 */

/**
 * @swagger
 * /api/autenticacion/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica a un usuario y devuelve un JWT.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Inicio de sesión exitoso
 *                 token:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/UsuarioPublico'
 *       400:
 *         description: Datos incompletos
 *       401:
 *         description: Credenciales inválidas
 */

/**
 * @swagger
 * /api/autenticacion/perfil:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioPublico'
 *       401:
 *         description: No autenticado o token inválido
 */

router.post("/registro", autenticacionController.registrar);
router.post("/login", autenticacionController.iniciarSesion);
router.get(
  "/perfil",
  autenticacionMiddleware,
  autenticacionController.obtenerPerfil
);

module.exports = router;

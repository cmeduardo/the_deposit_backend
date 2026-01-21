const express = require("express");
const router = express.Router();

const autenticacionController = require("../controllers/autenticacion.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");


/**
 * @swagger
 * components:
 *   schemas:
 *     UsuarioPublico:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         nombre:
 *           type: string
 *           example: "Juan Pérez"
 *         correo:
 *           type: string
 *           format: email
 *           example: "juan@example.com"
 *         rol:
 *           type: string
 *           enum: [ADMINISTRADOR, VENDEDOR, CLIENTE]
 *           example: CLIENTE
 *
 *     RegistroUsuarioInput:
 *       type: object
 *       required:
 *         - nombre
 *         - correo
 *         - contrasena
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           example: "Juan Pérez"
 *         correo:
 *           type: string
 *           format: email
 *           example: "juan@example.com"
 *         contrasena:
 *           type: string
 *           minLength: 6
 *           example: "MiContrasenaSegura123"
 *
 *     LoginInput:
 *       type: object
 *       required:
 *         - correo
 *         - contrasena
 *       properties:
 *         correo:
 *           type: string
 *           format: email
 *           example: "juan@example.com"
 *         contrasena:
 *           type: string
 *           example: "MiContrasenaSegura123"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Inicio de sesión exitoso"
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         usuario:
 *           $ref: "#/components/schemas/UsuarioPublico"
 */

/**
 * @swagger
 * /api/autenticacion/registro:
 *   post:
 *     summary: Registrar un nuevo usuario cliente
 *     description: Crea un usuario con rol **CLIENTE** y devuelve un **JWT**.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RegistroUsuarioInput"
 *           examples:
 *             registroValido:
 *               summary: Registro válido
 *               value:
 *                 nombre: "Juan Pérez"
 *                 correo: "juan@example.com"
 *                 contrasena: "MiContrasenaSegura123"
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *             examples:
 *               creado:
 *                 value:
 *                   mensaje: "Usuario registrado correctamente"
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   usuario:
 *                     id: 12
 *                     nombre: "Juan Pérez"
 *                     correo: "juan@example.com"
 *                     rol: "CLIENTE"
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltanCampos:
 *                 value:
 *                   mensaje: "Nombre, correo y contraseña son obligatorios"
 *       409:
 *         $ref: "#/components/responses/ConflictError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /api/autenticacion/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica a un usuario y devuelve un **JWT**.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LoginInput"
 *           examples:
 *             loginValido:
 *               summary: Login válido
 *               value:
 *                 correo: "juan@example.com"
 *                 contrasena: "MiContrasenaSegura123"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Inicio de sesión exitoso"
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   usuario:
 *                     id: 12
 *                     nombre: "Juan Pérez"
 *                     correo: "juan@example.com"
 *                     rol: "CLIENTE"
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltanCampos:
 *                 value:
 *                   mensaje: "Correo y contraseña son obligatorios"
 *       401:
 *         description: Credenciales inválidas / usuario inactivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               credencialesInvalidas:
 *                 value:
 *                   mensaje: "Credenciales inválidas"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /api/autenticacion/perfil:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     description: Devuelve el perfil del usuario autenticado según el `id` contenido en el JWT.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UsuarioPublico"
 *             examples:
 *               perfil:
 *                 value:
 *                   id: 12
 *                   nombre: "Juan Pérez"
 *                   correo: "juan@example.com"
 *                   rol: "CLIENTE"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               sinToken:
 *                 value:
 *                   mensaje: "No se proporcionó token"
 *               formatoInvalido:
 *                 value:
 *                   mensaje: "Formato de token inválido"
 *               tokenInvalido:
 *                 value:
 *                   mensaje: "Token inválido o expirado"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

// Rutas
router.post("/registro", autenticacionController.registrar);
router.post("/login", autenticacionController.iniciarSesion);
router.get("/perfil", autenticacionMiddleware, autenticacionController.obtenerPerfil);

module.exports = router;

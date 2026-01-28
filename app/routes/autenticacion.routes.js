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
 *     UsuarioPerfil:
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
 *           example: "CLIENTE"
 *         activo:
 *           type: boolean
 *           example: true
 *         telefono:
 *           type: string
 *           nullable: true
 *           example: "+502 5555-5555"
 *         nit:
 *           type: string
 *           example: "CF"
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
 *     RegistroUsuarioInput:
 *       type: object
 *       required: [nombre, correo, contrasena]
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
 *       required: [correo, contrasena]
 *       properties:
 *         correo:
 *           type: string
 *           format: email
 *           example: "juan@example.com"
 *         contrasena:
 *           type: string
 *           example: "MiContrasenaSegura123"
 *
 *     PerfilUpdateInput:
 *       type: object
 *       description: Actualización parcial del perfil. Si `nit` viene vacío/null, se normaliza a "CF".
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Juan Pérez"
 *         correo:
 *           type: string
 *           format: email
 *           example: "juan@example.com"
 *         telefono:
 *           type: string
 *           nullable: true
 *           example: "+502 5555-5555"
 *         nit:
 *           type: string
 *           nullable: true
 *           example: "1234567-8"
 *         direccion:
 *           type: string
 *           nullable: true
 *           example: "Zona 10, Ciudad de Guatemala"
 *         dpi:
 *           type: string
 *           nullable: true
 *           example: "1234567890101"
 *         contrasena:
 *           type: string
 *           minLength: 6
 *           description: Si se envía, actualiza la contraseña.
 *           example: "NuevaPass123"
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
 *
 *     PerfilUpdateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Perfil actualizado correctamente"
 *         usuario:
 *           $ref: "#/components/schemas/UsuarioPerfil"
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
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltanCampos:
 *                 value: { mensaje: "Nombre, correo y contraseña son obligatorios" }
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
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltanCampos:
 *                 value: { mensaje: "Correo y contraseña son obligatorios" }
 *       401:
 *         description: Credenciales inválidas / usuario inactivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               credencialesInvalidas:
 *                 value: { mensaje: "Credenciales inválidas" }
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /api/autenticacion/perfil:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     description: Devuelve el perfil completo del usuario autenticado según el `id` contenido en el JWT.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UsuarioPerfil"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /api/autenticacion/perfil:
 *   patch:
 *     summary: Actualizar el perfil del usuario autenticado (parcial)
 *     description: |
 *       Permite actualizar datos del perfil para futuras compras/pedidos.
 *       - No permite cambiar `rol` ni `activo`.
 *       - Si `correo` cambia, valida duplicado.
 *       - Si se envía `contrasena`, se actualiza.
 *       - Si `nit` viene vacío/null, se normaliza a **"CF"**.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/PerfilUpdateInput"
 *           examples:
 *             actualizarDatos:
 *               value:
 *                 telefono: "+502 5555-5555"
 *                 nit: "1234567-8"
 *                 direccion: "Zona 10, Ciudad de Guatemala"
 *             cambiarContrasena:
 *               value:
 *                 contrasena: "NuevaPass123"
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PerfilUpdateResponse"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       409:
 *         $ref: "#/components/responses/ConflictError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

// Rutas
router.post("/registro", autenticacionController.registrar);
router.post("/login", autenticacionController.iniciarSesion);
router.get("/perfil", autenticacionMiddleware, autenticacionController.obtenerPerfil);
router.patch("/perfil", autenticacionMiddleware, autenticacionController.actualizarPerfil);

module.exports = router;

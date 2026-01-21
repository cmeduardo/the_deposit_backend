const express = require("express");
const router = express.Router();

const autenticacionController = require("../controllers/autenticacion.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para registro, login y perfil de usuarios
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
 *           example: 12
 *         nombre:
 *           type: string
 *           example: Juan Pérez
 *         correo:
 *           type: string
 *           format: email
 *           example: juan@example.com
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
 *           example: Juan Pérez
 *         correo:
 *           type: string
 *           format: email
 *           example: juan@example.com
 *         contrasena:
 *           type: string
 *           minLength: 6
 *           example: "MiContraseñaSegura123"
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
 *           example: juan@example.com
 *         contrasena:
 *           type: string
 *           example: "MiContraseñaSegura123"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Error interno del servidor"
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
 *           $ref: '#/components/schemas/UsuarioPublico'
 */

/**
 * @swagger
 * /api/autenticacion/registro:
 *   post:
 *     summary: Registrar un nuevo usuario cliente
 *     description: |
 *       Crea un usuario con rol **CLIENTE** y devuelve un **JWT**.
 *
 *       **Notas:**
 *       - Requiere `nombre`, `correo`, `contrasena`.
 *       - Si el correo ya existe retorna **409**.
 *       - La contraseña se almacena hasheada (bcrypt).
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroUsuarioInput'
 *           examples:
 *             ejemploRegistro:
 *               summary: Registro válido
 *               value:
 *                 nombre: "Juan Pérez"
 *                 correo: "juan@example.com"
 *                 contrasena: "MiContraseñaSegura123"
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Usuario registrado correctamente"
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   usuario:
 *                     id: 12
 *                     nombre: "Juan Pérez"
 *                     correo: "juan@example.com"
 *                     rol: "CLIENTE"
 *       400:
 *         description: Datos incompletos (faltan campos obligatorios)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               faltanCampos:
 *                 value:
 *                   mensaje: "Nombre, correo y contraseña son obligatorios"
 *       409:
 *         description: Ya existe un usuario con ese correo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               correoDuplicado:
 *                 value:
 *                   mensaje: "Ya existe un usuario con ese correo"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/autenticacion/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: |
 *       Autentica a un usuario y devuelve un **JWT**.
 *
 *       **Notas:**
 *       - Requiere `correo` y `contrasena`.
 *       - Si el usuario no existe o está inactivo (`activo = false`), retorna **401**.
 *       - Si la contraseña no coincide, retorna **401**.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           examples:
 *             ejemploLogin:
 *               summary: Login válido
 *               value:
 *                 correo: "juan@example.com"
 *                 contrasena: "MiContraseñaSegura123"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
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
 *         description: Datos incompletos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               faltanCampos:
 *                 value:
 *                   mensaje: "Correo y contraseña son obligatorios"
 *       401:
 *         description: Credenciales inválidas (usuario no existe/inactivo o contraseña incorrecta)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidas:
 *                 value:
 *                   mensaje: "Credenciales inválidas"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/autenticacion/perfil:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     description: |
 *       Devuelve el perfil del usuario autenticado según el `id` contenido en el JWT.
 *
 *       **Header requerido:**
 *       ```
 *       Authorization: Bearer <token>
 *       ```
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
 *             examples:
 *               ok:
 *                 value:
 *                   id: 12
 *                   nombre: "Juan Pérez"
 *                   correo: "juan@example.com"
 *                   rol: "CLIENTE"
 *       401:
 *         description: No autenticado (token faltante, formato inválido, expirado o inválido)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         description: Usuario no encontrado (id del token no existe en BD)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noExiste:
 *                 value:
 *                   mensaje: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post("/registro", autenticacionController.registrar);
router.post("/login", autenticacionController.iniciarSesion);
router.get(
  "/perfil",
  autenticacionMiddleware,
  autenticacionController.obtenerPerfil
);

module.exports = router;

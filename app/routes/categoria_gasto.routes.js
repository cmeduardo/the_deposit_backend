const express = require("express");
const router = express.Router();

const categoriaGastoController = require("../controllers/categoria_gasto.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: CategoriasGastos
 *   description: Gestión de categorías de gastos (solo ADMINISTRADOR)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoriaGasto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Renta"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Pago mensual del local"
 *         tipo_por_defecto:
 *           type: string
 *           nullable: true
 *           enum: [FIJO, VARIABLE]
 *           example: FIJO
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     CategoriaGastoCreateInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Servicios"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Agua, luz, internet"
 *         tipo_por_defecto:
 *           type: string
 *           nullable: true
 *           enum: [FIJO, VARIABLE]
 *           example: FIJO
 *         activo:
 *           type: boolean
 *           nullable: true
 *           example: true
 *
 *     CategoriaGastoUpdateInput:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Servicios (actualizado)"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Servicios básicos"
 *         tipo_por_defecto:
 *           type: string
 *           nullable: true
 *           enum: [FIJO, VARIABLE]
 *           example: VARIABLE
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     CategoriaGastoResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Categoría de gasto creada correctamente"
 *         categoria:
 *           $ref: "#/components/schemas/CategoriaGasto"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Error interno del servidor"
 */

/**
 * @swagger
 * /api/categorias-gastos:
 *   get:
 *     summary: Listar categorías de gastos
 *     description: |
 *       Devuelve el listado de categorías de gastos.
 *       - Requiere autenticación (JWT)
 *       - Requiere rol **ADMINISTRADOR**
 *     tags: [CategoriasGastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Filtrar por estado activo=true/false
 *         example: true
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/CategoriaGasto"
 *       401:
 *         description: No autenticado / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Sin permisos (no es ADMINISTRADOR)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  categoriaGastoController.listarCategoriasGasto
);

/**
 * @swagger
 * /api/categorias-gastos/{id}:
 *   get:
 *     summary: Obtener categoría de gasto por ID
 *     description: |
 *       Devuelve una categoría por su ID.
 *       - Requiere autenticación (JWT)
 *       - Requiere rol **ADMINISTRADOR**
 *     tags: [CategoriasGastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CategoriaGasto"
 *       401:
 *         description: No autenticado / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Sin permisos (no es ADMINISTRADOR)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Categoría de gasto no encontrada" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  categoriaGastoController.obtenerCategoriaGastoPorId
);

/**
 * @swagger
 * /api/categorias-gastos:
 *   post:
 *     summary: Crear categoría de gasto
 *     description: |
 *       Crea una nueva categoría de gasto.
 *       - Requiere autenticación (JWT)
 *       - Requiere rol **ADMINISTRADOR**
 *     tags: [CategoriasGastos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CategoriaGastoCreateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 nombre: "Servicios"
 *                 descripcion: "Agua, luz, internet"
 *                 tipo_por_defecto: "FIJO"
 *                 activo: true
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CategoriaGastoResponse"
 *       400:
 *         description: Datos inválidos (ej. nombre faltante)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               nombreObligatorio:
 *                 value: { mensaje: "El nombre es obligatorio" }
 *       401:
 *         description: No autenticado / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Sin permisos (no es ADMINISTRADOR)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  categoriaGastoController.crearCategoriaGasto
);

/**
 * @swagger
 * /api/categorias-gastos/{id}:
 *   patch:
 *     summary: Actualizar categoría de gasto
 *     description: |
 *       Actualiza campos de una categoría existente.
 *       - Requiere autenticación (JWT)
 *       - Requiere rol **ADMINISTRADOR**
 *     tags: [CategoriasGastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CategoriaGastoUpdateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 descripcion: "Pago mensual del local (actualizado)"
 *                 activo: true
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Categoría de gasto actualizada correctamente"
 *                 categoria:
 *                   $ref: "#/components/schemas/CategoriaGasto"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         description: No autenticado / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Sin permisos (no es ADMINISTRADOR)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Categoría de gasto no encontrada" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  categoriaGastoController.actualizarCategoriaGasto
);

module.exports = router;

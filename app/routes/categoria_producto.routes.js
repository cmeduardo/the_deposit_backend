const express = require("express");
const router = express.Router();

const categoriaController = require("../controllers/categoria_producto.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: CategoriasProductos
 *   description: Gestión de categorías de productos. Lectura pública; escritura solo ADMINISTRADOR.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoriaProducto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "ALIMENTOS"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Alimentos de consumo humano"
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     CategoriaProductoCreateInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           example: "BEBIDAS"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Gaseosas, jugos y bebidas energéticas"
 *         activo:
 *           type: boolean
 *           nullable: true
 *           example: true
 *
 *     CategoriaProductoUpdateInput:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           example: "BEBIDAS (actualizado)"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Bebidas gaseosas y jugos"
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     CategoriaProductoResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Categoría creada correctamente"
 *         categoria:
 *           $ref: "#/components/schemas/CategoriaProducto"
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
 * /api/categorias-productos:
 *   get:
 *     summary: Listar categorías de productos
 *     description: |
 *       Devuelve el listado de categorías de productos.
 *       Este endpoint es **público** (sin JWT) para que el frontend pueda poblar filtros/menús.
 *     tags: [CategoriasProductos]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/CategoriaProducto"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/", categoriaController.listarCategorias);

/**
 * @swagger
 * /api/categorias-productos/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     description: |
 *       Devuelve una categoría por su ID.
 *       Endpoint **público** (sin JWT).
 *     tags: [CategoriasProductos]
 *     security: []
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
 *               $ref: "#/components/schemas/CategoriaProducto"
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Categoría no encontrada" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/:id", categoriaController.obtenerCategoriaPorId);

/**
 * @swagger
 * /api/categorias-productos:
 *   post:
 *     summary: Crear categoría de producto
 *     description: |
 *       Crea una nueva categoría de producto.
 *       - Requiere autenticación (JWT)
 *       - Requiere rol **ADMINISTRADOR**
 *
 *       Validaciones:
 *       - `nombre` es obligatorio
 *       - `nombre` debe ser único (retorna 409 si ya existe)
 *     tags: [CategoriasProductos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CategoriaProductoCreateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 nombre: "BEBIDAS"
 *                 descripcion: "Gaseosas, jugos y bebidas energéticas"
 *                 activo: true
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CategoriaProductoResponse"
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
 *       409:
 *         description: Conflicto (nombre duplicado)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               duplicada:
 *                 value: { mensaje: "Ya existe una categoría con ese nombre" }
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
  categoriaController.crearCategoria
);

/**
 * @swagger
 * /api/categorias-productos/{id}:
 *   patch:
 *     summary: Actualizar categoría de producto
 *     description: |
 *       Actualiza campos de una categoría existente.
 *       - Requiere autenticación (JWT)
 *       - Requiere rol **ADMINISTRADOR**
 *
 *       Validaciones:
 *       - Si se cambia `nombre`, debe seguir siendo único (retorna 409 si ya existe)
 *     tags: [CategoriasProductos]
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
 *             $ref: "#/components/schemas/CategoriaProductoUpdateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 descripcion: "Alimentos de consumo humano (actualizado)"
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
 *                   example: "Categoría actualizada correctamente"
 *                 categoria:
 *                   $ref: "#/components/schemas/CategoriaProducto"
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
 *                 value: { mensaje: "Categoría no encontrada" }
 *       409:
 *         description: Conflicto (nombre duplicado)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               duplicada:
 *                 value: { mensaje: "Ya existe una categoría con ese nombre" }
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
  categoriaController.actualizarCategoria
);

module.exports = router;

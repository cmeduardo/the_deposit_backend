const express = require("express");
const router = express.Router();

const categoriaGastoController = require("../controllers/categoria_gasto.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: CategoriasGastos
 *   description: Gestión de categorías de gastos
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
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         tipo_por_defecto:
 *           type: string
 *           enum: [FIJO, VARIABLE]
 *         activo:
 *           type: boolean
 */

/**
 * @swagger
 * /api/categorias-gastos:
 *   get:
 *     summary: Listar categorías de gastos
 *     tags: [CategoriasGastos]
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de categorías
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
 *     tags: [CategoriasGastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: No encontrada
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
 *     tags: [CategoriasGastos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaGasto'
 *     responses:
 *       201:
 *         description: Categoría creada
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
 *     tags: [CategoriasGastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaGasto'
 *     responses:
 *       200:
 *         description: Categoría actualizada
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  categoriaGastoController.actualizarCategoriaGasto
);

module.exports = router;

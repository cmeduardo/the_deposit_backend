const express = require("express");
const router = express.Router();

const categoriaController = require("../controllers/categoria_producto.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: CategoríasProductos
 *   description: Gestión de categorías de productos
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
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         activo:
 *           type: boolean
 */

/**
 * @swagger
 * /api/categorias-productos:
 *   get:
 *     summary: Listar categorías de productos
 *     tags: [CategoríasProductos]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get("/", categoriaController.listarCategorias);

/**
 * @swagger
 * /api/categorias-productos/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     tags: [CategoríasProductos]
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
router.get("/:id", categoriaController.obtenerCategoriaPorId);

/**
 * @swagger
 * /api/categorias-productos:
 *   post:
 *     summary: Crear categoría
 *     tags: [CategoríasProductos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Categoría creada
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
 *     summary: Actualizar categoría
 *     tags: [CategoríasProductos]
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
 *             $ref: '#/components/schemas/CategoriaProducto'
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       404:
 *         description: No encontrada
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  categoriaController.actualizarCategoria
);

module.exports = router;

const express = require("express");
const router = express.Router();
const catalogoController = require("../controllers/catalogo.controller");

/**
 * @swagger
 * tags:
 *   name: Catalogo
 *   description: Catálogo público de productos para la tienda en línea
 */

/**
 * @swagger
 * /api/catalogo/productos:
 *   get:
 *     summary: Listar productos para la tienda en línea
 *     tags: [Catalogo]
 *     parameters:
 *       - in: query
 *         name: texto
 *         schema:
 *           type: string
 *         description: Buscar por nombre, descripción o marca
 *       - in: query
 *         name: id_categoria
 *         schema:
 *           type: integer
 *       - in: query
 *         name: es_perecedero
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de productos con sus presentaciones activas
 */
router.get("/productos", catalogoController.listarProductosCatalogo);

/**
 * @swagger
 * /api/catalogo/presentaciones/{id}:
 *   get:
 *     summary: Obtener detalle de una presentación de producto
 *     tags: [Catalogo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Presentación encontrada
 *       404:
 *         description: No encontrada
 */
router.get(
  "/presentaciones/:id",
  catalogoController.obtenerPresentacionCatalogo
);

module.exports = router;

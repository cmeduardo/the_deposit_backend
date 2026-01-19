const express = require("express");
const router = express.Router();
const catalogoController = require("../controllers/catalogo.controller");

/**
 * @swagger
 * tags:
 *   name: Catalogo
 *   description: Catálogo público de productos para la tienda en línea (sin autenticación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CatalogoCategoria:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "BEBIDAS"
 *
 *     CatalogoPresentacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         id_producto:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Fardo x24"
 *         url_imagen:
 *           type: string
 *           nullable: true
 *           example: "https://cdn.midominio.com/presentaciones/coca-fardo24.png"
 *         codigo_barras:
 *           type: string
 *           nullable: true
 *           example: "1234567890123"
 *         id_unidad_venta:
 *           type: integer
 *           example: 2
 *         unidades_por_unidad_venta:
 *           type: integer
 *           example: 24
 *         precio_venta_por_defecto:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 150.00
 *         precio_minimo:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 140.00
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     CatalogoProducto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Coca Cola 600ml"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Bebida gaseosa 600ml"
 *         marca:
 *           type: string
 *           nullable: true
 *           example: "Coca Cola"
 *         url_imagen:
 *           type: string
 *           nullable: true
 *           example: "https://cdn.midominio.com/productos/coca600.png"
 *         es_perecedero:
 *           type: boolean
 *           example: false
 *         stock_minimo:
 *           type: integer
 *           example: 10
 *         activo:
 *           type: boolean
 *           example: true
 *         categoria:
 *           $ref: "#/components/schemas/CatalogoCategoria"
 *         presentaciones:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/CatalogoPresentacion"
 *
 *     ErrorRespuesta:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Error interno del servidor"
 */

/**
 * @swagger
 * /api/catalogo/productos:
 *   get:
 *     summary: Listar productos públicos para la tienda en línea
 *     tags: [Catalogo]
 *     security: []   # <- IMPORTANTE (no JWT)
 *     parameters:
 *       - in: query
 *         name: texto
 *         schema:
 *           type: string
 *         description: Buscar por nombre, descripción o marca (ILIKE)
 *         example: "coca"
 *       - in: query
 *         name: id_categoria
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *         example: 1
 *       - in: query
 *         name: es_perecedero
 *         schema:
 *           type: boolean
 *         description: Filtrar por perecederos
 *         example: false
 *     responses:
 *       200:
 *         description: Lista de productos activos con presentaciones activas y su categoría (si aplica)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/CatalogoProducto"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorRespuesta"
 */
router.get("/productos", catalogoController.listarProductosCatalogo);

/**
 * @swagger
 * /api/catalogo/presentaciones/{id}:
 *   get:
 *     summary: Obtener detalle público de una presentación por ID
 *     tags: [Catalogo]
 *     security: []   # <- IMPORTANTE (no JWT)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Presentación activa encontrada con su producto y categoría
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/CatalogoPresentacion"
 *                 - type: object
 *                   properties:
 *                     producto:
 *                       allOf:
 *                         - $ref: "#/components/schemas/CatalogoProducto"
 *       404:
 *         description: Presentación no encontrada o inactiva
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorRespuesta"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorRespuesta"
 */
router.get("/presentaciones/:id", catalogoController.obtenerPresentacionCatalogo);

module.exports = router;

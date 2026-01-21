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
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Error interno del servidor"
 *
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
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Gaseosas, jugos y bebidas energéticas"
 *
 *     CatalogoPresentacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *           description: "Este ID es el `id_presentacion_producto` que se usa para agregar al carrito."
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
 *           type: string
 *           nullable: true
 *           example: "150.00"
 *         precio_minimo:
 *           type: string
 *           nullable: true
 *           example: "140.00"
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     CatalogoProductoCard:
 *       type: object
 *       description: "Producto para listado tipo cards (liviano: NO incluye presentaciones)."
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
 *         stock_minimo:
 *           type: integer
 *           example: 10
 *         categoria:
 *           $ref: "#/components/schemas/CatalogoCategoria"
 *         precio_desde:
 *           type: string
 *           nullable: true
 *           example: "6.50"
 *           description: "Precio mínimo entre presentaciones activas (COALESCE(precio_defecto, precio_minimo))."
 *         precio_hasta:
 *           type: string
 *           nullable: true
 *           example: "150.00"
 *           description: "Precio máximo entre presentaciones activas (COALESCE(precio_defecto, precio_minimo))."
 *         tiene_precio:
 *           type: boolean
 *           example: true
 *
 *     CatalogoProductoDetalle:
 *       type: object
 *       description: "Producto para página de detalle (incluye presentaciones activas)."
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
 *         stock_minimo:
 *           type: integer
 *           example: 10
 *         categoria:
 *           $ref: "#/components/schemas/CatalogoCategoria"
 *         presentaciones:
 *           type: array
 *           description: "Presentaciones activas (variantes/SKUs). Usa `presentaciones[].id` para agregar al carrito."
 *           items:
 *             $ref: "#/components/schemas/CatalogoPresentacion"
 *
 *     CatalogoProductosResponse:
 *       type: object
 *       properties:
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 20
 *             total:
 *               type: integer
 *               example: 125
 *             total_pages:
 *               type: integer
 *               example: 7
 *             sort:
 *               type: string
 *               example: "nombre"
 *             order:
 *               type: string
 *               example: "asc"
 *             filtros:
 *               type: object
 *               additionalProperties: true
 *         data:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/CatalogoProductoCard"
 */

/**
 * @swagger
 * /api/catalogo/productos:
 *   get:
 *     summary: Listar productos del catálogo (cards por producto)
 *     description: |
 *       Lista productos **activos** del catálogo en formato **card** (respuesta liviana).
 *
 *       Incluye:
 *       - `precio_desde` / `precio_hasta` (calculados desde presentaciones activas)
 *       - `categoria`
 *
 *       No incluye `presentaciones` para ahorrar recursos.
 *       Para variantes usa: `GET /api/catalogo/productos/{id}`.
 *     tags: [Catalogo]
 *     security: []
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
 *         name: marca
 *         schema:
 *           type: string
 *         description: Filtrar por marca (ILIKE)
 *         example: "Coca"
 *       - in: query
 *         name: precio_min
 *         schema:
 *           type: number
 *         description: Precio mínimo (según COALESCE(precio_defecto, precio_minimo))
 *         example: 5
 *       - in: query
 *         name: precio_max
 *         schema:
 *           type: number
 *         description: Precio máximo
 *         example: 200
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Tamaño de página (máx 100)
 *         example: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [nombre, precio]
 *           default: nombre
 *         description: Ordenar por nombre o por precio (precio_desde)
 *         example: "precio"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Dirección del ordenamiento
 *         example: "asc"
 *     responses:
 *       200:
 *         description: Lista paginada de productos (cards)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CatalogoProductosResponse"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/productos", catalogoController.listarProductosCatalogo);

/**
 * @swagger
 * /api/catalogo/productos/{id}:
 *   get:
 *     summary: Obtener detalle público de un producto por ID (página de producto)
 *     description: |
 *       Devuelve un producto **activo** con:
 *       - `categoria` (si aplica y está activa)
 *       - `presentaciones` **activas** (variantes/SKUs)
 *
 *       **Relación con carrito:**
 *       - Usa `presentaciones[].id` como `id_presentacion_producto` en `POST /api/carrito/items`.
 *     tags: [Catalogo]
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
 *         description: Producto encontrado con presentaciones activas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CatalogoProductoDetalle"
 *       404:
 *         description: Producto no encontrado o inactivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Producto no encontrado" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/productos/:id", catalogoController.obtenerProductoCatalogoPorId);

/**
 * @swagger
 * /api/catalogo/presentaciones/{id}:
 *   get:
 *     summary: Obtener detalle público de una presentación por ID
 *     description: |
 *       Devuelve una presentación **activa** con su producto **activo** y categoría (si aplica).
 *     tags: [Catalogo]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Presentación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/CatalogoPresentacion"
 *                 - type: object
 *                   properties:
 *                     producto:
 *                       $ref: "#/components/schemas/CatalogoProductoDetalle"
 *       404:
 *         description: Presentación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Presentación no encontrada" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/presentaciones/:id", catalogoController.obtenerPresentacionCatalogo);

module.exports = router;

// app/routes/kpi.routes.js
const express = require("express");
const router = express.Router();

const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");
const kpi = require("../controllers/kpi.controller.js");

/**
 * @swagger
 * components:
 *   schemas:
 *     KpiRangoFechas:
 *       type: object
 *       properties:
 *         fecha_desde:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2026-01-01"
 *         fecha_hasta:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2026-01-31"
 *
 *     KpiResumenFinanciero:
 *       type: object
 *       properties:
 *         total_ventas:
 *           type: number
 *           example: 1500.25
 *         total_gastos:
 *           type: number
 *           example: 650.0
 *         total_cobros_clientes:
 *           type: number
 *           example: 1200.0
 *         utilidad_neta_estimada:
 *           type: number
 *           example: 850.25
 *         margen_sobre_ventas:
 *           type: number
 *           description: "Ratio (0 a 1). Ej: 0.25 = 25%"
 *           example: 0.5667
 *         cuentas_por_cobrar_estimadas:
 *           type: number
 *           example: 300.25
 *
 *     KpiResumenFinancieroResponse:
 *       type: object
 *       properties:
 *         rango_fechas:
 *           $ref: "#/components/schemas/KpiRangoFechas"
 *         resumen:
 *           $ref: "#/components/schemas/KpiResumenFinanciero"
 *
 *     KpiVentasDiariasRow:
 *       type: object
 *       properties:
 *         fecha:
 *           type: string
 *           format: date
 *           example: "2026-01-15"
 *         total_ventas:
 *           type: string
 *           description: Puede venir como string por agregación SQL/Sequelize
 *           example: "450.00"
 *         cantidad_ventas:
 *           type: string
 *           description: Puede venir como string por agregación SQL/Sequelize
 *           example: "7"
 *
 *     KpiVentasPorCategoriaRow:
 *       type: object
 *       properties:
 *         id_categoria:
 *           type: integer
 *           example: 3
 *         nombre_categoria:
 *           type: string
 *           example: "BEBIDAS"
 *         total_ventas:
 *           type: string
 *           example: "980.50"
 *         unidades_vendidas:
 *           type: string
 *           example: "120"
 *
 *     KpiTopProductoRow:
 *       type: object
 *       properties:
 *         id_producto:
 *           type: integer
 *           example: 10
 *         nombre_producto:
 *           type: string
 *           example: "Coca Cola 600ml"
 *         total_ventas:
 *           type: string
 *           example: "750.00"
 *         unidades_vendidas_base:
 *           type: string
 *           example: "200"
 *
 *     UnidadBaseResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         codigo:
 *           type: string
 *           example: "UND"
 *         nombre:
 *           type: string
 *           example: "Unidad"
 *
 *     CategoriaResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "ALIMENTOS"
 *
 *     KpiBajoMinimoRow:
 *       type: object
 *       properties:
 *         id_producto:
 *           type: integer
 *           example: 1
 *         nombre_producto:
 *           type: string
 *           example: "Coca Cola 600ml"
 *         categoria:
 *           $ref: "#/components/schemas/CategoriaResumen"
 *         unidad_base:
 *           $ref: "#/components/schemas/UnidadBaseResumen"
 *         stock_disponible:
 *           type: number
 *           example: 5
 *         stock_reservado:
 *           type: number
 *           example: 2
 *         stock_total:
 *           type: number
 *           example: 7
 *         stock_minimo:
 *           type: number
 *           example: 10
 *         es_perecedero:
 *           type: boolean
 *           example: false
 *         bajo_minimo:
 *           type: boolean
 *           example: true
 *
 *     KpiGastosPorCategoriaRow:
 *       type: object
 *       properties:
 *         id_categoria_gasto:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         total_gasto:
 *           type: string
 *           example: "450.00"
 *         categoria_gasto:
 *           type: object
 *           nullable: true
 *           properties:
 *             nombre:
 *               type: string
 *               example: "SERVICIOS"
 *
 *     KpiRotacionProducto:
 *       type: object
 *       properties:
 *         id_producto:
 *           type: integer
 *           example: 1
 *         nombre_producto:
 *           type: string
 *           example: "Coca Cola 600ml"
 *         unidades_vendidas_base:
 *           type: number
 *           example: 120
 *         ventas_totales:
 *           type: number
 *           example: 900.5
 *         stock_disponible:
 *           type: number
 *           example: 30
 *         stock_reservado:
 *           type: number
 *           example: 5
 *         stock_total:
 *           type: number
 *           example: 35
 *         dias_periodo:
 *           type: integer
 *           example: 30
 *         indice_rotacion:
 *           type: number
 *           nullable: true
 *           description: unidades_vendidas_base / stock_total (si stock_total=0 => null)
 *           example: 3.42
 *
 *     KpiRotacionResponse:
 *       type: object
 *       properties:
 *         desde:
 *           type: string
 *           format: date
 *           example: "2025-12-22"
 *         hasta:
 *           type: string
 *           format: date
 *           example: "2026-01-21"
 *         dias_periodo:
 *           type: integer
 *           example: 30
 *         productos:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/KpiRotacionProducto"
 */

/**
 * @swagger
 * /api/kpi/resumen-financiero:
 *   get:
 *     summary: Resumen financiero (ventas, gastos, cobros, utilidad)
 *     description: |
 *       Calcula:
 *       - Total de ventas (sum(total_general))
 *       - Total de gastos (sum(monto))
 *       - Total cobrado a clientes (sum(monto))
 *       - Utilidad neta estimada = ventas - gastos
 *       - Margen sobre ventas = utilidad / ventas (0..1)
 *       - Cuentas por cobrar estimadas = ventas - cobros
 *
 *       **Nota:** el mismo rango se aplica a:
 *       - ventas: `fecha_venta`
 *       - gastos: `fecha_gasto`
 *       - cobros: `fecha_cobro`
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/FechaDesdeQuery"
 *       - $ref: "#/components/parameters/FechaHastaQuery"
 *     responses:
 *       200:
 *         description: Resumen financiero calculado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/KpiResumenFinancieroResponse"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get(
  "/resumen-financiero",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR")],
  kpi.obtenerResumenFinanciero
);

/**
 * @swagger
 * /api/kpi/ventas-diarias:
 *   get:
 *     summary: Ventas agregadas por día
 *     description: |
 *       Agrupa ventas por `DATE(fecha_venta)` y retorna:
 *       - `total_ventas`
 *       - `cantidad_ventas`
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/FechaDesdeQuery"
 *       - $ref: "#/components/parameters/FechaHastaQuery"
 *     responses:
 *       200:
 *         description: Serie de tiempo de ventas diarias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/KpiVentasDiariasRow"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get(
  "/ventas-diarias",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR", "VENDEDOR")],
  kpi.obtenerVentasDiarias
);

/**
 * @swagger
 * /api/kpi/ventas-por-categoria:
 *   get:
 *     summary: Ventas agregadas por categoría de producto
 *     description: |
 *       Agrega desde `detalles_ventas`:
 *       - total_ventas = SUM(subtotal_linea)
 *       - unidades_vendidas = SUM(cantidad_unidad_venta)
 *
 *       Asociación:
 *       detalle -> presentacion -> producto -> categoria
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/FechaDesdeQuery"
 *       - $ref: "#/components/parameters/FechaHastaQuery"
 *     responses:
 *       200:
 *         description: Totales por categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/KpiVentasPorCategoriaRow"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get(
  "/ventas-por-categoria",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR", "VENDEDOR")],
  kpi.obtenerVentasPorCategoria
);

/**
 * @swagger
 * /api/kpi/top-productos:
 *   get:
 *     summary: Top productos más vendidos (Q y unidades base)
 *     description: |
 *       Top N productos por:
 *       - total_ventas = SUM(subtotal_linea)
 *       - unidades_vendidas_base = SUM(cantidad_unidad_base)
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/FechaDesdeQuery"
 *       - $ref: "#/components/parameters/FechaHastaQuery"
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Cantidad de productos a devolver (por defecto 10)
 *         example: 10
 *     responses:
 *       200:
 *         description: Lista de productos ordenada por ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/KpiTopProductoRow"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get(
  "/top-productos",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR", "VENDEDOR")],
  kpi.obtenerTopProductos
);

/**
 * @swagger
 * /api/kpi/inventario-bajo-minimo:
 *   get:
 *     summary: Productos cuyo stock disponible está por debajo o igual al mínimo
 *     description: |
 *       Agrega inventarios_saldos por producto:
 *       - stock_disponible = SUM(cantidad_disponible)
 *       - stock_reservado = SUM(cantidad_reservada)
 *       - stock_total = disponible + reservado
 *
 *       Devuelve solo los productos con `stock_disponible <= stock_minimo`.
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos bajo mínimo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/KpiBajoMinimoRow"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get(
  "/inventario-bajo-minimo",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR", "VENDEDOR")],
  kpi.obtenerProductosBajoMinimo
);

/**
 * @swagger
 * /api/kpi/gastos-por-categoria:
 *   get:
 *     summary: Gastos agregados por categoría
 *     description: |
 *       Agrega gastos por `id_categoria_gasto` sumando `monto`.
 *       Puede haber gastos sin categoría (`id_categoria_gasto = null`).
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/FechaDesdeQuery"
 *       - $ref: "#/components/parameters/FechaHastaQuery"
 *     responses:
 *       200:
 *         description: Totales por categoría de gasto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/KpiGastosPorCategoriaRow"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get(
  "/gastos-por-categoria",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR")],
  kpi.obtenerGastosPorCategoria
);

/**
 * @swagger
 * /api/kpi/rotacion-inventario:
 *   get:
 *     summary: Rotación de inventario por producto (ventas del periodo vs stock actual)
 *     description: |
 *       Calcula la rotación por producto usando:
 *       - Ventas del periodo (SUM(cantidad_unidad_base))
 *       - Stock actual (SUM inventarios_saldos)
 *
 *       Parámetro:
 *       - `dias` (default 30): periodo hacia atrás desde "hoy" del servidor
 *
 *       Cálculo:
 *       - `indice_rotacion = unidades_vendidas_base / stock_total`
 *       - si `stock_total = 0` => `indice_rotacion = null`
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 1
 *           maximum: 3650
 *         description: Días hacia atrás para calcular el periodo (por defecto 30)
 *         example: 30
 *     responses:
 *       200:
 *         description: Rotación por producto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/KpiRotacionResponse"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get(
  "/rotacion-inventario",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR", "VENDEDOR")],
  kpi.obtenerRotacionInventario
);

module.exports = router;

// app/routes/kpi.routes.js
const express = require("express");
const router = express.Router();

const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");
const kpi = require("../controllers/kpi.controller.js");

/**
 * @swagger
 * tags:
 *   name: KPI
 *   description: Endpoints de indicadores clave del depósito
 */

/**
 * @swagger
 * /api/kpi/resumen-financiero:
 *   get:
 *     summary: Obtiene un resumen financiero general (ventas, gastos, cobros, utilidad)
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Resumen financiero calculado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo ADMIN)
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
 *     summary: Devuelve las ventas agregadas por día
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de ventas diarias
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
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de categorías con total vendido
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
 *     summary: Top productos más vendidos en Q y unidades
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de productos ordenada por ventas
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
 *     summary: Lista productos cuyo stock está por debajo del mínimo
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos bajo mínimo
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
 *     summary: Agrupa los gastos por categoría
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de categorías de gasto con totales
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
 *     summary: Calcula la rotación de inventario por producto en un periodo
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Días hacia atrás para calcular la rotación
 *     responses:
 *       200:
 *         description: Lista de productos con info de rotación
 */
router.get(
  "/rotacion-inventario",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR", "VENDEDOR")],
  kpi.obtenerRotacionInventario
);

module.exports = router;

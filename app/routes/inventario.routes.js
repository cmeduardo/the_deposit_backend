// app/routes/inventario.routes.js
const express = require("express");
const router = express.Router();

const inventarioController = require("../controllers/inventario.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Inventario
 *   description: Consulta y ajustes de inventario
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
 *     ProductoResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Coca Cola 600ml"
 *
 *     UbicacionResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         nombre:
 *           type: string
 *           example: "Bodega Central"
 *         tipo:
 *           type: string
 *           nullable: true
 *           example: "BODEGA"
 *
 *     MovimientoInventario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 100
 *         id_producto:
 *           type: integer
 *           example: 1
 *         id_ubicacion:
 *           type: integer
 *           example: 2
 *         tipo_movimiento:
 *           type: string
 *           example: "AJUSTE"
 *         cantidad:
 *           type: integer
 *           example: -5
 *         referencia_tipo:
 *           type: string
 *           nullable: true
 *           example: "AJUSTE_MANUAL"
 *         id_referencia:
 *           type: integer
 *           nullable: true
 *           example: null
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Conteo físico"
 *
 *     InventarioSaldo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         id_producto:
 *           type: integer
 *           example: 1
 *         id_ubicacion:
 *           type: integer
 *           example: 2
 *         cantidad_disponible:
 *           type: integer
 *           example: 120
 *         cantidad_reservada:
 *           type: integer
 *           example: 10
 *
 *     InventarioSaldoConRelaciones:
 *       allOf:
 *         - $ref: "#/components/schemas/InventarioSaldo"
 *         - type: object
 *           properties:
 *             producto:
 *               $ref: "#/components/schemas/ProductoResumen"
 *             ubicacion:
 *               $ref: "#/components/schemas/UbicacionResumen"
 *
 *     InventarioAjusteInput:
 *       type: object
 *       required: [id_producto, id_ubicacion, cantidad]
 *       properties:
 *         id_producto:
 *           type: integer
 *           example: 1
 *         id_ubicacion:
 *           type: integer
 *           example: 2
 *         cantidad:
 *           type: integer
 *           description: Positivo suma, negativo resta
 *           example: -5
 *         motivo:
 *           type: string
 *           nullable: true
 *           example: "Conteo físico"
 *
 *     InventarioAjusteResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Inventario ajustado correctamente"
 *         saldo:
 *           $ref: "#/components/schemas/InventarioSaldo"
 *         movimiento:
 *           $ref: "#/components/schemas/MovimientoInventario"
 */

/**
 * @swagger
 * /api/inventario:
 *   get:
 *     summary: Listar saldos de inventario
 *     description: |
 *       Devuelve saldos de inventario con relaciones de:
 *       - `producto` (id, nombre)
 *       - `ubicacion` (id, nombre, tipo)
 *
 *       Filtros opcionales: `id_producto`, `id_ubicacion`.
 *
 *       Nota: en tu router actual **no hay autenticación** para este GET.
 *       Si deseas que sea privado, agrega `autenticacionMiddleware` y roles.
 *     tags: [Inventario]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: id_producto
 *         schema:
 *           type: integer
 *         description: Filtrar por producto
 *         example: 1
 *       - in: query
 *         name: id_ubicacion
 *         schema:
 *           type: integer
 *         description: Filtrar por ubicación
 *         example: 2
 *     responses:
 *       200:
 *         description: Lista de saldos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/InventarioSaldoConRelaciones"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/", inventarioController.listarSaldos);

/**
 * @swagger
 * /api/inventario/ajuste:
 *   post:
 *     summary: Realizar un ajuste manual de inventario
 *     description: |
 *       Ajusta `cantidad_disponible` sumando/restando `cantidad`.
 *
 *       Reglas del controller:
 *       - Obligatorios: `id_producto`, `id_ubicacion`, `cantidad`
 *       - Valida existencia de producto y ubicación
 *       - Si no existe saldo, lo crea con 0/0 y luego aplica el ajuste
 *       - Crea un movimiento con `tipo_movimiento = "AJUSTE"` y `referencia_tipo = "AJUSTE_MANUAL"`
 *
 *       Roles: **ADMINISTRADOR**
 *
 *       ⚠️ Nota de “blindaje”: tu controller permite que el saldo quede negativo si `cantidad` es negativa.
 *       Si no quieres negativos, valida antes y devuelve 400.
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/InventarioAjusteInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 id_producto: 1
 *                 id_ubicacion: 2
 *                 cantidad: -5
 *                 motivo: "Conteo físico"
 *     responses:
 *       201:
 *         description: Ajuste realizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InventarioAjusteResponse"
 *       400:
 *         description: Validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltanCampos:
 *                 value: { mensaje: "id_producto, id_ubicacion y cantidad son obligatorios" }
 *               productoNoExiste:
 *                 value: { mensaje: "El producto no existe" }
 *               ubicacionNoExiste:
 *                 value: { mensaje: "La ubicación no existe" }
 *       401:
 *         description: No autenticado / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Sin permisos (solo ADMINISTRADOR)
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
  "/ajuste",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  inventarioController.ajustarInventario
);

module.exports = router;

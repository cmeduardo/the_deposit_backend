const express = require("express");
const router = express.Router();

const compraController = require("../controllers/compra.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Compras
 *   description: Registro de compras y actualización de inventario (ADMINISTRADOR / VENDEDOR)
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
 *     ProveedorResumen:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 3
 *         nombre:
 *           type: string
 *           example: "Distribuidora El Proveedor, S.A."
 *
 *     UbicacionResumen:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Bodega Central"
 *         tipo:
 *           type: string
 *           example: "BODEGA"
 *
 *     ProductoResumen:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         nombre:
 *           type: string
 *           example: "Coca Cola 600ml"
 *
 *     PresentacionResumenCompra:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 25
 *         id_producto:
 *           type: integer
 *           example: 10
 *         nombre:
 *           type: string
 *           example: "Fardo x24"
 *         unidades_por_unidad_venta:
 *           type: integer
 *           example: 24
 *         producto:
 *           $ref: "#/components/schemas/ProductoResumen"
 *
 *     DetalleCompra:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 101
 *         id_compra:
 *           type: integer
 *           example: 50
 *         id_presentacion_producto:
 *           type: integer
 *           example: 25
 *         cantidad_unidad_venta:
 *           type: integer
 *           example: 5
 *         cantidad_unidad_base:
 *           type: number
 *           example: 120
 *           description: "cantidad_unidad_venta * unidades_por_unidad_venta"
 *         costo_unitario_unidad_venta:
 *           type: string
 *           example: "140.00"
 *         costo_unitario_unidad_base:
 *           type: string
 *           example: "5.833333"
 *           description: "costo_unitario_unidad_venta / unidades_por_unidad_venta"
 *         precio_referencia:
 *           type: string
 *           nullable: true
 *           example: "150.00"
 *         precio_competencia:
 *           type: string
 *           nullable: true
 *           example: "145.00"
 *         fecha_vencimiento:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2026-06-30"
 *         presentacion:
 *           $ref: "#/components/schemas/PresentacionResumenCompra"
 *
 *     Compra:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 50
 *         id_proveedor:
 *           type: integer
 *           example: 3
 *         id_ubicacion:
 *           type: integer
 *           example: 1
 *         fecha_compra:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         numero_documento:
 *           type: string
 *           nullable: true
 *           example: "FAC-001-12345"
 *         subtotal:
 *           type: string
 *           example: "700.00"
 *         impuestos:
 *           type: string
 *           example: "0.00"
 *         costos_adicionales:
 *           type: string
 *           example: "25.00"
 *         total:
 *           type: string
 *           example: "725.00"
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Compra de reposición"
 *         proveedor:
 *           $ref: "#/components/schemas/ProveedorResumen"
 *         ubicacion:
 *           $ref: "#/components/schemas/UbicacionResumen"
 *         detalles:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/DetalleCompra"
 *
 *     DetalleCompraInput:
 *       type: object
 *       required:
 *         - id_presentacion_producto
 *         - cantidad_unidad_venta
 *         - costo_unitario_unidad_venta
 *       properties:
 *         id_presentacion_producto:
 *           type: integer
 *           example: 25
 *         cantidad_unidad_venta:
 *           type: integer
 *           example: 5
 *         costo_unitario_unidad_venta:
 *           type: number
 *           format: float
 *           example: 140
 *         precio_referencia:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 150
 *         precio_competencia:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 145
 *         fecha_vencimiento:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2026-06-30"
 *
 *     CompraInput:
 *       type: object
 *       required:
 *         - id_proveedor
 *         - id_ubicacion
 *         - fecha_compra
 *         - detalles
 *       properties:
 *         id_proveedor:
 *           type: integer
 *           example: 3
 *         id_ubicacion:
 *           type: integer
 *           example: 1
 *         fecha_compra:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         numero_documento:
 *           type: string
 *           nullable: true
 *           example: "FAC-001-12345"
 *         costos_adicionales:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 25
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Compra de reposición"
 *         detalles:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: "#/components/schemas/DetalleCompraInput"
 *
 *     CompraResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Compra creada correctamente"
 *         compra:
 *           $ref: "#/components/schemas/Compra"
 */

/**
 * @swagger
 * /api/compras:
 *   get:
 *     summary: Listar compras
 *     description: |
 *       Lista compras registradas con proveedor y ubicación.
 *       - Requiere autenticación (JWT)
 *       - Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de compras
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Compra"
 *       401:
 *         description: No autenticado / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Sin permisos
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
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  compraController.listarCompras
);

/**
 * @swagger
 * /api/compras/{id}:
 *   get:
 *     summary: Obtener compra por ID (con detalles)
 *     description: |
 *       Devuelve una compra con:
 *       - proveedor
 *       - ubicación
 *       - detalles (con presentación y producto resumido)
 *       - totales (subtotal, costos_adicionales, total)
 *
 *       - Requiere autenticación (JWT)
 *       - Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 50
 *     responses:
 *       200:
 *         description: Compra encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Compra"
 *       401:
 *         description: No autenticado / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Sin permisos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: Compra no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Compra no encontrada" }
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
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  compraController.obtenerCompraPorId
);

/**
 * @swagger
 * /api/compras:
 *   post:
 *     summary: Registrar una compra y actualizar inventario
 *     description: |
 *       Registra una compra y actualiza inventario en la ubicación indicada.
 *
 *       Operación transaccional:
 *       - valida proveedor y ubicación
 *       - crea compra
 *       - crea detalles
 *       - suma existencias al inventario (cantidad_unidad_base)
 *       - registra movimientos de inventario tipo **COMPRA**
 *       - recalcula totales (subtotal + costos adicionales)
 *
 *       Reglas:
 *       - `detalles` debe ser un arreglo no vacío
 *       - cada detalle requiere `id_presentacion_producto`, `cantidad_unidad_venta`, `costo_unitario_unidad_venta`
 *
 *       - Requiere autenticación (JWT)
 *       - Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CompraInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 id_proveedor: 3
 *                 id_ubicacion: 1
 *                 fecha_compra: "2026-01-20"
 *                 numero_documento: "FAC-001-12345"
 *                 costos_adicionales: 25
 *                 notas: "Compra de reposición"
 *                 detalles:
 *                   - id_presentacion_producto: 25
 *                     cantidad_unidad_venta: 5
 *                     costo_unitario_unidad_venta: 140
 *                     precio_referencia: 150
 *                     precio_competencia: 145
 *                     fecha_vencimiento: "2026-06-30"
 *     responses:
 *       201:
 *         description: Compra creada y devolviendo compra completa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CompraResponse"
 *       400:
 *         description: Validación fallida (faltan datos, proveedor/ubicación no existe, presentación no existe, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltanDatos:
 *                 value:
 *                   mensaje: "id_proveedor, id_ubicacion, fecha_compra y detalles (no vacío) son obligatorios"
 *               proveedorNoExiste:
 *                 value: { mensaje: "El proveedor no existe" }
 *               ubicacionNoExiste:
 *                 value: { mensaje: "La ubicación no existe" }
 *               detalleInvalido:
 *                 value:
 *                   mensaje: "Cada detalle debe incluir id_presentacion_producto, cantidad_unidad_venta y costo_unitario_unidad_venta"
 *               presentacionNoExiste:
 *                 value: { mensaje: "La presentación 999 no existe" }
 *       401:
 *         description: No autenticado / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Sin permisos
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
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  compraController.crearCompra
);

module.exports = router;

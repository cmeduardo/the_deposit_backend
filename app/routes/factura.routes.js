// app/routes/factura.routes.js
const express = require("express");
const router = express.Router();

const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");
const facturaController = require("../controllers/factura.controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         nombre:
 *           type: string
 *           example: "Coca Cola 600ml"
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: "Bebida gaseosa"
 *         url_imagen:
 *           type: string
 *           nullable: true
 *           example: "https://..."
 *         marca:
 *           type: string
 *           nullable: true
 *           example: "Coca Cola"
 *         id_categoria:
 *           type: integer
 *           nullable: true
 *           example: 3
 *         id_unidad_base:
 *           type: integer
 *           example: 1
 *         es_perecedero:
 *           type: boolean
 *           example: false
 *         stock_minimo:
 *           type: integer
 *           example: 0
 *         activo:
 *           type: boolean
 *           example: true
 *
 *     PresentacionProducto:
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
 *         url_imagen:
 *           type: string
 *           nullable: true
 *           example: "https://..."
 *         codigo_barras:
 *           type: string
 *           nullable: true
 *           example: "1234567890"
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
 *           example: 150.0
 *         precio_minimo:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 130.0
 *         activo:
 *           type: boolean
 *           example: true
 *         producto:
 *           $ref: "#/components/schemas/Producto"
 *
 *     DetalleVenta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 5001
 *         id_venta:
 *           type: integer
 *           example: 10
 *         id_presentacion_producto:
 *           type: integer
 *           example: 25
 *         cantidad_unidad_venta:
 *           type: integer
 *           example: 5
 *         cantidad_unidad_base:
 *           type: integer
 *           example: 120
 *         precio_unitario_venta:
 *           type: number
 *           format: float
 *           example: 150.0
 *         precio_unitario_base:
 *           type: number
 *           format: float
 *           example: 6.25
 *         es_precio_manual:
 *           type: boolean
 *           example: false
 *         subtotal_linea:
 *           type: number
 *           format: float
 *           example: 750.0
 *         presentacion:
 *           $ref: "#/components/schemas/PresentacionProducto"
 *
 *     Venta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         id_pedido:
 *           type: integer
 *           nullable: true
 *           example: 100
 *         id_usuario_cliente:
 *           type: integer
 *           nullable: true
 *           example: 12
 *         id_ubicacion_salida:
 *           type: integer
 *           example: 1
 *         nombre_cliente:
 *           type: string
 *           nullable: true
 *           example: "Juan Pérez"
 *         fecha_venta:
 *           type: string
 *           format: date
 *           example: "2026-01-19"
 *         subtotal_productos:
 *           type: number
 *           format: float
 *           example: 250.0
 *         impuestos:
 *           type: number
 *           format: float
 *           example: 0
 *         cargo_envio:
 *           type: number
 *           format: float
 *           example: 0
 *         descuento_total:
 *           type: number
 *           format: float
 *           example: 0
 *         total_general:
 *           type: number
 *           format: float
 *           example: 250.0
 *         tipo_pago:
 *           type: string
 *           nullable: true
 *           example: "Contado"
 *         estado_pago:
 *           type: string
 *           enum: [PENDIENTE, PAGADO, PARCIAL]
 *           example: "PAGADO"
 *         estado:
 *           type: string
 *           enum: [REGISTRADA, ANULADA]
 *           example: "REGISTRADA"
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Opcional"
 *         detalles:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/DetalleVenta"
 *
 *     Factura:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_venta:
 *           type: integer
 *           example: 10
 *         serie:
 *           type: string
 *           nullable: true
 *           example: "A"
 *         numero:
 *           type: string
 *           example: "000001"
 *         tipo_documento:
 *           type: string
 *           example: "FACTURA"
 *         fecha_emision:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         nombre_cliente_factura:
 *           type: string
 *           example: "CONSUMIDOR FINAL"
 *         nit_cliente:
 *           type: string
 *           example: "CF"
 *         direccion_cliente:
 *           type: string
 *           nullable: true
 *           example: "Ciudad"
 *         impuestos:
 *           type: number
 *           format: float
 *           example: 0
 *         total_facturado:
 *           type: number
 *           format: float
 *           example: 250.0
 *         estado:
 *           type: string
 *           enum: [EMITIDA, ANULADA]
 *           example: "EMITIDA"
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Opcional"
 *
 *     VentaResumenFactura:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         fecha_venta:
 *           type: string
 *           format: date
 *           example: "2026-01-19"
 *         nombre_cliente:
 *           type: string
 *           nullable: true
 *           example: "Juan Pérez"
 *         total_general:
 *           type: number
 *           format: float
 *           example: 250.0
 *         estado_pago:
 *           type: string
 *           enum: [PENDIENTE, PAGADO, PARCIAL]
 *           example: "PAGADO"
 *
 *     FacturaConVenta:
 *       allOf:
 *         - $ref: "#/components/schemas/Factura"
 *         - type: object
 *           properties:
 *             venta:
 *               $ref: "#/components/schemas/VentaResumenFactura"
 *
 *     FacturaCreateInput:
 *       type: object
 *       required: [id_venta, numero]
 *       properties:
 *         id_venta:
 *           type: integer
 *           example: 10
 *         serie:
 *           type: string
 *           nullable: true
 *           example: "A"
 *         numero:
 *           type: string
 *           example: "000001"
 *         tipo_documento:
 *           type: string
 *           nullable: true
 *           example: "FACTURA"
 *         nombre_cliente_factura:
 *           type: string
 *           nullable: true
 *           example: "Nombre en factura"
 *         nit_cliente:
 *           type: string
 *           nullable: true
 *           example: "CF"
 *         direccion_cliente:
 *           type: string
 *           nullable: true
 *           example: "Dirección..."
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Opcional"
 *
 *     FacturaCreateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Factura emitida correctamente"
 *         factura:
 *           $ref: "#/components/schemas/Factura"
 *
 *     FacturaAnularInput:
 *       type: object
 *       properties:
 *         motivo:
 *           type: string
 *           example: "Error en datos del cliente"
 *
 *     FacturaAnularResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Factura anulada correctamente"
 *         factura:
 *           $ref: "#/components/schemas/Factura"
 *
 *     FacturaDetalleCompleto:
 *       allOf:
 *         - $ref: "#/components/schemas/Factura"
 *         - type: object
 *           properties:
 *             venta:
 *               $ref: "#/components/schemas/Venta"
 */

/**
 * @swagger
 * /api/facturas:
 *   post:
 *     summary: Emitir factura a partir de una venta existente
 *     description: |
 *       Crea una factura para una venta.
 *
 *       Reglas del controller:
 *       - `id_venta` y `numero` son obligatorios.
 *       - Si no existe la venta -> 404.
 *       - Si ya existe una factura para esa venta -> 400 (incluye `id_factura`).
 *       - Defaults:
 *         - `tipo_documento`: "FACTURA"
 *         - `fecha_emision`: fecha del servidor (YYYY-MM-DD)
 *         - `nombre_cliente_factura`: nombre de la venta o "CONSUMIDOR FINAL"
 *         - `nit_cliente`: "CF"
 *         - `impuestos` y `total_facturado`: tomados de la venta
 *
 *       Roles permitidos: **ADMINISTRADOR**
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/FacturaCreateInput"
 *     responses:
 *       201:
 *         description: Factura creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FacturaCreateResponse"
 *       400:
 *         description: Validación o ya existe factura para la venta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltanCampos:
 *                 value: { mensaje: "id_venta y numero son obligatorios para emitir factura" }
 *               yaExiste:
 *                 value: { mensaje: "Ya existe una factura asociada a esta venta", id_factura: 5 }
 *       404:
 *         description: Venta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               ventaNoExiste:
 *                 value: { mensaje: "Venta no encontrada" }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         description: Error interno al emitir la factura
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post(
  "/",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR")],
  facturaController.crearFactura
);

/**
 * @swagger
 * /api/facturas:
 *   get:
 *     summary: Listar facturas con filtros opcionales
 *     description: |
 *       Lista facturas con filtros por:
 *       - rango de fechas (`fecha_emision`)
 *       - `nit_cliente`
 *       - `estado`
 *
 *       Incluye `venta` (resumen).
 *
 *       Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/FechaDesdeQuery"
 *       - $ref: "#/components/parameters/FechaHastaQuery"
 *       - in: query
 *         name: nit
 *         schema:
 *           type: string
 *         description: Filtrar por NIT (ej. CF)
 *         example: "CF"
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [EMITIDA, ANULADA]
 *         description: Filtrar por estado de factura
 *         example: "EMITIDA"
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/FacturaConVenta"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         description: Error interno al listar facturas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get(
  "/",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR", "VENDEDOR")],
  facturaController.listarFacturas
);

/**
 * @swagger
 * /api/facturas/{id}:
 *   get:
 *     summary: Obtener una factura por ID (incluye venta y detalles)
 *     description: |
 *       Devuelve una factura por `id`.
 *       Incluye:
 *       - `venta`
 *       - `venta.detalles`
 *       - `venta.detalles.presentacion`
 *       - `venta.detalles.presentacion.producto`
 *
 *       Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     responses:
 *       200:
 *         description: Factura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FacturaDetalleCompleto"
 *       404:
 *         description: Factura no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Factura no encontrada" }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         description: Error interno al obtener la factura
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get(
  "/:id",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR", "VENDEDOR")],
  facturaController.obtenerFacturaPorId
);

/**
 * @swagger
 * /api/facturas/venta/{id_venta}:
 *   get:
 *     summary: Obtener la factura asociada a una venta
 *     description: |
 *       Devuelve la factura asociada a `id_venta` (si existe).
 *       Incluye `venta`.
 *
 *       Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_venta
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Factura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FacturaConVenta"
 *       404:
 *         description: La venta no tiene factura asociada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               sinFactura:
 *                 value: { mensaje: "No existe factura asociada a esta venta" }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         description: Error interno al obtener factura por venta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get(
  "/venta/:id_venta",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR", "VENDEDOR")],
  facturaController.obtenerFacturaPorVenta
);

/**
 * @swagger
 * /api/facturas/{id}/anular:
 *   post:
 *     summary: Anular una factura
 *     description: |
 *       Marca una factura como **ANULADA**.
 *       - No modifica venta ni inventario (según controller actual).
 *       - Si ya está anulada retorna 400.
 *
 *       Roles permitidos: **ADMINISTRADOR**
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/FacturaAnularInput"
 *           examples:
 *             conMotivo:
 *               value:
 *                 motivo: "Error en datos del cliente"
 *     responses:
 *       200:
 *         description: Factura anulada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FacturaAnularResponse"
 *       400:
 *         description: Ya anulada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               yaAnulada:
 *                 value: { mensaje: "La factura ya está anulada" }
 *       404:
 *         description: Factura no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Factura no encontrada" }
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         description: Error interno al anular la factura
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post(
  "/:id/anular",
  [autenticacionMiddleware, rolMiddleware("ADMINISTRADOR")],
  facturaController.anularFactura
);

module.exports = router;

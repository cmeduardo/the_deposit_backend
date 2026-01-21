// app/routes/factura.routes.js
const express = require("express");
const router = express.Router();

const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");
const facturaController = require("../controllers/factura.controller");

/**
 * @swagger
 * tags:
 *   name: Facturas
 *   description: Módulo de facturación (emisión, consulta y anulación). Requiere autenticación.
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
 *           example: 250.00
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
 *           example: 250.00
 *         estado_pago:
 *           type: string
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
 *     // Nota: para el detalle completo (factura -> venta -> detalles -> presentacion -> producto),
 *     // normalmente reusarías tus schemas existentes (Venta, DetalleVenta, PresentacionProducto, Producto).
 *     // Aquí lo dejamos como objeto para no duplicar todo si ya lo tienes definido en otros archivos.
 *     FacturaDetalleCompleto:
 *       allOf:
 *         - $ref: "#/components/schemas/Factura"
 *         - type: object
 *           properties:
 *             venta:
 *               type: object
 *               description: Incluye detalles de venta, presentación y producto (según tu include del controller)
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
 *           examples:
 *             ejemplo:
 *               value:
 *                 id_venta: 10
 *                 serie: "A"
 *                 numero: "000001"
 *                 tipo_documento: "FACTURA"
 *                 nombre_cliente_factura: "Juan Pérez"
 *                 nit_cliente: "1234567-8"
 *                 direccion_cliente: "Guatemala"
 *                 notas: "Gracias por su compra"
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
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha emisión desde (inclusive)
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha emisión hasta (inclusive)
 *       - in: query
 *         name: nit
 *         schema:
 *           type: string
 *         description: Filtrar por NIT (ej. CF)
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [EMITIDA, ANULADA]
 *         description: Filtrar por estado de factura
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
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

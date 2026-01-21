const express = require("express");
const router = express.Router();

const consignacionController = require("../controllers/consignacion.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Consignaciones
 *   description: Gestión de consignaciones (ADMINISTRADOR / VENDEDOR)
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
 *     UsuarioResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         nombre:
 *           type: string
 *           example: "Juan Pérez"
 *         correo:
 *           type: string
 *           example: "juan@example.com"
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
 *         marca:
 *           type: string
 *           nullable: true
 *           example: "Coca Cola"
 *
 *     PresentacionResumen:
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
 *         precio_venta_por_defecto:
 *           type: string
 *           nullable: true
 *           example: "150.00"
 *         producto:
 *           $ref: "#/components/schemas/ProductoResumen"
 *
 *     DetalleConsignacionInput:
 *       type: object
 *       required:
 *         - id_presentacion_producto
 *         - cantidad_unidad_venta
 *       properties:
 *         id_presentacion_producto:
 *           type: integer
 *           example: 25
 *         cantidad_unidad_venta:
 *           type: number
 *           example: 5
 *           description: "Cantidad en unidad de venta (puede ser decimal si tu negocio lo permite)."
 *         precio_unitario_estimado:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 150
 *           description: "Si no se envía, se usa precio_venta_por_defecto de la presentación (si existe), o 0."
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Dejar en exhibición"
 *
 *     DetalleConsignacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 101
 *         id_consignacion:
 *           type: integer
 *           example: 50
 *         id_presentacion_producto:
 *           type: integer
 *           example: 25
 *         cantidad_unidad_venta:
 *           type: number
 *           example: 5
 *         cantidad_unidad_base:
 *           type: number
 *           example: 120
 *           description: "cantidad_unidad_venta * unidades_por_unidad_venta"
 *         precio_unitario_estimado:
 *           type: string
 *           example: "150.00"
 *         subtotal_estimado:
 *           type: string
 *           example: "750.00"
 *         notas:
 *           type: string
 *           nullable: true
 *         presentacion:
 *           $ref: "#/components/schemas/PresentacionResumen"
 *
 *     Consignacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 50
 *         id_usuario_cliente:
 *           type: integer
 *           nullable: true
 *           example: 12
 *         id_ubicacion_salida:
 *           type: integer
 *           example: 1
 *         fecha_envio:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         estado:
 *           type: string
 *           enum: [ABIERTA, CERRADA, CANCELADA]
 *           example: ABIERTA
 *         subtotal_estimado:
 *           type: string
 *           example: "750.00"
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Consignación para cliente mayorista"
 *         cliente_usuario:
 *           $ref: "#/components/schemas/UsuarioResumen"
 *         ubicacion_salida:
 *           $ref: "#/components/schemas/UbicacionResumen"
 *         detalles:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/DetalleConsignacion"
 *
 *     CrearConsignacionInput:
 *       type: object
 *       required:
 *         - id_ubicacion_salida
 *         - detalles
 *       properties:
 *         id_usuario_cliente:
 *           type: integer
 *           nullable: true
 *           example: 12
 *           description: "Opcional: si se consigna a un cliente específico."
 *         id_ubicacion_salida:
 *           type: integer
 *           example: 1
 *         fecha_envio:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2026-01-20"
 *           description: "Opcional: si no se envía, el backend usa la fecha de hoy."
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Enviar en ruta mañana"
 *         detalles:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: "#/components/schemas/DetalleConsignacionInput"
 *
 *     ConsignacionResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Consignación creada y stock descontado correctamente"
 *         consignacion:
 *           $ref: "#/components/schemas/Consignacion"
 */

/**
 * @swagger
 * /api/consignaciones:
 *   get:
 *     summary: Listar consignaciones
 *     description: |
 *       Lista consignaciones con cliente (si aplica), ubicación de salida y detalles.
 *
 *       - Requiere autenticación (JWT)
 *       - Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Consignaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [ABIERTA, CERRADA, CANCELADA]
 *         description: Filtrar por estado
 *         example: ABIERTA
 *       - in: query
 *         name: id_cliente
 *         schema:
 *           type: integer
 *         description: Filtrar por cliente (id_usuario_cliente)
 *         example: 12
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar fecha_envio desde (inclusive)
 *         example: "2026-01-01"
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar fecha_envio hasta (inclusive)
 *         example: "2026-01-31"
 *     responses:
 *       200:
 *         description: Lista de consignaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Consignacion"
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
  consignacionController.listarConsignaciones
);

/**
 * @swagger
 * /api/consignaciones/{id}:
 *   get:
 *     summary: Obtener consignación por ID
 *     description: |
 *       Devuelve una consignación con cliente (si aplica), ubicación de salida y detalles.
 *
 *       - Requiere autenticación (JWT)
 *       - Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Consignaciones]
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
 *         description: Consignación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Consignacion"
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
 *         description: Consignación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Consignación no encontrada" }
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
  consignacionController.obtenerConsignacionPorId
);

/**
 * @swagger
 * /api/consignaciones:
 *   post:
 *     summary: Crear consignación (descuenta stock de la ubicación de salida)
 *     description: |
 *       Crea una consignación y **descuenta stock** de `id_ubicacion_salida` (cantidad_unidad_base).
 *       Operación transaccional:
 *       - valida ubicación de salida y (si viene) cliente
 *       - valida presentaciones
 *       - calcula cantidades base por producto
 *       - verifica stock disponible por producto
 *       - crea consignación + detalles
 *       - descuenta inventario y registra movimientos tipo **CONSIGNACION_SALIDA**
 *
 *       - Requiere autenticación (JWT)
 *       - Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Consignaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CrearConsignacionInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 id_usuario_cliente: 12
 *                 id_ubicacion_salida: 1
 *                 fecha_envio: "2026-01-20"
 *                 notas: "Dejar en kiosko"
 *                 detalles:
 *                   - id_presentacion_producto: 25
 *                     cantidad_unidad_venta: 5
 *                     precio_unitario_estimado: 150
 *                     notas: "Primera entrega"
 *     responses:
 *       201:
 *         description: Consignación creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ConsignacionResponse"
 *       400:
 *         description: Validación fallida (datos incompletos, ubicación/cliente/presentación no existe, stock insuficiente, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               sinDetalles:
 *                 value: { mensaje: "La consignación debe incluir al menos un detalle" }
 *               sinUbicacion:
 *                 value: { mensaje: "id_ubicacion_salida es obligatorio" }
 *               ubicacionNoExiste:
 *                 value: { mensaje: "La ubicación de salida indicada no existe" }
 *               clienteNoExiste:
 *                 value: { mensaje: "El usuario cliente indicado no existe" }
 *               presentacionesNoExisten:
 *                 value: { mensaje: "Una o más presentaciones de producto no existen" }
 *               detalleInvalido:
 *                 value:
 *                   mensaje: "Cada detalle debe tener id_presentacion_producto y cantidad_unidad_venta"
 *               stockInsuficiente:
 *                 value:
 *                   mensaje: "Stock insuficiente para el producto 10. Disponible: 5, requerido para consignación: 24"
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
  consignacionController.crearConsignacion
);

/**
 * @swagger
 * /api/consignaciones/{id}/cerrar:
 *   patch:
 *     summary: Cerrar una consignación (solo cambia estado)
 *     description: |
 *       Cambia el estado de la consignación a **CERRADA**.
 *       **No modifica inventario** (según la implementación actual).
 *
 *       Reglas:
 *       - si ya está CERRADA -> 400
 *       - si está CANCELADA -> 400
 *
 *       - Requiere autenticación (JWT)
 *       - Roles permitidos: **ADMINISTRADOR**, **VENDEDOR**
 *     tags: [Consignaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 50
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notas:
 *                 type: string
 *                 nullable: true
 *                 example: "Cerrada por finalización de período"
 *     responses:
 *       200:
 *         description: Consignación cerrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Consignación cerrada correctamente"
 *                 consignacion:
 *                   $ref: "#/components/schemas/Consignacion"
 *       400:
 *         description: Estado inválido para cerrar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               yaCerrada:
 *                 value: { mensaje: "La consignación ya está cerrada" }
 *               cancelada:
 *                 value: { mensaje: "No se puede cerrar una consignación cancelada" }
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
 *         description: Consignación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrada:
 *                 value: { mensaje: "Consignación no encontrada" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.patch(
  "/:id/cerrar",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR", "VENDEDOR"),
  consignacionController.cerrarConsignacion
);

module.exports = router;

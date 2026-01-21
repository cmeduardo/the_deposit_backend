// app/routes/gasto.routes.js
const express = require("express");
const router = express.Router();

const gastoController = require("../controllers/gasto.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Gastos
 *   description: Registro y consulta de gastos del negocio (solo ADMINISTRADOR)
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
 *     Gasto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_categoria_gasto:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         id_usuario_registro:
 *           type: integer
 *           example: 5
 *         fecha_gasto:
 *           type: string
 *           format: date
 *           example: "2026-01-20"
 *         tipo:
 *           type: string
 *           enum: [FIJO, VARIABLE]
 *           example: "FIJO"
 *         descripcion:
 *           type: string
 *           example: "Renta del local"
 *         monto:
 *           type: number
 *           format: float
 *           example: 2500.0
 *         metodo_pago:
 *           type: string
 *           nullable: true
 *           example: "EFECTIVO"
 *         referencia_pago:
 *           type: string
 *           nullable: true
 *           example: "REC-001"
 *         es_recurrente:
 *           type: boolean
 *           example: true
 *         periodo_recurrencia:
 *           type: string
 *           nullable: true
 *           enum: [MENSUAL, TRIMESTRAL, ANUAL]
 *           example: "MENSUAL"
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Pagado puntual"
 *
 *     CategoriaGastoResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         nombre:
 *           type: string
 *           example: "Renta"
 *         tipo_por_defecto:
 *           type: string
 *           nullable: true
 *           enum: [FIJO, VARIABLE]
 *           example: "FIJO"
 *
 *     UsuarioResumen:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: integer
 *           example: 5
 *         nombre:
 *           type: string
 *           example: "Eduardo"
 *         correo:
 *           type: string
 *           example: "eduardo@correo.com"
 *
 *     GastoConRelaciones:
 *       allOf:
 *         - $ref: "#/components/schemas/Gasto"
 *         - type: object
 *           properties:
 *             categoria_gasto:
 *               $ref: "#/components/schemas/CategoriaGastoResumen"
 *             usuario_registro:
 *               $ref: "#/components/schemas/UsuarioResumen"
 *
 *     GastoCreateInput:
 *       type: object
 *       required: [fecha_gasto, tipo, descripcion, monto]
 *       properties:
 *         id_categoria_gasto:
 *           type: integer
 *           nullable: true
 *         fecha_gasto:
 *           type: string
 *           format: date
 *         tipo:
 *           type: string
 *           enum: [FIJO, VARIABLE]
 *         descripcion:
 *           type: string
 *         monto:
 *           type: number
 *           format: float
 *         metodo_pago:
 *           type: string
 *           nullable: true
 *         referencia_pago:
 *           type: string
 *           nullable: true
 *         es_recurrente:
 *           type: boolean
 *         periodo_recurrencia:
 *           type: string
 *           nullable: true
 *           enum: [MENSUAL, TRIMESTRAL, ANUAL]
 *         notas:
 *           type: string
 *           nullable: true
 *
 *     GastoUpdateInput:
 *       type: object
 *       description: |
 *         Campos opcionales para actualización parcial.
 *         Nota: el controller permite `id_categoria_gasto = null` para desasociar categoría.
 *       properties:
 *         id_categoria_gasto:
 *           oneOf:
 *             - type: integer
 *             - type: "null"
 *         fecha_gasto:
 *           type: string
 *           format: date
 *         tipo:
 *           type: string
 *           enum: [FIJO, VARIABLE]
 *         descripcion:
 *           type: string
 *         monto:
 *           type: number
 *           format: float
 *         metodo_pago:
 *           type: string
 *           nullable: true
 *         referencia_pago:
 *           type: string
 *           nullable: true
 *         es_recurrente:
 *           type: boolean
 *         periodo_recurrencia:
 *           type: string
 *           nullable: true
 *           enum: [MENSUAL, TRIMESTRAL, ANUAL]
 *         notas:
 *           type: string
 *           nullable: true
 *
 *     GastoCreateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Gasto registrado correctamente"
 *         gasto:
 *           $ref: "#/components/schemas/Gasto"
 *
 *     GastoUpdateResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Gasto actualizado correctamente"
 *         gasto:
 *           $ref: "#/components/schemas/Gasto"
 *
 *     GastosResumenMensualResponse:
 *       type: object
 *       properties:
 *         anio:
 *           type: integer
 *           example: 2026
 *         mes:
 *           type: integer
 *           example: 1
 *         rango_fechas:
 *           type: object
 *           properties:
 *             inicio:
 *               type: string
 *               format: date
 *               example: "2026-01-01"
 *             fin:
 *               type: string
 *               format: date
 *               example: "2026-01-31"
 *         total:
 *           type: number
 *           format: float
 *           example: 3500.0
 *         total_fijo:
 *           type: number
 *           format: float
 *           example: 2500.0
 *         total_variable:
 *           type: number
 *           format: float
 *           example: 1000.0
 *         por_categoria:
 *           type: object
 *           additionalProperties:
 *             type: number
 *             format: float
 *           example:
 *             Renta: 2500
 *             Gasolina: 1000
 *         cantidad_registros:
 *           type: integer
 *           example: 12
 */

/**
 * @swagger
 * /api/gastos:
 *   get:
 *     summary: Listar gastos
 *     description: |
 *       Lista gastos con filtros opcionales:
 *       - `fecha_desde` / `fecha_hasta` (sobre `fecha_gasto`)
 *       - `tipo` (FIJO|VARIABLE)
 *       - `id_categoria_gasto`
 *
 *       Incluye relaciones:
 *       - `categoria_gasto` (id, nombre, tipo_por_defecto)
 *       - `usuario_registro` (id, nombre, correo)
 *
 *       Roles: **ADMINISTRADOR**
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha gasto desde (inclusive)
 *         example: "2026-01-01"
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha gasto hasta (inclusive)
 *         example: "2026-01-31"
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [FIJO, VARIABLE]
 *         description: Filtrar por tipo
 *         example: "FIJO"
 *       - in: query
 *         name: id_categoria_gasto
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *         example: 2
 *     responses:
 *       200:
 *         description: Lista de gastos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/GastoConRelaciones"
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
router.get(
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  gastoController.listarGastos
);

/**
 * @swagger
 * /api/gastos/resumen-mensual:
 *   get:
 *     summary: Resumen mensual de gastos
 *     description: |
 *       Calcula un resumen para un mes:
 *       - total, total_fijo, total_variable
 *       - acumulado por categoría (por nombre)
 *       - cantidad_registros
 *
 *       Si no se envían `anio` y/o `mes`, usa el mes actual del servidor.
 *
 *       Roles: **ADMINISTRADOR**
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *         description: Año (por defecto año actual)
 *         example: 2026
 *       - in: query
 *         name: mes
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Mes 1-12 (por defecto mes actual)
 *         example: 1
 *     responses:
 *       200:
 *         description: Resumen mensual por tipo y categoría
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GastosResumenMensualResponse"
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
router.get(
  "/resumen-mensual",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  gastoController.resumenMensual
);

/**
 * @swagger
 * /api/gastos/{id}:
 *   get:
 *     summary: Obtener gasto por ID
 *     description: |
 *       Devuelve un gasto por `id` incluyendo:
 *       - `categoria_gasto`
 *       - `usuario_registro`
 *
 *       Roles: **ADMINISTRADOR**
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 15
 *     responses:
 *       200:
 *         description: Gasto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GastoConRelaciones"
 *       404:
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Gasto no encontrado" }
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
router.get(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  gastoController.obtenerGastoPorId
);

/**
 * @swagger
 * /api/gastos:
 *   post:
 *     summary: Registrar un gasto
 *     description: |
 *       Crea un gasto.
 *
 *       Reglas del controller:
 *       - Obligatorios: `fecha_gasto`, `tipo`, `descripcion`, `monto`
 *       - `tipo` debe ser FIJO o VARIABLE
 *       - Si se envía `id_categoria_gasto`, valida que exista
 *       - Si `es_recurrente` es true, `periodo_recurrencia` es obligatorio
 *       - `id_usuario_registro` se toma del token (`req.usuario.id`)
 *
 *       Roles: **ADMINISTRADOR**
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/GastoCreateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 id_categoria_gasto: 2
 *                 fecha_gasto: "2026-01-20"
 *                 tipo: "FIJO"
 *                 descripcion: "Renta del local"
 *                 monto: 2500
 *                 metodo_pago: "TRANSFERENCIA"
 *                 referencia_pago: "TRX-123"
 *                 es_recurrente: true
 *                 periodo_recurrencia: "MENSUAL"
 *                 notas: "Pagado puntual"
 *     responses:
 *       201:
 *         description: Gasto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GastoCreateResponse"
 *       400:
 *         description: Validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltanCampos:
 *                 value: { mensaje: "fecha_gasto, tipo, descripcion y monto son obligatorios" }
 *               tipoInvalido:
 *                 value: { mensaje: "tipo debe ser \"FIJO\" o \"VARIABLE\"" }
 *               categoriaNoExiste:
 *                 value: { mensaje: "La categoría de gasto indicada no existe" }
 *               recurrenciaSinPeriodo:
 *                 value: { mensaje: "Si es_recurrente es true, periodo_recurrencia es obligatorio" }
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
  "/",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  gastoController.crearGasto
);

/**
 * @swagger
 * /api/gastos/{id}:
 *   patch:
 *     summary: Actualizar un gasto (parcial)
 *     description: |
 *       Actualiza parcialmente un gasto.
 *
 *       Reglas del controller:
 *       - Si `id_categoria_gasto` es **null**: desasocia categoría.
 *       - Si `id_categoria_gasto` es un número: valida que exista.
 *       - Si se manda `tipo`, debe ser FIJO o VARIABLE.
 *       - Si `es_recurrente` pasa a false, `periodo_recurrencia` se limpia a null.
 *       - OJO: el controller **no** valida que `periodo_recurrencia` sea obligatorio cuando `es_recurrente=true` en PATCH
 *         (si quieres “blindarlo”, ahí conviene agregar esa validación).
 *
 *       Roles: **ADMINISTRADOR**
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 15
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/GastoUpdateInput"
 *           examples:
 *             ejemplo:
 *               value:
 *                 descripcion: "Renta del local (enero)"
 *                 monto: 2600
 *                 es_recurrente: true
 *                 periodo_recurrencia: "MENSUAL"
 *     responses:
 *       200:
 *         description: Gasto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GastoUpdateResponse"
 *       400:
 *         description: Validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               tipoInvalido:
 *                 value: { mensaje: "tipo debe ser \"FIJO\" o \"VARIABLE\"" }
 *               categoriaNoExiste:
 *                 value: { mensaje: "La categoría de gasto indicada no existe" }
 *       404:
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Gasto no encontrado" }
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
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  gastoController.actualizarGasto
);

module.exports = router;

// app/routes/gasto.routes.js
const express = require("express");
const router = express.Router();

const gastoController = require("../controllers/gasto.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * components:
 *   schemas:
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
 *           example: "TRANSFERENCIA"
 *         referencia_pago:
 *           type: string
 *           nullable: true
 *           example: "TRX-123"
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
 *           example: 2
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
 *           example: 2500
 *         metodo_pago:
 *           type: string
 *           nullable: true
 *           example: "TRANSFERENCIA"
 *         referencia_pago:
 *           type: string
 *           nullable: true
 *           example: "TRX-123"
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
 *     GastoUpdateInput:
 *       type: object
 *       description: |
 *         Campos opcionales para actualización parcial.
 *         - El controller permite `id_categoria_gasto = null` para desasociar categoría.
 *         - Si envías `tipo`, debe ser FIJO o VARIABLE.
 *         - Si `es_recurrente` pasa a false, el controller limpia `periodo_recurrencia` a null.
 *         - OJO: si envías `periodo_recurrencia` explícitamente, el controller lo asigna tal cual (aunque `es_recurrente` sea false).
 *       properties:
 *         id_categoria_gasto:
 *           oneOf:
 *             - type: integer
 *               example: 2
 *             - type: "null"
 *         fecha_gasto:
 *           type: string
 *           format: date
 *           example: "2026-01-22"
 *         tipo:
 *           type: string
 *           enum: [FIJO, VARIABLE]
 *           example: "VARIABLE"
 *         descripcion:
 *           type: string
 *           example: "Gasolina"
 *         monto:
 *           type: number
 *           format: float
 *           example: 350
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
 *           example: false
 *         periodo_recurrencia:
 *           type: string
 *           nullable: true
 *           enum: [MENSUAL, TRIMESTRAL, ANUAL]
 *           example: "MENSUAL"
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Ajuste"
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
 *           description: "Mapa por nombre de categoría. Si el gasto no tiene categoría, usa la clave `SIN_CATEGORIA`."
 *           additionalProperties:
 *             type: number
 *             format: float
 *           example:
 *             Renta: 2500
 *             Gasolina: 1000
 *             SIN_CATEGORIA: 0
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
 *       - $ref: "#/components/parameters/FechaDesdeQuery"
 *       - $ref: "#/components/parameters/FechaHastaQuery"
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
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
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
 *       - `total`, `total_fijo`, `total_variable`
 *       - acumulado por categoría (por nombre)
 *       - `cantidad_registros`
 *
 *       Si no envías `anio` y/o `mes`, usa el mes actual del servidor.
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
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
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
 *       - $ref: "#/components/parameters/IdPathParam"
 *     responses:
 *       200:
 *         description: Gasto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GastoConRelaciones"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
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
 *         $ref: "#/components/responses/ValidationError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
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
 *
 *       Roles: **ADMINISTRADOR**
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: "#/components/parameters/IdPathParam"
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
 *         $ref: "#/components/responses/ValidationError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.patch(
  "/:id",
  autenticacionMiddleware,
  rolMiddleware("ADMINISTRADOR"),
  gastoController.actualizarGasto
);

module.exports = router;

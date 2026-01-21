const express = require("express");
const router = express.Router();

const carritoController = require("../controllers/carrito.controller");
const autenticacionMiddleware = require("../middlewares/autenticacion.middleware");
const rolMiddleware = require("../middlewares/rol.middleware");

/**
 * @swagger
 * tags:
 *   name: Carrito
 *   description: Endpoints para operar el carrito de compras del usuario autenticado
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
 *     ItemCarritoInput:
 *       type: object
 *       required:
 *         - id_presentacion_producto
 *         - cantidad_unidad_venta
 *       properties:
 *         id_presentacion_producto:
 *           type: integer
 *           example: 1
 *         cantidad_unidad_venta:
 *           type: number
 *           format: float
 *           minimum: 0.001
 *           example: 2
 *           description: Cantidad en unidad de venta de la presentación. Puede ser decimal si el negocio lo permite.
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Sin hielo"
 *
 *     ItemCarritoPatchInput:
 *       type: object
 *       properties:
 *         cantidad_unidad_venta:
 *           type: number
 *           format: float
 *           example: 3
 *           description: Si es <= 0, el backend elimina el item del carrito.
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Cambiar por presentación unidad"
 *
 *     ItemCarrito:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         id_carrito:
 *           type: integer
 *           example: 1
 *         id_presentacion_producto:
 *           type: integer
 *           example: 1
 *         cantidad_unidad_venta:
 *           type: string
 *           example: "2.000"
 *           description: Se guarda como DECIMAL(12,3); puede venir como string desde la BD.
 *         precio_unitario:
 *           type: string
 *           example: "7.00"
 *           description: Snapshot del precio al momento de agregar al carrito.
 *         subtotal_linea:
 *           type: string
 *           example: "14.00"
 *         notas:
 *           type: string
 *           nullable: true
 *           example: "Sin hielo"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CarritoCompra:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_usuario_cliente:
 *           type: integer
 *           example: 1
 *         estado:
 *           type: string
 *           enum: [ACTIVO, CONVERTIDO, CANCELADO]
 *           example: ACTIVO
 *         notas:
 *           type: string
 *           nullable: true
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/ItemCarrito"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CarritoItemResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Item agregado al carrito"
 *         carrito:
 *           $ref: "#/components/schemas/CarritoCompra"
 *
 *     SimpleMessageResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Operación realizada correctamente"
 *
 *     ConfirmarCarritoInput:
 *       type: object
 *       required:
 *         - id_ubicacion_salida
 *       properties:
 *         id_ubicacion_salida:
 *           type: integer
 *           example: 1
 *         cargo_envio:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 15
 *         descuento_total:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 0
 *         notas_cliente:
 *           type: string
 *           nullable: true
 *           example: "Entregar en tienda"
 *
 *     ConfirmarCarritoResponse:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *           example: "Pedido creado correctamente desde el carrito"
 *         pedido_id:
 *           type: integer
 *           example: 123
 *         total_general:
 *           type: number
 *           example: 125.5
 */

/**
 * @swagger
 * /api/carrito/mi-carrito:
 *   get:
 *     summary: Obtener el carrito ACTIVO del usuario (crea uno si no existe)
 *     description: |
 *       Devuelve el carrito en estado **ACTIVO** del usuario autenticado.
 *       Si no existe, el backend lo **crea automáticamente**.
 *
 *       **Header requerido:**
 *       ```
 *       Authorization: Bearer <token>
 *       ```
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito actual con sus items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CarritoCompra"
 *       401:
 *         description: No autenticado (token faltante, formato inválido, expirado o inválido)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               sinToken:
 *                 value: { mensaje: "No se proporcionó token" }
 *               tokenInvalido:
 *                 value: { mensaje: "Token inválido o expirado" }
 *       403:
 *         description: No tienes permisos para esta acción
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               sinPermisos:
 *                 value: { mensaje: "No tienes permisos para esta acción" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get(
  "/mi-carrito",
  autenticacionMiddleware,
  rolMiddleware("CLIENTE", "ADMINISTRADOR", "VENDEDOR"),
  carritoController.obtenerMiCarrito
);

/**
 * @swagger
 * /api/carrito/items:
 *   post:
 *     summary: Agregar un item al carrito (snapshot de precio)
 *     description: |
 *       Agrega una presentación al carrito.
 *
 *       **Reglas:**
 *       - `cantidad_unidad_venta` debe ser > 0.
 *       - Si ya existe un item con la misma `id_presentacion_producto`, el backend **suma** la cantidad.
 *       - `precio_unitario` es un **snapshot** (se actualiza al agregar).
 *
 *       **Header requerido:**
 *       ```
 *       Authorization: Bearer <token>
 *       ```
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ItemCarritoInput"
 *           examples:
 *             agregarItem:
 *               summary: Agregar una presentación al carrito
 *               value:
 *                 id_presentacion_producto: 1
 *                 cantidad_unidad_venta: 2
 *                 notas: "Sin hielo"
 *     responses:
 *       201:
 *         description: Item agregado al carrito y carrito actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CarritoItemResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Item agregado al carrito"
 *                   carrito:
 *                     id: 1
 *                     id_usuario_cliente: 1
 *                     estado: "ACTIVO"
 *                     items: []
 *       400:
 *         description: Datos inválidos (faltan campos, cantidad <= 0, presentación inexistente/inactiva, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               faltanCampos:
 *                 value: { mensaje: "id_presentacion_producto y cantidad_unidad_venta son obligatorios" }
 *               cantidadInvalida:
 *                 value: { mensaje: "La cantidad debe ser mayor a cero" }
 *               presentacionInactiva:
 *                 value: { mensaje: "La presentación de producto no existe o está inactiva" }
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: No tienes permisos para esta acción
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
  "/items",
  autenticacionMiddleware,
  rolMiddleware("CLIENTE", "ADMINISTRADOR", "VENDEDOR"),
  carritoController.agregarItemCarrito
);

/**
 * @swagger
 * /api/carrito/items/{id}:
 *   patch:
 *     summary: Actualizar un item del carrito (cantidad / notas)
 *     description: |
 *       Actualiza `cantidad_unidad_venta` y/o `notas` del item.
 *
 *       **Regla importante:**
 *       - Si `cantidad_unidad_venta <= 0`, el backend **elimina el item** y responde `200`.
 *
 *       **Header requerido:**
 *       ```
 *       Authorization: Bearer <token>
 *       ```
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ItemCarritoPatchInput"
 *           examples:
 *             cambiarCantidad:
 *               value:
 *                 cantidad_unidad_venta: 3
 *             cambiarNotas:
 *               value:
 *                 notas: "Cambiar por presentación unidad"
 *     responses:
 *       200:
 *         description: Item actualizado (o eliminado si cantidad <= 0)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     mensaje:
 *                       type: string
 *                       example: "Item de carrito actualizado"
 *                     item:
 *                       $ref: "#/components/schemas/ItemCarrito"
 *                 - $ref: "#/components/schemas/SimpleMessageResponse"
 *             examples:
 *               actualizado:
 *                 value:
 *                   mensaje: "Item de carrito actualizado"
 *                   item:
 *                     id: 10
 *                     id_carrito: 1
 *                     id_presentacion_producto: 1
 *                     cantidad_unidad_venta: "3.000"
 *                     precio_unitario: "7.00"
 *                     subtotal_linea: "21.00"
 *               eliminadoPorCantidad:
 *                 value:
 *                   mensaje: "Item eliminado del carrito"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: No tienes permisos para esta acción
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: Item no encontrado en el carrito del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Item no encontrado en tu carrito" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.patch(
  "/items/:id",
  autenticacionMiddleware,
  rolMiddleware("CLIENTE", "ADMINISTRADOR", "VENDEDOR"),
  carritoController.actualizarItemCarrito
);

/**
 * @swagger
 * /api/carrito/items/{id}:
 *   delete:
 *     summary: Eliminar un item del carrito
 *     description: |
 *       Elimina un item del carrito del usuario autenticado.
 *
 *       **Header requerido:**
 *       ```
 *       Authorization: Bearer <token>
 *       ```
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Item eliminado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SimpleMessageResponse"
 *             examples:
 *               ok:
 *                 value: { mensaje: "Item eliminado del carrito" }
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: No tienes permisos para esta acción
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: Item no encontrado en el carrito del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               noEncontrado:
 *                 value: { mensaje: "Item no encontrado en tu carrito" }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.delete(
  "/items/:id",
  autenticacionMiddleware,
  rolMiddleware("CLIENTE", "ADMINISTRADOR", "VENDEDOR"),
  carritoController.eliminarItemCarrito
);

/**
 * @swagger
 * /api/carrito/mi-carrito/items:
 *   delete:
 *     summary: Vaciar el carrito del usuario (elimina todos los items)
 *     description: |
 *       Elimina todos los items del carrito **ACTIVO** del usuario autenticado.
 *
 *       **Header requerido:**
 *       ```
 *       Authorization: Bearer <token>
 *       ```
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SimpleMessageResponse"
 *             examples:
 *               ok:
 *                 value: { mensaje: "Carrito vaciado" }
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: No tienes permisos para esta acción
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
router.delete(
  "/mi-carrito/items",
  autenticacionMiddleware,
  rolMiddleware("CLIENTE", "ADMINISTRADOR", "VENDEDOR"),
  carritoController.vaciarMiCarrito
);

/**
 * @swagger
 * /api/carrito/confirmar:
 *   post:
 *     summary: Confirmar el carrito y generar un pedido (reserva stock + convierte carrito)
 *     description: |
 *       Convierte el carrito **ACTIVO** en un **Pedido**:
 *       - Valida carrito no vacío.
 *       - Verifica stock disponible en la ubicación de salida.
 *       - Reserva inventario (disminuye disponible, aumenta reservado).
 *       - Crea pedido y detalle de pedido.
 *       - Marca carrito como **CONVERTIDO** y elimina items.
 *
 *       **Header requerido:**
 *       ```
 *       Authorization: Bearer <token>
 *       ```
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ConfirmarCarritoInput"
 *           examples:
 *             confirmar:
 *               value:
 *                 id_ubicacion_salida: 1
 *                 cargo_envio: 15
 *                 descuento_total: 0
 *                 notas_cliente: "Entregar en tienda"
 *     responses:
 *       201:
 *         description: Pedido creado desde el carrito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ConfirmarCarritoResponse"
 *             examples:
 *               ok:
 *                 value:
 *                   mensaje: "Pedido creado correctamente desde el carrito"
 *                   pedido_id: 123
 *                   total_general: 125.5
 *       400:
 *         description: Datos inválidos, carrito vacío, ubicación inexistente, etc.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               ubicacionFalta:
 *                 value: { mensaje: "id_ubicacion_salida es obligatorio" }
 *               ubicacionNoExiste:
 *                 value: { mensaje: "La ubicación de salida indicada no existe" }
 *               carritoVacio:
 *                 value: { mensaje: "El carrito está vacío o no tiene items" }
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: No tienes permisos para esta acción
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       409:
 *         description: Conflicto por stock insuficiente (recomendado). Si tu backend devuelve 400, ajusta aquí o cambia el backend a 409.
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
  "/confirmar",
  autenticacionMiddleware,
  rolMiddleware("CLIENTE", "ADMINISTRADOR", "VENDEDOR"),
  carritoController.confirmarCarritoCrearPedido
);

module.exports = router;

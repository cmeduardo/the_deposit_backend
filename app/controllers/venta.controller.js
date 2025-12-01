const db = require("../models");
const Venta = db.ventas;
const DetalleVenta = db.detalles_ventas;
const Pedido = db.pedidos;
const DetallePedido = db.detalles_pedidos;
const Presentacion = db.presentaciones_productos;
const Producto = db.productos;
const Usuario = db.usuarios;
const Ubicacion = db.ubicaciones_inventario;
const InventarioSaldo = db.inventarios_saldos;
const Movimiento = db.movimientos_inventario;
const { Op } = db.Sequelize;

const getFechaHoy = () => new Date().toISOString().slice(0, 10);

// GET /api/ventas
const listarVentas = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            include: [
                {
                    model: Usuario,
                    as: "cliente_usuario",
                    attributes: ["id", "nombre", "correo"],
                },
                {
                    model: Ubicacion,
                    as: "ubicacion_salida",
                    attributes: ["id", "nombre", "tipo"],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        return res.json(ventas);
    } catch (err) {
        console.error("Error en listarVentas:", err);
        return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};

// GET /api/ventas/:id
const obtenerVentaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const venta = await Venta.findByPk(id, {
            include: [
                {
                    model: Usuario,
                    as: "cliente_usuario",
                    attributes: ["id", "nombre", "correo"],
                },
                {
                    model: Ubicacion,
                    as: "ubicacion_salida",
                    attributes: ["id", "nombre", "tipo"],
                },
                {
                    model: DetalleVenta,
                    as: "detalles",
                    include: [
                        {
                            model: Presentacion,
                            as: "presentacion",
                            include: [
                                {
                                    model: Producto,
                                    as: "producto",
                                    attributes: ["id", "nombre"],
                                },
                            ],
                        },
                    ],
                },
                {
                    model: Pedido,
                    as: "pedido",
                },
            ],
        });

        if (!venta) {
            return res.status(404).json({ mensaje: "Venta no encontrada" });
        }

        return res.json(venta);
    } catch (err) {
        console.error("Error en obtenerVentaPorId:", err);
        return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};

// POST /api/ventas (con id_pedido o directa)
const crearVenta = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const {
            id_pedido,
            id_usuario_cliente,
            id_ubicacion_salida,
            nombre_cliente,
            fecha_venta,
            cargo_envio,
            descuento_total,
            tipo_pago,
            estado_pago,
            notas,
            detalles, // solo para venta directa
        } = req.body;

        let venta;
        let subtotal = 0;
        let ubicacionSalidaId;
        let clienteId = id_usuario_cliente || null;

        // VENTA DESDE PEDIDO
        if (id_pedido) {
            const pedido = await Pedido.findByPk(id_pedido, {
                include: [
                    {
                        model: DetallePedido,
                        as: "detalles",
                        include: [
                            {
                                model: Presentacion,
                                as: "presentacion",
                            },
                        ],
                    },
                ],
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            if (!pedido) {
                await t.rollback();
                return res.status(400).json({ mensaje: "El pedido no existe" });
            }

            if (pedido.estado !== "PENDIENTE") {
                await t.rollback();
                return res
                    .status(400)
                    .json({ mensaje: "Solo se pueden facturar pedidos PENDIENTE" });
            }

            const ventaExistente = await Venta.findOne({
                where: { id_pedido },
                transaction: t,
            });

            if (ventaExistente) {
                await t.rollback();
                return res
                    .status(400)
                    .json({ mensaje: "Ya existe una venta asociada a este pedido" });
            }

            ubicacionSalidaId = pedido.id_ubicacion_salida;
            clienteId = pedido.id_usuario_cliente || clienteId;
            subtotal = parseFloat(pedido.subtotal_productos);
            const cargoEnvioFinal =
                cargo_envio !== undefined ? cargo_envio : parseFloat(pedido.cargo_envio);
            const descuentoFinal =
                descuento_total !== undefined
                    ? descuento_total
                    : parseFloat(pedido.descuento_total || 0);

            const totalGeneral =
                subtotal + parseFloat(cargoEnvioFinal) - parseFloat(descuentoFinal || 0);

            const fechaVentaFinal = fecha_venta || getFechaHoy();

            venta = await Venta.create(
                {
                    id_pedido,
                    id_usuario_cliente: clienteId || null,
                    id_ubicacion_salida: ubicacionSalidaId,
                    nombre_cliente: nombre_cliente || null,
                    fecha_venta: fechaVentaFinal,
                    subtotal_productos: subtotal,
                    impuestos: 0,
                    cargo_envio: cargoEnvioFinal,
                    descuento_total: descuentoFinal,
                    total_general: totalGeneral,
                    tipo_pago: tipo_pago || "Contado",
                    estado_pago: estado_pago || "PAGADO",
                    estado: "REGISTRADA",
                    notas: notas || null,
                },
                { transaction: t }
            );

            // Actualizar inventario: restar disponible y reservada, registrar movimientos
            for (const detP of pedido.detalles) {
                const presentacion = detP.presentacion;
                const id_producto = presentacion.id_producto;
                const cantidadBase = detP.cantidad_unidad_base;

                const saldo = await InventarioSaldo.findOne({
                    where: {
                        id_producto,
                        id_ubicacion: ubicacionSalidaId,
                    },
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!saldo || saldo.cantidad_reservada < cantidadBase) {
                    await t.rollback();
                    return res.status(400).json({
                        mensaje: `Reserva insuficiente para producto ${id_producto} en la ubicación ${ubicacionSalidaId}`,
                    });
                }

                if (saldo.cantidad_disponible < cantidadBase) {
                    await t.rollback();
                    return res.status(400).json({
                        mensaje: `Stock físico insuficiente para producto ${id_producto}`,
                    });
                }

                saldo.cantidad_reservada -= cantidadBase;
                saldo.cantidad_disponible -= cantidadBase;
                await saldo.save({ transaction: t });

                const precioUnitario = detP.precio_unitario;
                const unidadesPorVenta = presentacion.unidades_por_unidad_venta || 1;
                const precioBase = parseFloat(precioUnitario) / unidadesPorVenta;
                const subtotalLinea =
                    parseFloat(precioUnitario) * detP.cantidad_unidad_venta;

                await DetalleVenta.create(
                    {
                        id_venta: venta.id,
                        id_presentacion_producto: presentacion.id,
                        cantidad_unidad_venta: detP.cantidad_unidad_venta,
                        cantidad_unidad_base: cantidadBase,
                        precio_unitario_venta: precioUnitario,
                        precio_unitario_base: precioBase,
                        es_precio_manual: detP.origen_precio === "MANUAL",
                        subtotal_linea: subtotalLinea,
                    },
                    { transaction: t }
                );

                await Movimiento.create(
                    {
                        id_producto,
                        id_ubicacion: ubicacionSalidaId,
                        tipo_movimiento: "VENTA",
                        cantidad: -cantidadBase,
                        referencia_tipo: "VENTA",
                        id_referencia: venta.id,
                        notas: `Venta desde pedido ${pedido.id}`,
                    },
                    { transaction: t }
                );
            }

            pedido.estado = "COMPLETADO";
            await pedido.save({ transaction: t });
        } else {
            // VENTA DIRECTA (sin pedido)
            if (!id_ubicacion_salida) {
                await t.rollback();
                return res
                    .status(400)
                    .json({ mensaje: "id_ubicacion_salida es obligatorio en venta directa" });
            }

            if (!Array.isArray(detalles) || detalles.length === 0) {
                await t.rollback();
                return res
                    .status(400)
                    .json({ mensaje: "La venta debe incluir al menos un detalle" });
            }

            const ubicacion = await Ubicacion.findByPk(id_ubicacion_salida);
            if (!ubicacion) {
                await t.rollback();
                return res.status(400).json({ mensaje: "La ubicación indicada no existe" });
            }

            if (clienteId) {
                const cliente = await Usuario.findByPk(clienteId);
                if (!cliente) {
                    await t.rollback();
                    return res
                        .status(400)
                        .json({ mensaje: "El usuario cliente indicado no existe" });
                }
            }

            const presentacionIds = [
                ...new Set(detalles.map((d) => d.id_presentacion_producto)),
            ];

            const presentaciones = await Presentacion.findAll({
                where: {
                    id: {
                        [Op.in]: presentacionIds,
                    },
                },
                include: [{ model: Producto, as: "producto" }],
                transaction: t,
            });


            if (presentaciones.length !== presentacionIds.length) {
                await t.rollback();
                return res.status(400).json({
                    mensaje: "Una o más presentaciones de producto no existen",
                });
            }

            const mapaPresentaciones = {};
            presentaciones.forEach((p) => {
                mapaPresentaciones[p.id] = p;
            });

            const requeridoPorProducto = {};

            for (const det of detalles) {
                const { id_presentacion_producto, cantidad_unidad_venta } = det;
                if (!id_presentacion_producto || !cantidad_unidad_venta) {
                    await t.rollback();
                    return res.status(400).json({
                        mensaje:
                            "Cada detalle debe tener id_presentacion_producto y cantidad_unidad_venta",
                    });
                }

                const presentacion = mapaPresentaciones[id_presentacion_producto];
                const unidadesPorVenta = presentacion.unidades_por_unidad_venta || 1;
                const cantidadBase = cantidad_unidad_venta * unidadesPorVenta;
                const id_producto = presentacion.id_producto;

                if (!requeridoPorProducto[id_producto]) {
                    requeridoPorProducto[id_producto] = 0;
                }
                requeridoPorProducto[id_producto] += cantidadBase;
            }

            // Verificar stock libre
            for (const idProductoStr of Object.keys(requeridoPorProducto)) {
                const id_producto = parseInt(idProductoStr, 10);
                const requeridoBase = requeridoPorProducto[id_producto];

                const saldo = await InventarioSaldo.findOne({
                    where: {
                        id_producto,
                        id_ubicacion: id_ubicacion_salida,
                    },
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                const disponible = saldo ? saldo.cantidad_disponible : 0;
                const reservada = saldo ? saldo.cantidad_reservada : 0;
                const stockLibre = disponible - reservada;

                if (stockLibre < requeridoBase) {
                    await t.rollback();
                    return res.status(400).json({
                        mensaje: `Stock insuficiente para producto ${id_producto}. Stock libre: ${stockLibre}, requerido: ${requeridoBase}`,
                    });
                }
            }

            subtotal = 0;
            const detallesVentaParaCrear = [];

            for (const det of detalles) {
                const {
                    id_presentacion_producto,
                    cantidad_unidad_venta,
                    precio_unitario, // opcional para ADMIN/VENDEDOR
                } = det;

                const presentacion = mapaPresentaciones[id_presentacion_producto];
                const unidadesPorVenta = presentacion.unidades_por_unidad_venta || 1;
                const cantidadBase = cantidad_unidad_venta * unidadesPorVenta;

                let precioFinal = presentacion.precio_venta_por_defecto;
                let esPrecioManual = false;

                if (
                    precio_unitario !== undefined &&
                    (req.usuario.rol === "ADMINISTRADOR" || req.usuario.rol === "VENDEDOR")
                ) {
                    precioFinal = precio_unitario;
                    esPrecioManual = true;
                }

                if (!precioFinal) {
                    await t.rollback();
                    return res.status(400).json({
                        mensaje: `No hay precio definido para la presentación ${id_presentacion_producto}. Debes enviar precio_unitario o definir precio_venta_por_defecto.`,
                    });
                }

                const subtotalLinea =
                    parseFloat(precioFinal) * cantidad_unidad_venta;
                subtotal += subtotalLinea;

                const precioBase = parseFloat(precioFinal) / unidadesPorVenta;

                detallesVentaParaCrear.push({
                    id_presentacion_producto,
                    cantidad_unidad_venta,
                    cantidadBase,
                    precioFinal,
                    precioBase,
                    esPrecioManual,
                    subtotalLinea,
                });
            }

            const cargoEnvioFinal = cargo_envio || 0;
            const descuentoFinal = descuento_total || 0;
            const totalGeneral =
                subtotal + parseFloat(cargoEnvioFinal) - parseFloat(descuentoFinal);
            const fechaVentaFinal = fecha_venta || getFechaHoy();

            venta = await Venta.create(
                {
                    id_pedido: null,
                    id_usuario_cliente: clienteId || null,
                    id_ubicacion_salida: id_ubicacion_salida,
                    nombre_cliente: nombre_cliente || null,
                    fecha_venta: fechaVentaFinal,
                    subtotal_productos: subtotal,
                    impuestos: 0,
                    cargo_envio: cargoEnvioFinal,
                    descuento_total: descuentoFinal,
                    total_general: totalGeneral,
                    tipo_pago: tipo_pago || "Contado",
                    estado_pago: estado_pago || "PAGADO",
                    estado: "REGISTRADA",
                    notas: notas || null,
                },
                { transaction: t }
            );

            // Actualizar inventario y movimientos
            for (const d of detallesVentaParaCrear) {
                const presentacion = mapaPresentaciones[d.id_presentacion_producto];
                const id_producto = presentacion.id_producto;

                const saldo = await InventarioSaldo.findOne({
                    where: {
                        id_producto,
                        id_ubicacion: id_ubicacion_salida,
                    },
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                saldo.cantidad_disponible -= d.cantidadBase;
                await saldo.save({ transaction: t });

                await DetalleVenta.create(
                    {
                        id_venta: venta.id,
                        id_presentacion_producto: d.id_presentacion_producto,
                        cantidad_unidad_venta: d.cantidad_unidad_venta,
                        cantidad_unidad_base: d.cantidadBase,
                        precio_unitario_venta: d.precioFinal,
                        precio_unitario_base: d.precioBase,
                        es_precio_manual: d.esPrecioManual,
                        subtotal_linea: d.subtotalLinea,
                    },
                    { transaction: t }
                );

                await Movimiento.create(
                    {
                        id_producto,
                        id_ubicacion: id_ubicacion_salida,
                        tipo_movimiento: "VENTA",
                        cantidad: -d.cantidadBase,
                        referencia_tipo: "VENTA",
                        id_referencia: venta.id,
                        notas: "Venta directa",
                    },
                    { transaction: t }
                );
            }
        }

        await t.commit();

        const ventaCompleta = await Venta.findByPk(venta.id, {
            include: [
                {
                    model: Usuario,
                    as: "cliente_usuario",
                    attributes: ["id", "nombre", "correo"],
                },
                {
                    model: Ubicacion,
                    as: "ubicacion_salida",
                    attributes: ["id", "nombre", "tipo"],
                },
                {
                    model: DetalleVenta,
                    as: "detalles",
                    include: [
                        {
                            model: Presentacion,
                            as: "presentacion",
                            include: [
                                { model: Producto, as: "producto", attributes: ["id", "nombre"] },
                            ],
                        },
                    ],
                },
                {
                    model: Pedido,
                    as: "pedido",
                },
            ],
        });

        return res.status(201).json({
            mensaje: "Venta registrada correctamente",
            venta: ventaCompleta,
        });
    } catch (err) {
        console.error("Error en crearVenta:", err);
        await t.rollback();
        return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};

module.exports = {
    listarVentas,
    obtenerVentaPorId,
    crearVenta,
};

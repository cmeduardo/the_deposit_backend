const db = require("../models");
const Consignacion = db.consignaciones;
const DetalleConsignacion = db.detalles_consignaciones;
const Usuario = db.usuarios;
const Ubicacion = db.ubicaciones_inventario;
const Presentacion = db.presentaciones_productos;
const Producto = db.productos;
const InventarioSaldo = db.inventarios_saldos;
const MovimientoInventario = db.movimientos_inventarios;
const { Op } = db.Sequelize;

const getFechaHoy = () => new Date().toISOString().slice(0, 10);

// GET /api/consignaciones
// filtros: estado, id_cliente, fecha_desde, fecha_hasta
const listarConsignaciones = async (req, res) => {
  try {
    const { estado, id_cliente, fecha_desde, fecha_hasta } = req.query;
    const where = {};

    if (estado) where.estado = estado;
    if (id_cliente) where.id_usuario_cliente = id_cliente;

    if (fecha_desde || fecha_hasta) {
      where.fecha_envio = {};
      if (fecha_desde) where.fecha_envio[Op.gte] = fecha_desde;
      if (fecha_hasta) where.fecha_envio[Op.lte] = fecha_hasta;
    }

    const consignaciones = await Consignacion.findAll({
      where,
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
          model: DetalleConsignacion,
          as: "detalles",
          include: [
            {
              model: Presentacion,
              as: "presentacion",
              include: [
                {
                  model: Producto,
                  as: "producto",
                  attributes: ["id", "nombre", "marca"],
                },
              ],
            },
          ],
        },
      ],
      order: [["fecha_envio", "DESC"]],
    });

    return res.json(consignaciones);
  } catch (err) {
    console.error("Error en listarConsignaciones:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/consignaciones/:id
const obtenerConsignacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const consignacion = await Consignacion.findByPk(id, {
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
          model: DetalleConsignacion,
          as: "detalles",
          include: [
            {
              model: Presentacion,
              as: "presentacion",
              include: [
                {
                  model: Producto,
                  as: "producto",
                  attributes: ["id", "nombre", "marca"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!consignacion) {
      return res.status(404).json({ mensaje: "Consignación no encontrada" });
    }

    return res.json(consignacion);
  } catch (err) {
    console.error("Error en obtenerConsignacionPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/consignaciones
// Body: { id_usuario_cliente?, id_ubicacion_salida, fecha_envio?, notas?, detalles: [ { id_presentacion_producto, cantidad_unidad_venta, precio_unitario_estimado? } ] }
const crearConsignacion = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    let {
      id_usuario_cliente,
      id_ubicacion_salida,
      fecha_envio,
      notas,
      detalles,
    } = req.body;

    if (!Array.isArray(detalles) || detalles.length === 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ mensaje: "La consignación debe incluir al menos un detalle" });
    }

    if (!id_ubicacion_salida) {
      await t.rollback();
      return res
        .status(400)
        .json({ mensaje: "id_ubicacion_salida es obligatorio" });
    }

    const ubicacion = await Ubicacion.findByPk(id_ubicacion_salida);
    if (!ubicacion) {
      await t.rollback();
      return res
        .status(400)
        .json({ mensaje: "La ubicación de salida indicada no existe" });
    }

    if (id_usuario_cliente) {
      const cliente = await Usuario.findByPk(id_usuario_cliente);
      if (!cliente) {
        await t.rollback();
        return res
          .status(400)
          .json({ mensaje: "El usuario cliente indicado no existe" });
      }
    }

    fecha_envio = fecha_envio || getFechaHoy();

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

    // Calcular requeridos en unidad base por producto y validar stock
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

    // Verificar stock disponible
    for (const idProductoStr of Object.keys(requeridoPorProducto)) {
      const id_producto = parseInt(idProductoStr, 10);
      const requeridoBase = requeridoPorProducto[id_producto];

      let saldo = await InventarioSaldo.findOne({
        where: {
          id_producto,
          id_ubicacion: id_ubicacion_salida,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const disponible = saldo ? saldo.cantidad_disponible : 0;

      if (disponible < requeridoBase) {
        await t.rollback();
        return res.status(400).json({
          mensaje: `Stock insuficiente para el producto ${id_producto}. Disponible: ${disponible}, requerido para consignación: ${requeridoBase}`,
        });
      }
    }

    // Crear consignación
    let subtotalEstimado = 0;

    const consignacion = await Consignacion.create(
      {
        id_usuario_cliente: id_usuario_cliente || null,
        id_ubicacion_salida,
        fecha_envio,
        estado: "ABIERTA",
        subtotal_estimado: 0,
        notas: notas || null,
      },
      { transaction: t }
    );

    // Crear detalles + calcular subtotal_estimado
    for (const det of detalles) {
      const {
        id_presentacion_producto,
        cantidad_unidad_venta,
        precio_unitario_estimado,
      } = det;

      const presentacion = mapaPresentaciones[id_presentacion_producto];
      const unidadesPorVenta = presentacion.unidades_por_unidad_venta || 1;
      const cantidadBase = cantidad_unidad_venta * unidadesPorVenta;

      let precioEstimado =
        precio_unitario_estimado || presentacion.precio_venta_por_defecto || 0;

      const subtotalLinea = precioEstimado * cantidad_unidad_venta;
      subtotalEstimado += subtotalLinea;

      await DetalleConsignacion.create(
        {
          id_consignacion: consignacion.id,
          id_presentacion_producto,
          cantidad_unidad_venta,
          cantidad_unidad_base: cantidadBase,
          precio_unitario_estimado: precioEstimado,
          subtotal_estimado: subtotalLinea,
          notas: det.notas || null,
        },
        { transaction: t }
      );
    }

    // Actualizar inventario (salida por consignación)
    for (const idProductoStr of Object.keys(requeridoPorProducto)) {
      const id_producto = parseInt(idProductoStr, 10);
      const cantidadBase = requeridoPorProducto[id_producto];

      let saldo = await InventarioSaldo.findOne({
        where: {
          id_producto,
          id_ubicacion: id_ubicacion_salida,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!saldo) {
        saldo = await InventarioSaldo.create(
          {
            id_producto,
            id_ubicacion: id_ubicacion_salida,
            cantidad_disponible: 0,
            cantidad_reservada: 0,
          },
          { transaction: t }
        );
      }

      saldo.cantidad_disponible -= cantidadBase;
      if (saldo.cantidad_disponible < 0) saldo.cantidad_disponible = 0;

      await saldo.save({ transaction: t });

      // Registrar movimiento de inventario
      await MovimientoInventario.create(
        {
          id_producto,
          id_ubicacion: id_ubicacion_salida,
          tipo_movimiento: "CONSIGNACION_SALIDA",
          cantidad: -cantidadBase,
          referencia: `Consignación #${consignacion.id}`,
          id_usuario: req.usuario.id,
        },
        { transaction: t }
      );
    }

    consignacion.subtotal_estimado = subtotalEstimado;
    await consignacion.save({ transaction: t });

    await t.commit();

    const consignacionCompleta = await Consignacion.findByPk(consignacion.id, {
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
          model: DetalleConsignacion,
          as: "detalles",
          include: [
            {
              model: Presentacion,
              as: "presentacion",
              include: [
                {
                  model: Producto,
                  as: "producto",
                  attributes: ["id", "nombre", "marca"],
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(201).json({
      mensaje: "Consignación creada y stock descontado correctamente",
      consignacion: consignacionCompleta,
    });
  } catch (err) {
    console.error("Error en crearConsignacion:", err);
    await t.rollback();
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// PATCH /api/consignaciones/:id/cerrar
const cerrarConsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { notas } = req.body;

    const consignacion = await Consignacion.findByPk(id);
    if (!consignacion) {
      return res.status(404).json({ mensaje: "Consignación no encontrada" });
    }

    if (consignacion.estado === "CERRADA") {
      return res
        .status(400)
        .json({ mensaje: "La consignación ya está cerrada" });
    }

    if (consignacion.estado === "CANCELADA") {
      return res
        .status(400)
        .json({ mensaje: "No se puede cerrar una consignación cancelada" });
    }

    consignacion.estado = "CERRADA";
    if (notas) consignacion.notas = notas;
    await consignacion.save();

    return res.json({
      mensaje: "Consignación cerrada correctamente",
      consignacion,
    });
  } catch (err) {
    console.error("Error en cerrarConsignacion:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarConsignaciones,
  obtenerConsignacionPorId,
  crearConsignacion,
  cerrarConsignacion,
};

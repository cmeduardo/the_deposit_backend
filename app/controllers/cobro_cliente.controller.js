const db = require("../models");
const Cobro = db.cobros_clientes;
const Venta = db.ventas;
const Usuario = db.usuarios;
const { Op } = db.Sequelize;

// GET /api/cobros
// filtros opcionales: id_venta, fecha_desde, fecha_hasta
const listarCobros = async (req, res) => {
  try {
    const { id_venta, fecha_desde, fecha_hasta } = req.query;
    const where = {};

    if (id_venta) where.id_venta = id_venta;

    if (fecha_desde || fecha_hasta) {
      where.fecha_cobro = {};
      if (fecha_desde) where.fecha_cobro[Op.gte] = fecha_desde;
      if (fecha_hasta) where.fecha_cobro[Op.lte] = fecha_hasta;
    }

    const cobros = await Cobro.findAll({
      where,
      include: [
        {
          model: Venta,
          as: "venta",
          attributes: ["id", "fecha_venta", "total_general", "estado_pago"],
        },
        {
          model: Usuario,
          as: "usuario_registro",
          attributes: ["id", "nombre", "correo"],
        },
      ],
      order: [["fecha_cobro", "DESC"]],
    });

    return res.json(cobros);
  } catch (err) {
    console.error("Error en listarCobros:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/cobros/:id
const obtenerCobroPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const cobro = await Cobro.findByPk(id, {
      include: [
        {
          model: Venta,
          as: "venta",
          attributes: ["id", "fecha_venta", "total_general", "estado_pago"],
        },
        {
          model: Usuario,
          as: "usuario_registro",
          attributes: ["id", "nombre", "correo"],
        },
      ],
    });

    if (!cobro) {
      return res.status(404).json({ mensaje: "Cobro no encontrado" });
    }

    return res.json(cobro);
  } catch (err) {
    console.error("Error en obtenerCobroPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/cobros
// Body: { id_venta, fecha_cobro, monto, metodo_pago?, referencia_pago?, notas? }
const crearCobro = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      id_venta,
      fecha_cobro,
      monto,
      metodo_pago,
      referencia_pago,
      notas,
    } = req.body;

    if (!id_venta || !fecha_cobro || !monto) {
      await t.rollback();
      return res.status(400).json({
        mensaje: "id_venta, fecha_cobro y monto son obligatorios",
      });
    }

    // Bloqueamos solo la venta
    const venta = await Venta.findByPk(id_venta, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!venta) {
      await t.rollback();
      return res.status(400).json({ mensaje: "La venta indicada no existe" });
    }

    if (venta.estado === "ANULADA") {
      await t.rollback();
      return res.status(400).json({
        mensaje: "No se pueden registrar cobros para ventas anuladas",
      });
    }

    const totalVenta = parseFloat(venta.total_general);

    // Sumar cobros previos
    const totalCobrosPrevios =
      (await Cobro.sum("monto", {
        where: { id_venta },
        transaction: t,
      })) || 0;

    const montoNuevo = parseFloat(monto);
    const totalCobradoNuevo = totalCobrosPrevios + montoNuevo;

    if (totalCobradoNuevo - totalVenta > 0.01) {
      await t.rollback();
      return res.status(400).json({
        mensaje: `El monto del cobro excede el saldo pendiente de la venta. Total venta: ${totalVenta}, ya cobrado: ${totalCobrosPrevios}, intento: ${montoNuevo}`,
      });
    }

    // Crear cobro
    const cobro = await Cobro.create(
      {
        id_venta,
        id_usuario_registro: req.usuario.id,
        fecha_cobro,
        monto: montoNuevo,
        metodo_pago: metodo_pago || null,
        referencia_pago: referencia_pago || null,
        notas: notas || null,
      },
      { transaction: t }
    );

    // Actualizar estado_pago según lo cobrado
    let nuevoEstadoPago = "PENDIENTE";
    if (totalCobradoNuevo <= 0.01) {
      nuevoEstadoPago = "PENDIENTE";
    } else if (Math.abs(totalCobradoNuevo - totalVenta) <= 0.01) {
      nuevoEstadoPago = "PAGADO";
    } else {
      nuevoEstadoPago = "PARCIAL";
    }

    venta.estado_pago = nuevoEstadoPago;
    await venta.save({ transaction: t });

    await t.commit();

    // Traer cobro con relaciones para respuesta
    const cobroCompleto = await Cobro.findByPk(cobro.id, {
      include: [
        {
          model: Venta,
          as: "venta",
          attributes: ["id", "fecha_venta", "total_general", "estado_pago"],
        },
        {
          model: Usuario,
          as: "usuario_registro",
          attributes: ["id", "nombre", "correo"],
        },
      ],
    });

    return res.status(201).json({
      mensaje: "Cobro registrado correctamente",
      cobro: cobroCompleto,
    });
  } catch (err) {
    console.error("Error en crearCobro:", err);
    await t.rollback();
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/cuentas-por-cobrar
// filtros opcionales: id_cliente, fecha_desde, fecha_hasta
const listarCuentasPorCobrar = async (req, res) => {
  try {
    const { id_cliente, fecha_desde, fecha_hasta } = req.query;

    const whereVenta = {
      estado: { [Op.ne]: "ANULADA" },
    };

    if (id_cliente) {
      whereVenta.id_usuario_cliente = id_cliente;
    }

    if (fecha_desde || fecha_hasta) {
      whereVenta.fecha_venta = {};
      if (fecha_desde) whereVenta.fecha_venta[Op.gte] = fecha_desde;
      if (fecha_hasta) whereVenta.fecha_venta[Op.lte] = fecha_hasta;
    }

    const ventas = await Venta.findAll({
      where: whereVenta,
      include: [
        {
          model: Usuario,
          as: "cliente_usuario",
          attributes: ["id", "nombre", "correo"],
        },
        {
          model: Cobro,
          as: "cobros",
          attributes: ["id", "fecha_cobro", "monto"],
        },
      ],
      order: [["fecha_venta", "ASC"]],
    });

    const resultado = ventas
      .map((v) => {
        const totalVenta = parseFloat(v.total_general);
        const cobros = v.cobros || [];
        const totalCobrado = cobros.reduce(
          (acc, c) => acc + parseFloat(c.monto),
          0
        );
        const saldo = totalVenta - totalCobrado;

        return {
          id_venta: v.id,
          fecha_venta: v.fecha_venta,
          cliente: v.cliente_usuario
            ? {
                id: v.cliente_usuario.id,
                nombre: v.cliente_usuario.nombre,
                correo: v.cliente_usuario.correo,
              }
            : null,
          total_venta: totalVenta,
          total_cobrado: totalCobrado,
          saldo_pendiente: saldo,
          estado_pago: v.estado_pago,
        };
      })
      .filter((r) => r.saldo_pendiente > 0.01); // solo las que deben algo

    return res.json({
      cantidad_ventas: resultado.length,
      total_saldo_pendiente: resultado.reduce(
        (acc, r) => acc + r.saldo_pendiente,
        0
      ),
      cuentas: resultado,
    });
  } catch (err) {
    console.error("Error en listarCuentasPorCobrar:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarCobros,
  obtenerCobroPorId,
  crearCobro,
  listarCuentasPorCobrar,
};

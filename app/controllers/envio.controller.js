const db = require("../models");
const Envio = db.envios;
const Pedido = db.pedidos;
const Venta = db.ventas;
const { Op } = db.Sequelize;

const getFechaHoy = () => new Date().toISOString().slice(0, 10);

// GET /api/envios
// filtros: estado_envio, id_pedido, id_venta, fecha_desde, fecha_hasta
const listarEnvios = async (req, res) => {
  try {
    const { estado_envio, id_pedido, id_venta, fecha_desde, fecha_hasta } =
      req.query;

    const where = {};

    if (estado_envio) {
      where.estado_envio = estado_envio;
    }

    if (id_pedido) {
      where.id_pedido = id_pedido;
    }

    if (id_venta) {
      where.id_venta = id_venta;
    }

    if (fecha_desde || fecha_hasta) {
      where.fecha_envio = {};
      if (fecha_desde) where.fecha_envio[Op.gte] = fecha_desde;
      if (fecha_hasta) where.fecha_envio[Op.lte] = fecha_hasta;
    }

    const envios = await Envio.findAll({
      where,
      include: [
        {
          model: Pedido,
          as: "pedido",
          attributes: ["id", "estado", "fecha_pedido", "fuente"], 
        },
        {
          model: Venta,
          as: "venta",
          attributes: ["id", "fecha_venta", "total_general", "estado_pago"],
        },
      ],
      order: [["fecha_envio", "DESC"]],
    });

    return res.json(envios);
  } catch (err) {
    console.error("Error en listarEnvios:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/envios/:id
const obtenerEnvioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const envio = await Envio.findByPk(id, {
      include: [
        {
          model: Pedido,
          as: "pedido",
          attributes: ["id", "estado", "fecha_pedido", "fuente"],
        },
        {
          model: Venta,
          as: "venta",
          attributes: ["id", "fecha_venta", "total_general", "estado_pago"],
        },
      ],
    });

    if (!envio) {
      return res.status(404).json({ mensaje: "Envío no encontrado" });
    }

    return res.json(envio);
  } catch (err) {
    console.error("Error en obtenerEnvioPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/envios
// al menos uno de: id_pedido, id_venta
const crearEnvio = async (req, res) => {
  try {
    let {
      id_pedido,
      id_venta,
      fecha_envio,
      estado_envio,
      nombre_destinatario,
      direccion_entrega,
      referencia_direccion,
      telefono_contacto,
      zona,
      ciudad,
      transportista,
      tipo_envio,
      costo_cobrado,
      costo_real,
      notas,
    } = req.body;

    if (!id_pedido && !id_venta) {
      return res.status(400).json({
        mensaje: "Debes indicar al menos id_pedido o id_venta",
      });
    }

    if (id_pedido) {
      const pedido = await Pedido.findByPk(id_pedido);
      if (!pedido) {
        return res
          .status(400)
          .json({ mensaje: "El pedido indicado no existe" });
      }
    }

    if (id_venta) {
      const venta = await Venta.findByPk(id_venta);
      if (!venta) {
        return res
          .status(400)
          .json({ mensaje: "La venta indicada no existe" });
      }
    }

    fecha_envio = fecha_envio || getFechaHoy();
    estado_envio = estado_envio || "PENDIENTE";

    const envio = await Envio.create({
      id_pedido: id_pedido || null,
      id_venta: id_venta || null,
      fecha_envio,
      estado_envio,
      nombre_destinatario: nombre_destinatario || null,
      direccion_entrega: direccion_entrega || null,
      referencia_direccion: referencia_direccion || null,
      telefono_contacto: telefono_contacto || null,
      zona: zona || null,
      ciudad: ciudad || null,
      transportista: transportista || null,
      tipo_envio: tipo_envio || null,
      costo_cobrado: costo_cobrado || null,
      costo_real: costo_real || null,
      notas: notas || null,
    });

    const envioCompleto = await Envio.findByPk(envio.id, {
      include: [
        { model: Pedido, as: "pedido", attributes: ["id", "estado", "fecha_pedido", "fuente"] },
        {
          model: Venta,
          as: "venta",
          attributes: ["id", "fecha_venta", "total_general", "estado_pago"],
        },
      ],
    });

    return res.status(201).json({
      mensaje: "Envío registrado correctamente",
      envio: envioCompleto,
    });
  } catch (err) {
    console.error("Error en crearEnvio:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// PATCH /api/envios/:id
const actualizarEnvio = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fecha_envio,
      estado_envio,
      nombre_destinatario,
      direccion_entrega,
      referencia_direccion,
      telefono_contacto,
      zona,
      ciudad,
      transportista,
      tipo_envio,
      costo_cobrado,
      costo_real,
      notas,
    } = req.body;

    const envio = await Envio.findByPk(id);
    if (!envio) {
      return res.status(404).json({ mensaje: "Envío no encontrado" });
    }

    if (fecha_envio !== undefined) envio.fecha_envio = fecha_envio;
    if (estado_envio !== undefined) envio.estado_envio = estado_envio;
    if (nombre_destinatario !== undefined)
      envio.nombre_destinatario = nombre_destinatario;
    if (direccion_entrega !== undefined)
      envio.direccion_entrega = direccion_entrega;
    if (referencia_direccion !== undefined)
      envio.referencia_direccion = referencia_direccion;
    if (telefono_contacto !== undefined)
      envio.telefono_contacto = telefono_contacto;
    if (zona !== undefined) envio.zona = zona;
    if (ciudad !== undefined) envio.ciudad = ciudad;
    if (transportista !== undefined) envio.transportista = transportista;
    if (tipo_envio !== undefined) envio.tipo_envio = tipo_envio;
    if (costo_cobrado !== undefined) envio.costo_cobrado = costo_cobrado;
    if (costo_real !== undefined) envio.costo_real = costo_real;
    if (notas !== undefined) envio.notas = notas;

    await envio.save();

    const envioCompleto = await Envio.findByPk(envio.id, {
      include: [
        { model: Pedido, as: "pedido", attributes: ["id", "estado", "fecha_pedido", "fuente"]},
        {
          model: Venta,
          as: "venta",
          attributes: ["id", "fecha_venta", "total_general", "estado_pago"],
        },
      ],
    });

    return res.json({
      mensaje: "Envío actualizado correctamente",
      envio: envioCompleto,
    });
  } catch (err) {
    console.error("Error en actualizarEnvio:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarEnvios,
  obtenerEnvioPorId,
  crearEnvio,
  actualizarEnvio,
};

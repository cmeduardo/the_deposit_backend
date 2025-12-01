const db = require("../models");
const InventarioSaldo = db.inventarios_saldos;
const Producto = db.productos;
const Ubicacion = db.ubicaciones_inventario;
const Movimiento = db.movimientos_inventario;

// GET /api/inventario
const listarSaldos = async (req, res) => {
  try {
    const { id_producto, id_ubicacion } = req.query;
    const where = {};
    if (id_producto) where.id_producto = id_producto;
    if (id_ubicacion) where.id_ubicacion = id_ubicacion;

    const saldos = await InventarioSaldo.findAll({
      where,
      include: [
        { model: Producto, as: "producto", attributes: ["id", "nombre"] },
        { model: Ubicacion, as: "ubicacion", attributes: ["id", "nombre", "tipo"] },
      ],
    });

    return res.json(saldos);
  } catch (err) {
    console.error("Error en listarSaldos:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/inventario/ajuste
// Ajuste manual (por ahora simple: suma o resta cantidad_disponible)
const ajustarInventario = async (req, res) => {
  try {
    const { id_producto, id_ubicacion, cantidad, motivo } = req.body;

    if (!id_producto || !id_ubicacion || !cantidad) {
      return res.status(400).json({
        mensaje: "id_producto, id_ubicacion y cantidad son obligatorios",
      });
    }

    const producto = await Producto.findByPk(id_producto);
    if (!producto) {
      return res.status(400).json({ mensaje: "El producto no existe" });
    }

    const ubicacion = await Ubicacion.findByPk(id_ubicacion);
    if (!ubicacion) {
      return res.status(400).json({ mensaje: "La ubicación no existe" });
    }

    let saldo = await InventarioSaldo.findOne({
      where: { id_producto, id_ubicacion },
    });

    if (!saldo) {
      saldo = await InventarioSaldo.create({
        id_producto,
        id_ubicacion,
        cantidad_disponible: 0,
        cantidad_reservada: 0,
      });
    }

    saldo.cantidad_disponible += cantidad;
    await saldo.save();

    const movimiento = await Movimiento.create({
      id_producto,
      id_ubicacion,
      tipo_movimiento: "AJUSTE",
      cantidad,
      referencia_tipo: "AJUSTE_MANUAL",
      id_referencia: null,
      notas: motivo || null,
    });

    return res.status(201).json({
      mensaje: "Inventario ajustado correctamente",
      saldo,
      movimiento,
    });
  } catch (err) {
    console.error("Error en ajustarInventario:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarSaldos,
  ajustarInventario,
};

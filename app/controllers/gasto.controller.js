const db = require("../models");
const Gasto = db.gastos;
const CategoriaGasto = db.categorias_gastos;
const Usuario = db.usuarios;
const { Op } = db.Sequelize;

// GET /api/gastos
// filtros: fecha_desde, fecha_hasta, tipo, id_categoria_gasto
const listarGastos = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta, tipo, id_categoria_gasto } = req.query;

    const where = {};

    if (fecha_desde || fecha_hasta) {
      where.fecha_gasto = {};
      if (fecha_desde) {
        where.fecha_gasto[Op.gte] = fecha_desde;
      }
      if (fecha_hasta) {
        where.fecha_gasto[Op.lte] = fecha_hasta;
      }
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (id_categoria_gasto) {
      where.id_categoria_gasto = id_categoria_gasto;
    }

    const gastos = await Gasto.findAll({
      where,
      include: [
        {
          model: CategoriaGasto,
          as: "categoria_gasto",
          attributes: ["id", "nombre", "tipo_por_defecto"],
        },
        {
          model: Usuario,
          as: "usuario_registro",
          attributes: ["id", "nombre", "correo"],
        },
      ],
      order: [["fecha_gasto", "DESC"]],
    });

    return res.json(gastos);
  } catch (err) {
    console.error("Error en listarGastos:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/gastos/resumen-mensual?anio=2025&mes=11
const resumenMensual = async (req, res) => {
  try {
    let { anio, mes } = req.query;

    const hoy = new Date();
    if (!anio) anio = hoy.getFullYear();
    if (!mes) mes = hoy.getMonth() + 1;

    const mesStr = mes.toString().padStart(2, "0");
    const inicio = `${anio}-${mesStr}-01`;

    // fin = último día del mes
    const finDate = new Date(anio, mes, 0);
    const fin = finDate.toISOString().slice(0, 10);

    const where = {
      fecha_gasto: {
        [Op.between]: [inicio, fin],
      },
    };

    const gastos = await Gasto.findAll({
      where,
      include: [
        {
          model: CategoriaGasto,
          as: "categoria_gasto",
          attributes: ["id", "nombre", "tipo_por_defecto"],
        },
      ],
    });

    let total = 0;
    let totalFijo = 0;
    let totalVariable = 0;
    const porCategoria = {};

    for (const g of gastos) {
      const monto = parseFloat(g.monto);
      total += monto;
      if (g.tipo === "FIJO") totalFijo += monto;
      if (g.tipo === "VARIABLE") totalVariable += monto;

      const catNombre = g.categoria_gasto
        ? g.categoria_gasto.nombre
        : "SIN_CATEGORIA";

      if (!porCategoria[catNombre]) {
        porCategoria[catNombre] = 0;
      }
      porCategoria[catNombre] += monto;
    }

    return res.json({
      anio: parseInt(anio, 10),
      mes: parseInt(mes, 10),
      rango_fechas: { inicio, fin },
      total,
      total_fijo: totalFijo,
      total_variable: totalVariable,
      por_categoria: porCategoria,
      cantidad_registros: gastos.length,
    });
  } catch (err) {
    console.error("Error en resumenMensual:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/gastos/:id
const obtenerGastoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const gasto = await Gasto.findByPk(id, {
      include: [
        {
          model: CategoriaGasto,
          as: "categoria_gasto",
          attributes: ["id", "nombre", "tipo_por_defecto"],
        },
        {
          model: Usuario,
          as: "usuario_registro",
          attributes: ["id", "nombre", "correo"],
        },
      ],
    });

    if (!gasto) {
      return res.status(404).json({ mensaje: "Gasto no encontrado" });
    }

    return res.json(gasto);
  } catch (err) {
    console.error("Error en obtenerGastoPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/gastos
const crearGasto = async (req, res) => {
  try {
    const {
      id_categoria_gasto,
      fecha_gasto,
      tipo,
      descripcion,
      monto,
      metodo_pago,
      referencia_pago,
      es_recurrente,
      periodo_recurrencia,
      notas,
    } = req.body;

    if (!fecha_gasto || !tipo || !descripcion || !monto) {
      return res.status(400).json({
        mensaje: "fecha_gasto, tipo, descripcion y monto son obligatorios",
      });
    }

    if (!["FIJO", "VARIABLE"].includes(tipo)) {
      return res.status(400).json({
        mensaje: 'tipo debe ser "FIJO" o "VARIABLE"',
      });
    }

    if (id_categoria_gasto) {
      const categoria = await CategoriaGasto.findByPk(id_categoria_gasto);
      if (!categoria) {
        return res.status(400).json({
          mensaje: "La categoría de gasto indicada no existe",
        });
      }
    }

    if (es_recurrente && !periodo_recurrencia) {
      return res.status(400).json({
        mensaje: "Si es_recurrente es true, periodo_recurrencia es obligatorio",
      });
    }

    const gasto = await Gasto.create({
      id_categoria_gasto: id_categoria_gasto || null,
      id_usuario_registro: req.usuario.id, // desde el token
      fecha_gasto,
      tipo,
      descripcion,
      monto,
      metodo_pago: metodo_pago || null,
      referencia_pago: referencia_pago || null,
      es_recurrente: es_recurrente || false,
      periodo_recurrencia: es_recurrente ? periodo_recurrencia : null,
      notas: notas || null,
    });

    return res.status(201).json({
      mensaje: "Gasto registrado correctamente",
      gasto,
    });
  } catch (err) {
    console.error("Error en crearGasto:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// PATCH /api/gastos/:id
const actualizarGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_categoria_gasto,
      fecha_gasto,
      tipo,
      descripcion,
      monto,
      metodo_pago,
      referencia_pago,
      es_recurrente,
      periodo_recurrencia,
      notas,
    } = req.body;

    const gasto = await Gasto.findByPk(id);
    if (!gasto) {
      return res.status(404).json({ mensaje: "Gasto no encontrado" });
    }

    if (id_categoria_gasto !== undefined) {
      if (id_categoria_gasto === null) {
        gasto.id_categoria_gasto = null;
      } else {
        const categoria = await CategoriaGasto.findByPk(id_categoria_gasto);
        if (!categoria) {
          return res.status(400).json({
            mensaje: "La categoría de gasto indicada no existe",
          });
        }
        gasto.id_categoria_gasto = id_categoria_gasto;
      }
    }

    if (fecha_gasto !== undefined) gasto.fecha_gasto = fecha_gasto;
    if (tipo !== undefined) {
      if (!["FIJO", "VARIABLE"].includes(tipo)) {
        return res.status(400).json({
          mensaje: 'tipo debe ser "FIJO" o "VARIABLE"',
        });
      }
      gasto.tipo = tipo;
    }
    if (descripcion !== undefined) gasto.descripcion = descripcion;
    if (monto !== undefined) gasto.monto = monto;
    if (metodo_pago !== undefined) gasto.metodo_pago = metodo_pago;
    if (referencia_pago !== undefined) gasto.referencia_pago = referencia_pago;

    if (es_recurrente !== undefined) {
      gasto.es_recurrente = es_recurrente;
      if (!es_recurrente) {
        gasto.periodo_recurrencia = null;
      }
    }

    if (periodo_recurrencia !== undefined) {
      gasto.periodo_recurrencia = periodo_recurrencia;
    }

    if (notas !== undefined) gasto.notas = notas;

    await gasto.save();

    return res.json({
      mensaje: "Gasto actualizado correctamente",
      gasto,
    });
  } catch (err) {
    console.error("Error en actualizarGasto:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarGastos,
  resumenMensual,
  obtenerGastoPorId,
  crearGasto,
  actualizarGasto,
};

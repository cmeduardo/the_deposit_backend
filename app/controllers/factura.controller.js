// app/controllers/factura.controller.js
const db = require("../models");
const Sequelize = db.Sequelize;
const { Op } = Sequelize;

const Factura = db.facturas;
const Venta = db.ventas;
const DetalleVenta = db.detalles_ventas;
const Presentacion = db.presentaciones_productos;
const Producto = db.productos;

/**
 * POST /api/facturas
 * Crea una factura a partir de una venta existente
 *
 * Body:
 * {
 *   "id_venta": 1,
 *   "serie": "A",
 *   "numero": "000001",
 *   "tipo_documento": "FACTURA",
 *   "nombre_cliente_factura": "Nombre en factura",
 *   "nit_cliente": "1234567-8",
 *   "direccion_cliente": "Dirección...",
 *   "notas": "Opcional"
 * }
 */
exports.crearFactura = async (req, res) => {
  const {
    id_venta,
    serie,
    numero,
    tipo_documento,
    nombre_cliente_factura,
    nit_cliente,
    direccion_cliente,
    notas,
  } = req.body;

  if (!id_venta || !numero) {
    return res.status(400).json({
      mensaje: "id_venta y numero son obligatorios para emitir factura",
    });
  }

  const t = await db.sequelize.transaction();

  try {
    // 1. Validar venta
    const venta = await Venta.findByPk(id_venta, { transaction: t });

    if (!venta) {
      await t.rollback();
      return res.status(404).json({ mensaje: "Venta no encontrada" });
    }

    // 2. Verificar que no exista ya factura para esa venta
    const facturaExistente = await Factura.findOne({
      where: { id_venta },
      transaction: t,
    });

    if (facturaExistente) {
      await t.rollback();
      return res.status(400).json({
        mensaje: "Ya existe una factura asociada a esta venta",
        id_factura: facturaExistente.id,
      });
    }

    // 3. Tomar datos de la venta como default
    const fechaEmision = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const total = Number(venta.total_general) || 0;
    const impuestos = Number(venta.impuestos) || 0;

    const factura = await Factura.create(
      {
        id_venta,
        serie: serie || null,
        numero,
        tipo_documento: tipo_documento || "FACTURA",
        fecha_emision: fechaEmision,
        nombre_cliente_factura:
          nombre_cliente_factura || venta.nombre_cliente || "CONSUMIDOR FINAL",
        nit_cliente: nit_cliente || "CF",
        direccion_cliente: direccion_cliente || null,
        impuestos,
        total_facturado: total,
        estado: "EMITIDA",
        notas: notas || null,
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      mensaje: "Factura emitida correctamente",
      factura,
    });
  } catch (err) {
    console.error("Error en crearFactura:", err);
    await t.rollback();
    return res
      .status(500)
      .json({ mensaje: "Error interno al emitir la factura" });
  }
};

/**
 * GET /api/facturas
 * Listar facturas con filtros opcionales:
 * ?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD&nit=CF&estado=EMITIDA
 */
exports.listarFacturas = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta, nit, estado } = req.query;

    const where = {};

    if (fecha_desde || fecha_hasta) {
      where.fecha_emision = {};
      if (fecha_desde) where.fecha_emision[Op.gte] = fecha_desde;
      if (fecha_hasta) where.fecha_emision[Op.lte] = fecha_hasta;
    }

    if (nit) {
      where.nit_cliente = nit;
    }

    if (estado) {
      where.estado = estado;
    }

    const facturas = await Factura.findAll({
      where,
      order: [["fecha_emision", "DESC"], ["id", "DESC"]],
      include: [
        {
          model: Venta,
          as: "venta",
          attributes: [
            "id",
            "fecha_venta",
            "nombre_cliente",
            "total_general",
            "estado_pago",
          ],
        },
      ],
    });

    return res.json(facturas);
  } catch (err) {
    console.error("Error en listarFacturas:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno al listar facturas" });
  }
};

/**
 * GET /api/facturas/:id
 * Obtiene una factura con su venta y detalles de venta
 */
exports.obtenerFacturaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const factura = await Factura.findByPk(id, {
      include: [
        {
          model: Venta,
          as: "venta",
          include: [
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
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!factura) {
      return res.status(404).json({ mensaje: "Factura no encontrada" });
    }

    return res.json(factura);
  } catch (err) {
    console.error("Error en obtenerFacturaPorId:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno al obtener la factura" });
  }
};

/**
 * GET /api/facturas/venta/:id_venta
 * Obtiene la factura asociada a una venta (si existe)
 */
exports.obtenerFacturaPorVenta = async (req, res) => {
  try {
    const { id_venta } = req.params;

    const factura = await Factura.findOne({
      where: { id_venta },
      include: [
        {
          model: Venta,
          as: "venta",
        },
      ],
    });

    if (!factura) {
      return res.status(404).json({
        mensaje: "No existe factura asociada a esta venta",
      });
    }

    return res.json(factura);
  } catch (err) {
    console.error("Error en obtenerFacturaPorVenta:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno al obtener factura por venta" });
  }
};

/**
 * POST /api/facturas/:id/anular
 * Marca una factura como ANULADA
 * (no toca la venta ni inventario por ahora)
 */
exports.anularFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body || {};

    const factura = await Factura.findByPk(id);

    if (!factura) {
      return res.status(404).json({ mensaje: "Factura no encontrada" });
    }

    if (factura.estado === "ANULADA") {
      return res.status(400).json({ mensaje: "La factura ya está anulada" });
    }

    factura.estado = "ANULADA";
    if (motivo) {
      factura.notas = (factura.notas || "") + ` [ANULADA: ${motivo}]`;
    }

    await factura.save();

    return res.json({
      mensaje: "Factura anulada correctamente",
      factura,
    });
  } catch (err) {
    console.error("Error en anularFactura:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno al anular la factura" });
  }
};

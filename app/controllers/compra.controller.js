const db = require("../models");
const Compra = db.compras;
const DetalleCompra = db.detalles_compras;
const Proveedor = db.proveedores;
const Ubicacion = db.ubicaciones_inventario;
const Presentacion = db.presentaciones_productos;
const Producto = db.productos;
const InventarioSaldo = db.inventarios_saldos;
const Movimiento = db.movimientos_inventario;

// GET /api/compras
const listarCompras = async (req, res) => {
  try {
    const compras = await Compra.findAll({
      include: [
        { model: Proveedor, as: "proveedor", attributes: ["id", "nombre"] },
        { model: Ubicacion, as: "ubicacion", attributes: ["id", "nombre", "tipo"] },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json(compras);
  } catch (err) {
    console.error("Error en listarCompras:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/compras/:id
const obtenerCompraPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await Compra.findByPk(id, {
      include: [
        { model: Proveedor, as: "proveedor", attributes: ["id", "nombre"] },
        { model: Ubicacion, as: "ubicacion", attributes: ["id", "nombre", "tipo"] },
        {
          model: DetalleCompra,
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
      ],
    });

    if (!compra) {
      return res.status(404).json({ mensaje: "Compra no encontrada" });
    }

    return res.json(compra);
  } catch (err) {
    console.error("Error en obtenerCompraPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/compras
// Body: { id_proveedor, id_ubicacion, fecha_compra, numero_documento, costos_adicionales, notas, detalles: [...] }
const crearCompra = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      id_proveedor,
      id_ubicacion,
      fecha_compra,
      numero_documento,
      costos_adicionales,
      notas,
      detalles,
    } = req.body;

    if (!id_proveedor || !id_ubicacion || !fecha_compra || !Array.isArray(detalles) || detalles.length === 0) {
      await t.rollback();
      return res.status(400).json({
        mensaje:
          "id_proveedor, id_ubicacion, fecha_compra y detalles (no vacío) son obligatorios",
      });
    }

    const proveedor = await Proveedor.findByPk(id_proveedor);
    if (!proveedor) {
      await t.rollback();
      return res.status(400).json({ mensaje: "El proveedor no existe" });
    }

    const ubicacion = await Ubicacion.findByPk(id_ubicacion);
    if (!ubicacion) {
      await t.rollback();
      return res.status(400).json({ mensaje: "La ubicación no existe" });
    }

    let subtotal = 0;

    // Creamos la compra con valores temporales de totales
    const compra = await Compra.create(
      {
        id_proveedor,
        id_ubicacion,
        fecha_compra,
        numero_documento: numero_documento || null,
        subtotal: 0,
        impuestos: 0,
        costos_adicionales: costos_adicionales || 0,
        total: 0,
        notas: notas || null,
      },
      { transaction: t }
    );

    for (const det of detalles) {
      const {
        id_presentacion_producto,
        cantidad_unidad_venta,
        costo_unitario_unidad_venta,
        precio_referencia,
        precio_competencia,
        fecha_vencimiento,
      } = det;

      if (!id_presentacion_producto || !cantidad_unidad_venta || !costo_unitario_unidad_venta) {
        await t.rollback();
        return res.status(400).json({
          mensaje:
            "Cada detalle debe incluir id_presentacion_producto, cantidad_unidad_venta y costo_unitario_unidad_venta",
        });
      }

      const presentacion = await Presentacion.findByPk(id_presentacion_producto, {
        include: [{ model: Producto, as: "producto" }],
      });

      if (!presentacion) {
        await t.rollback();
        return res
          .status(400)
          .json({ mensaje: `La presentación ${id_presentacion_producto} no existe` });
      }

      const unidadesPorVenta = presentacion.unidades_por_unidad_venta || 1;
      const cantidadBase = cantidad_unidad_venta * unidadesPorVenta;

      const costoUnitarioBase =
        parseFloat(costo_unitario_unidad_venta) / unidadesPorVenta;

      const lineaSubtotal =
        parseFloat(costo_unitario_unidad_venta) * cantidad_unidad_venta;
      subtotal += lineaSubtotal;

      const detalle = await DetalleCompra.create(
        {
          id_compra: compra.id,
          id_presentacion_producto,
          cantidad_unidad_venta,
          cantidad_unidad_base: cantidadBase,
          costo_unitario_unidad_venta,
          costo_unitario_unidad_base: costoUnitarioBase,
          precio_referencia: precio_referencia || null,
          precio_competencia: precio_competencia || null,
          fecha_vencimiento: fecha_vencimiento || null,
        },
        { transaction: t }
      );

      // Actualizar saldo de inventario
      let saldo = await InventarioSaldo.findOne({
        where: {
          id_producto: presentacion.id_producto,
          id_ubicacion,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!saldo) {
        saldo = await InventarioSaldo.create(
          {
            id_producto: presentacion.id_producto,
            id_ubicacion,
            cantidad_disponible: 0,
            cantidad_reservada: 0,
          },
          { transaction: t }
        );
      }

      saldo.cantidad_disponible += cantidadBase;
      await saldo.save({ transaction: t });

      // Registrar movimiento de inventario
      await Movimiento.create(
        {
          id_producto: presentacion.id_producto,
          id_ubicacion,
          tipo_movimiento: "COMPRA",
          cantidad: cantidadBase,
          referencia_tipo: "COMPRA",
          id_referencia: compra.id,
          notas: `Compra detalle ${detalle.id}`,
        },
        { transaction: t }
      );
    }

    compra.subtotal = subtotal;
    // Por ahora impuestos = 0, podrías calcular después
    compra.total =
      subtotal +
      parseFloat(compra.impuestos || 0) +
      parseFloat(compra.costos_adicionales || 0);

    await compra.save({ transaction: t });

    await t.commit();

    const compraCompleta = await Compra.findByPk(compra.id, {
      include: [
        { model: Proveedor, as: "proveedor", attributes: ["id", "nombre"] },
        { model: Ubicacion, as: "ubicacion", attributes: ["id", "nombre", "tipo"] },
        {
          model: DetalleCompra,
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
      ],
    });

    return res.status(201).json({
      mensaje: "Compra creada correctamente",
      compra: compraCompleta,
    });
  } catch (err) {
    console.error("Error en crearCompra:", err);
    await t.rollback();
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarCompras,
  obtenerCompraPorId,
  crearCompra,
};

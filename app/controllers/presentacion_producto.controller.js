const db = require("../models");
const PresentacionProducto = db.presentaciones_productos;
const Producto = db.productos;
const Unidad = db.unidades;

// GET /api/presentaciones-productos
const listarPresentaciones = async (req, res) => {
  try {
    const { id_producto, activo } = req.query;

    const where = {};
    if (id_producto !== undefined) where.id_producto = id_producto;
    if (activo !== undefined) where.activo = activo === "true";

    const presentaciones = await PresentacionProducto.findAll({
      where,
      include: [
        { model: Producto, as: "producto", attributes: ["id", "nombre"] },
        { model: Unidad, as: "unidad_venta", attributes: ["id", "codigo", "nombre"] },
      ],
    });

    return res.json(presentaciones);
  } catch (err) {
    console.error("Error en listarPresentaciones:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/presentaciones-productos/:id
const obtenerPresentacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const presentacion = await PresentacionProducto.findByPk(id, {
      include: [
        { model: Producto, as: "producto", attributes: ["id", "nombre"] },
        { model: Unidad, as: "unidad_venta", attributes: ["id", "codigo", "nombre"] },
      ],
    });

    if (!presentacion) {
      return res.status(404).json({ mensaje: "Presentación no encontrada" });
    }

    return res.json(presentacion);
  } catch (err) {
    console.error("Error en obtenerPresentacionPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/presentaciones-productos
const crearPresentacion = async (req, res) => {
  try {
    const {
      id_producto,
      nombre,
      codigo_barras,
      id_unidad_venta,
      unidades_por_unidad_venta,
      precio_venta_por_defecto,
      precio_minimo,
      activo,
    } = req.body;

    if (!id_producto || !nombre || !id_unidad_venta) {
      return res.status(400).json({
        mensaje: "id_producto, nombre e id_unidad_venta son obligatorios",
      });
    }

    const producto = await Producto.findByPk(id_producto);
    if (!producto) {
      return res.status(400).json({ mensaje: "El producto indicado no existe" });
    }

    const unidadVenta = await Unidad.findByPk(id_unidad_venta);
    if (!unidadVenta) {
      return res.status(400).json({ mensaje: "La unidad de venta no existe" });
    }

    if (codigo_barras) {
      const existente = await PresentacionProducto.findOne({
        where: { codigo_barras },
      });
      if (existente) {
        return res
          .status(409)
          .json({ mensaje: "Ya existe una presentación con ese código de barras" });
      }
    }

    const presentacion = await PresentacionProducto.create({
      id_producto,
      nombre,
      codigo_barras: codigo_barras || null,
      id_unidad_venta,
      unidades_por_unidad_venta:
        unidades_por_unidad_venta !== undefined ? unidades_por_unidad_venta : 1,
      precio_venta_por_defecto:
        precio_venta_por_defecto !== undefined ? precio_venta_por_defecto : null,
      precio_minimo: precio_minimo !== undefined ? precio_minimo : null,
      activo: activo !== undefined ? activo : true,
    });

    return res.status(201).json({
      mensaje: "Presentación creada correctamente",
      presentacion,
    });
  } catch (err) {
    console.error("Error en crearPresentacion:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// PATCH /api/presentaciones-productos/:id
const actualizarPresentacion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_producto,
      nombre,
      codigo_barras,
      id_unidad_venta,
      unidades_por_unidad_venta,
      precio_venta_por_defecto,
      precio_minimo,
      activo,
    } = req.body;

    const presentacion = await PresentacionProducto.findByPk(id);
    if (!presentacion) {
      return res.status(404).json({ mensaje: "Presentación no encontrada" });
    }

    if (id_producto !== undefined && id_producto !== presentacion.id_producto) {
      const producto = await Producto.findByPk(id_producto);
      if (!producto) {
        return res.status(400).json({ mensaje: "El producto indicado no existe" });
      }
      presentacion.id_producto = id_producto;
    }

    if (
      id_unidad_venta !== undefined &&
      id_unidad_venta !== presentacion.id_unidad_venta
    ) {
      const unidadVenta = await Unidad.findByPk(id_unidad_venta);
      if (!unidadVenta) {
        return res.status(400).json({ mensaje: "La unidad de venta no existe" });
      }
      presentacion.id_unidad_venta = id_unidad_venta;
    }

    if (codigo_barras !== undefined && codigo_barras !== presentacion.codigo_barras) {
      if (codigo_barras) {
        const existente = await PresentacionProducto.findOne({
          where: { codigo_barras },
        });
        if (existente && existente.id !== presentacion.id) {
          return res.status(409).json({
            mensaje: "Ya existe una presentación con ese código de barras",
          });
        }
      }
      presentacion.codigo_barras = codigo_barras || null;
    }

    if (nombre !== undefined) presentacion.nombre = nombre;
    if (unidades_por_unidad_venta !== undefined)
      presentacion.unidades_por_unidad_venta = unidades_por_unidad_venta;
    if (precio_venta_por_defecto !== undefined)
      presentacion.precio_venta_por_defecto = precio_venta_por_defecto;
    if (precio_minimo !== undefined) presentacion.precio_minimo = precio_minimo;
    if (activo !== undefined) presentacion.activo = activo;

    await presentacion.save();

    return res.json({
      mensaje: "Presentación actualizada correctamente",
      presentacion,
    });
  } catch (err) {
    console.error("Error en actualizarPresentacion:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarPresentaciones,
  obtenerPresentacionPorId,
  crearPresentacion,
  actualizarPresentacion,
};

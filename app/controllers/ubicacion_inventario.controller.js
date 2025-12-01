const db = require("../models");
const Ubicacion = db.ubicaciones_inventario;

const listarUbicaciones = async (req, res) => {
  try {
    const { activo } = req.query;
    const where = {};
    if (activo !== undefined) where.activo = activo === "true";

    const ubicaciones = await Ubicacion.findAll({ where });
    return res.json(ubicaciones);
  } catch (err) {
    console.error("Error en listarUbicaciones:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const obtenerUbicacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const ubicacion = await Ubicacion.findByPk(id);
    if (!ubicacion) {
      return res.status(404).json({ mensaje: "Ubicación no encontrada" });
    }
    return res.json(ubicacion);
  } catch (err) {
    console.error("Error en obtenerUbicacionPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const crearUbicacion = async (req, res) => {
  try {
    const { nombre, tipo, descripcion, activo } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: "El nombre es obligatorio" });
    }

    const ubicacion = await Ubicacion.create({
      nombre,
      tipo: tipo || "ALMACEN",
      descripcion,
      activo: activo !== undefined ? activo : true,
    });

    return res.status(201).json({
      mensaje: "Ubicación creada correctamente",
      ubicacion,
    });
  } catch (err) {
    console.error("Error en crearUbicacion:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const actualizarUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, descripcion, activo } = req.body;

    const ubicacion = await Ubicacion.findByPk(id);
    if (!ubicacion) {
      return res.status(404).json({ mensaje: "Ubicación no encontrada" });
    }

    if (nombre !== undefined) ubicacion.nombre = nombre;
    if (tipo !== undefined) ubicacion.tipo = tipo;
    if (descripcion !== undefined) ubicacion.descripcion = descripcion;
    if (activo !== undefined) ubicacion.activo = activo;

    await ubicacion.save();

    return res.json({
      mensaje: "Ubicación actualizada correctamente",
      ubicacion,
    });
  } catch (err) {
    console.error("Error en actualizarUbicacion:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarUbicaciones,
  obtenerUbicacionPorId,
  crearUbicacion,
  actualizarUbicacion,
};

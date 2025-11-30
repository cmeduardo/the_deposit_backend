const db = require("../models");
const Unidad = db.unidades;

// GET /api/unidades
const listarUnidades = async (req, res) => {
  try {
    const unidades = await Unidad.findAll();
    return res.json(unidades);
  } catch (err) {
    console.error("Error en listarUnidades:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/unidades/:id
const obtenerUnidadPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const unidad = await Unidad.findByPk(id);

    if (!unidad) {
      return res.status(404).json({ mensaje: "Unidad no encontrada" });
    }

    return res.json(unidad);
  } catch (err) {
    console.error("Error en obtenerUnidadPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/unidades
const crearUnidad = async (req, res) => {
  try {
    const { codigo, nombre, descripcion, activo } = req.body;

    if (!codigo || !nombre) {
      return res
        .status(400)
        .json({ mensaje: "Código y nombre son obligatorios" });
    }

    const existente = await Unidad.findOne({ where: { codigo } });
    if (existente) {
      return res
        .status(409)
        .json({ mensaje: "Ya existe una unidad con ese código" });
    }

    const unidad = await Unidad.create({
      codigo,
      nombre,
      descripcion,
      activo: activo !== undefined ? activo : true,
    });

    return res.status(201).json({
      mensaje: "Unidad creada correctamente",
      unidad,
    });
  } catch (err) {
    console.error("Error en crearUnidad:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// PATCH /api/unidades/:id
const actualizarUnidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, descripcion, activo } = req.body;

    const unidad = await Unidad.findByPk(id);
    if (!unidad) {
      return res.status(404).json({ mensaje: "Unidad no encontrada" });
    }

    if (codigo && codigo !== unidad.codigo) {
      const existente = await Unidad.findOne({ where: { codigo } });
      if (existente) {
        return res
          .status(409)
          .json({ mensaje: "Ya existe una unidad con ese código" });
      }
    }

    if (codigo !== undefined) unidad.codigo = codigo;
    if (nombre !== undefined) unidad.nombre = nombre;
    if (descripcion !== undefined) unidad.descripcion = descripcion;
    if (activo !== undefined) unidad.activo = activo;

    await unidad.save();

    return res.json({
      mensaje: "Unidad actualizada correctamente",
      unidad,
    });
  } catch (err) {
    console.error("Error en actualizarUnidad:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarUnidades,
  obtenerUnidadPorId,
  crearUnidad,
  actualizarUnidad,
};

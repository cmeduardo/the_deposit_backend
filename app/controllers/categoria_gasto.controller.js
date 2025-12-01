const db = require("../models");
const CategoriaGasto = db.categorias_gastos;

const listarCategoriasGasto = async (req, res) => {
  try {
    const { activo } = req.query;
    const where = {};
    if (activo !== undefined) where.activo = activo === "true";

    const categorias = await CategoriaGasto.findAll({ where });
    return res.json(categorias);
  } catch (err) {
    console.error("Error en listarCategoriasGasto:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const obtenerCategoriaGastoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await CategoriaGasto.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría de gasto no encontrada" });
    }
    return res.json(categoria);
  } catch (err) {
    console.error("Error en obtenerCategoriaGastoPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const crearCategoriaGasto = async (req, res) => {
  try {
    const { nombre, descripcion, tipo_por_defecto, activo } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: "El nombre es obligatorio" });
    }

    const categoria = await CategoriaGasto.create({
      nombre,
      descripcion,
      tipo_por_defecto: tipo_por_defecto || null,
      activo: activo !== undefined ? activo : true,
    });

    return res.status(201).json({
      mensaje: "Categoría de gasto creada correctamente",
      categoria,
    });
  } catch (err) {
    console.error("Error en crearCategoriaGasto:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const actualizarCategoriaGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, tipo_por_defecto, activo } = req.body;

    const categoria = await CategoriaGasto.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría de gasto no encontrada" });
    }

    if (nombre !== undefined) categoria.nombre = nombre;
    if (descripcion !== undefined) categoria.descripcion = descripcion;
    if (tipo_por_defecto !== undefined) categoria.tipo_por_defecto = tipo_por_defecto;
    if (activo !== undefined) categoria.activo = activo;

    await categoria.save();

    return res.json({
      mensaje: "Categoría de gasto actualizada correctamente",
      categoria,
    });
  } catch (err) {
    console.error("Error en actualizarCategoriaGasto:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarCategoriasGasto,
  obtenerCategoriaGastoPorId,
  crearCategoriaGasto,
  actualizarCategoriaGasto,
};

const db = require("../models");
const CategoriaProducto = db.categorias_productos;

// GET /api/categorias-productos
const listarCategorias = async (req, res) => {
  try {
    const categorias = await CategoriaProducto.findAll();
    return res.json(categorias);
  } catch (err) {
    console.error("Error en listarCategorias:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/categorias-productos/:id
const obtenerCategoriaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await CategoriaProducto.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    return res.json(categoria);
  } catch (err) {
    console.error("Error en obtenerCategoriaPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/categorias-productos
const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, activo } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: "El nombre es obligatorio" });
    }

    const existente = await CategoriaProducto.findOne({ where: { nombre } });
    if (existente) {
      return res
        .status(409)
        .json({ mensaje: "Ya existe una categoría con ese nombre" });
    }

    const categoria = await CategoriaProducto.create({
      nombre,
      descripcion,
      activo: activo !== undefined ? activo : true,
    });

    return res.status(201).json({
      mensaje: "Categoría creada correctamente",
      categoria,
    });
  } catch (err) {
    console.error("Error en crearCategoria:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// PATCH /api/categorias-productos/:id
const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const categoria = await CategoriaProducto.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    if (nombre && nombre !== categoria.nombre) {
      const existente = await CategoriaProducto.findOne({ where: { nombre } });
      if (existente) {
        return res
          .status(409)
          .json({ mensaje: "Ya existe una categoría con ese nombre" });
      }
    }

    if (nombre !== undefined) categoria.nombre = nombre;
    if (descripcion !== undefined) categoria.descripcion = descripcion;
    if (activo !== undefined) categoria.activo = activo;

    await categoria.save();

    return res.json({
      mensaje: "Categoría actualizada correctamente",
      categoria,
    });
  } catch (err) {
    console.error("Error en actualizarCategoria:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
};

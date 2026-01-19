const db = require("../models");
const Producto = db.productos;
const CategoriaProducto = db.categorias_productos;
const Unidad = db.unidades;

// GET /api/productos
const listarProductos = async (req, res) => {
  try {
    const { activo, id_categoria } = req.query;

    const where = {};
    if (activo !== undefined) where.activo = activo === "true";
    if (id_categoria !== undefined) where.id_categoria = id_categoria;

    const productos = await Producto.findAll({
      where,
      include: [
        { model: CategoriaProducto, as: "categoria", attributes: ["id", "nombre"] },
        { model: Unidad, as: "unidad_base", attributes: ["id", "codigo", "nombre"] },
      ],
    });

    return res.json(productos);
  } catch (err) {
    console.error("Error en listarProductos:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/productos/:id
const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id, {
      include: [
        { model: CategoriaProducto, as: "categoria", attributes: ["id", "nombre"] },
        { model: Unidad, as: "unidad_base", attributes: ["id", "codigo", "nombre"] },
        {
          model: db.presentaciones_productos,
          as: "presentaciones",
          include: [
            {
              model: Unidad,
              as: "unidad_venta",
              attributes: ["id", "codigo", "nombre"],
            },
          ],
        },
      ],
    });

    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    return res.json(producto);
  } catch (err) {
    console.error("Error en obtenerProductoPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/productos
const crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      url_imagen,
      marca,
      id_categoria,
      id_unidad_base,
      es_perecedero,
      stock_minimo,
      activo,
    } = req.body;

    if (!nombre || !id_unidad_base) {
      return res.status(400).json({
        mensaje: "Nombre y id_unidad_base son obligatorios",
      });
    }

    const unidadBase = await Unidad.findByPk(id_unidad_base);
    if (!unidadBase) {
      return res.status(400).json({ mensaje: "La unidad base no existe" });
    }

    if (id_categoria) {
      const categoria = await CategoriaProducto.findByPk(id_categoria);
      if (!categoria) {
        return res.status(400).json({ mensaje: "La categoría indicada no existe" });
      }
    }

    const producto = await Producto.create({
      nombre,
      descripcion,
      url_imagen,
      marca,
      id_categoria: id_categoria || null,
      id_unidad_base,
      es_perecedero: es_perecedero !== undefined ? es_perecedero : false,
      stock_minimo: stock_minimo !== undefined ? stock_minimo : 0,
      activo: activo !== undefined ? activo : true,
    });

    return res.status(201).json({
      mensaje: "Producto creado correctamente",
      producto,
    });
  } catch (err) {
    console.error("Error en crearProducto:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// PATCH /api/productos/:id
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      url_imagen,
      marca,
      id_categoria,
      id_unidad_base,
      es_perecedero,
      stock_minimo,
      activo,
    } = req.body;

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    if (id_unidad_base !== undefined && id_unidad_base !== producto.id_unidad_base) {
      const unidadBase = await Unidad.findByPk(id_unidad_base);
      if (!unidadBase) {
        return res.status(400).json({ mensaje: "La unidad base indicada no existe" });
      }
      producto.id_unidad_base = id_unidad_base;
    }

    if (id_categoria !== undefined) {
      if (id_categoria === null) {
        producto.id_categoria = null;
      } else {
        const categoria = await CategoriaProducto.findByPk(id_categoria);
        if (!categoria) {
          return res
            .status(400)
            .json({ mensaje: "La categoría indicada no existe" });
        }
        producto.id_categoria = id_categoria;
      }
    }

    if (nombre !== undefined) producto.nombre = nombre;
    if (descripcion !== undefined) producto.descripcion = descripcion;
    if (url_imagen !== undefined) producto.url_imagen = url_imagen;
    if (marca !== undefined) producto.marca = marca;
    if (es_perecedero !== undefined) producto.es_perecedero = es_perecedero;
    if (stock_minimo !== undefined) producto.stock_minimo = stock_minimo;
    if (activo !== undefined) producto.activo = activo;

    await producto.save();

    return res.json({
      mensaje: "Producto actualizado correctamente",
      producto,
    });
  } catch (err) {
    console.error("Error en actualizarProducto:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
};

const db = require("../models");
const Producto = db.productos;
const Presentacion = db.presentaciones_productos;
const Categoria = db.categorias_productos; // si ya la tienes
const { Op } = db.Sequelize;

// GET /api/catalogo/productos
// filtros: texto, id_categoria, es_perecedero
const listarProductosCatalogo = async (req, res) => {
  try {
    const { texto, id_categoria, es_perecedero } = req.query;

    const whereProd = { activo: true };
    if (id_categoria) whereProd.id_categoria = id_categoria;
    if (es_perecedero !== undefined) {
      whereProd.es_perecedero = es_perecedero === "true";
    }
    if (texto) {
      whereProd[Op.or] = [
        { nombre: { [Op.iLike]: `%${texto}%` } },
        { descripcion: { [Op.iLike]: `%${texto}%` } },
        { marca: { [Op.iLike]: `%${texto}%` } },
      ];
    }

    const productos = await Producto.findAll({
      where: whereProd,
      include: [
        {
          model: Presentacion,
          as: "presentaciones",
          where: { activo: true },
          required: false,
        },
        {
          model: Categoria,
          as: "categoria",
          required: false,
        },
      ],
      order: [["nombre", "ASC"]],
    });

    return res.json(productos);
  } catch (err) {
    console.error("Error en listarProductosCatalogo:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/catalogo/presentaciones/:id
const obtenerPresentacionCatalogo = async (req, res) => {
  try {
    const { id } = req.params;

    const presentacion = await Presentacion.findByPk(id, {
      include: [
        {
          model: Producto,
          as: "producto",
          include: [
            {
              model: Categoria,
              as: "categoria",
              required: false,
            },
          ],
        },
      ],
    });

    if (!presentacion || !presentacion.activo) {
      return res.status(404).json({ mensaje: "Presentación no encontrada" });
    }

    return res.json(presentacion);
  } catch (err) {
    console.error("Error en obtenerPresentacionCatalogo:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarProductosCatalogo,
  obtenerPresentacionCatalogo,
};

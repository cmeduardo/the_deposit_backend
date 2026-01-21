const db = require("../models");
const Producto = db.productos;
const Presentacion = db.presentaciones_productos;
const Categoria = db.categorias_productos;
const { Op, Sequelize } = db.Sequelize;

const toInt = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};

const toFloat = (v) => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const normalizeSort = (sort) => {
  const allowed = new Set(["nombre", "precio"]);
  return allowed.has(sort) ? sort : "nombre";
};

const normalizeOrder = (order) => {
  const o = String(order || "asc").toLowerCase();
  return o === "desc" ? "DESC" : "ASC";
};

const precioVendibleCol = Sequelize.fn(
  "COALESCE",
  Sequelize.col("presentaciones.precio_venta_por_defecto"),
  Sequelize.col("presentaciones.precio_minimo")
);

// GET /api/catalogo/productos (cards LIVIANAS)
const listarProductosCatalogo = async (req, res) => {
  try {
    const {
      texto,
      id_categoria,
      marca,
      precio_min,
      precio_max,
      page = "1",
      limit = "20",
      sort = "nombre",
      order = "asc",
    } = req.query;

    const pageNum = Math.max(toInt(page, 1), 1);
    const limitNum = Math.min(Math.max(toInt(limit, 20), 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const sortKey = normalizeSort(sort);
    const sortOrder = normalizeOrder(order);

    const pMin = toFloat(precio_min);
    const pMax = toFloat(precio_max);

    // -------- Filtros de producto (base) --------
    const whereProd = { activo: true };

    if (id_categoria !== undefined && id_categoria !== null && id_categoria !== "") {
      const cat = toInt(id_categoria, null);
      if (cat !== null) whereProd.id_categoria = cat;
    }

    if (marca && String(marca).trim()) {
      whereProd.marca = { [Op.iLike]: `%${String(marca).trim()}%` };
    }

    if (texto && String(texto).trim()) {
      const t = String(texto).trim();
      whereProd[Op.or] = [
        { nombre: { [Op.iLike]: `%${t}%` } },
        { descripcion: { [Op.iLike]: `%${t}%` } },
        { marca: { [Op.iLike]: `%${t}%` } },
      ];
    }

    // -------- Filtros de presentaciones (solo para filtrar y calcular min/max) --------
    const wherePres = { activo: true };

    const andPres = [];

    if (pMin !== null) {
      andPres.push(Sequelize.where(precioVendibleCol, { [Op.gte]: pMin }));
    }
    if (pMax !== null) {
      andPres.push(Sequelize.where(precioVendibleCol, { [Op.lte]: pMax }));
    }
    if (andPres.length) {
      wherePres[Op.and] = andPres;
    }

    // Join a presentaciones SOLO para:
    // - garantizar que el producto tenga al menos una presentacion activa (required:true)
    // - poder calcular min/max
    // - aplicar filtros por precio
    const includePresentacionesAgg = {
      model: Presentacion,
      as: "presentaciones",
      where: wherePres,
      required: true,
      attributes: [],
      duplicating: false,
    };

    const includeCategoria = {
      model: Categoria,
      as: "categoria",
      where: { activo: true },
      required: false,
      attributes: ["id", "nombre", "descripcion"],
    };

    // -------- Agregados para cards --------
    const attrsExtras = [
      [Sequelize.fn("MIN", precioVendibleCol), "precio_desde"],
      [Sequelize.fn("MAX", precioVendibleCol), "precio_hasta"],
      [
        // bool_or es nativo en Postgres
        Sequelize.fn(
          "BOOL_OR",
          Sequelize.literal(
            "(presentaciones.precio_venta_por_defecto IS NOT NULL OR presentaciones.precio_minimo IS NOT NULL)"
          )
        ),
        "tiene_precio",
      ],
    ];

    // -------- Total (count distinct) --------
    const total = await Producto.count({
      where: whereProd,
      include: [includePresentacionesAgg],
      distinct: true,
      col: "id",
    });

    // -------- Order --------
    let orderClause = [["nombre", sortOrder]];
    if (sortKey === "precio") {
      orderClause = [
        [Sequelize.literal('"precio_desde"'), sortOrder],
        ["nombre", "ASC"],
      ];
    }

    // -------- Rows --------
    const rows = await Producto.findAll({
      where: whereProd,
      attributes: [
        "id",
        "nombre",
        "descripcion",
        "marca",
        "url_imagen",
        "id_categoria",
        "stock_minimo",
        "activo",
        ...attrsExtras,
      ],
      include: [includePresentacionesAgg, includeCategoria],
      group: ["producto.id", "categoria.id"],
      order: orderClause,
      limit: limitNum,
      offset,
      subQuery: false,
    });

    return res.json({
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
        sort: sortKey,
        order: sortOrder.toLowerCase(),
        filtros: {
          texto: texto || null,
          id_categoria: id_categoria || null,
          marca: marca || null,
          precio_min: pMin,
          precio_max: pMax,
        },
      },
      data: rows,
    });
  } catch (err) {
    console.error("Error en listarProductosCatalogo:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/catalogo/presentaciones/:id
const obtenerPresentacionCatalogo = async (req, res) => {
  try {
    const { id } = req.params;

    const presentacion = await Presentacion.findOne({
      where: { id, activo: true },
      include: [
        {
          model: Producto,
          as: "producto",
          where: { activo: true },
          required: true,
          include: [
            {
              model: Categoria,
              as: "categoria",
              where: { activo: true },
              required: false,
            },
          ],
        },
      ],
    });

    if (!presentacion) {
      return res.status(404).json({ mensaje: "Presentación no encontrada" });
    }

    return res.json(presentacion);
  } catch (err) {
    console.error("Error en obtenerPresentacionCatalogo:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/catalogo/productos/:id (DETALLE con presentaciones)
const obtenerProductoCatalogoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findOne({
      where: { id, activo: true },
      include: [
        {
          model: Categoria,
          as: "categoria",
          where: { activo: true },
          required: false,
        },
        {
          model: Presentacion,
          as: "presentaciones",
          where: { activo: true },
          required: false,
          separate: true,
          order: [["nombre", "ASC"]],
        },
      ],
      order: [["nombre", "ASC"]],
    });

    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    return res.json(producto);
  } catch (err) {
    console.error("Error en obtenerProductoCatalogoPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarProductosCatalogo,
  obtenerPresentacionCatalogo,
  obtenerProductoCatalogoPorId,
};

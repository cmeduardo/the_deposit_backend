// app/controllers/kpi.controller.js
const db = require("../models");
const Sequelize = db.Sequelize;
const { Op } = Sequelize;

const Venta = db.ventas;
const DetalleVenta = db.detalles_ventas;
const Gasto = db.gastos;
const CobroCliente = db.cobros_clientes;
const Producto = db.productos;
const Presentacion = db.presentaciones_productos;
const CategoriaProducto = db.categorias_productos;
const InventarioSaldo = db.inventarios_saldos;
const Unidad = db.unidades;

// Helper para construir filtros de rango de fechas
function buildRangoFechas(query, campoFecha) {
  const { fecha_desde, fecha_hasta } = query;
  if (!fecha_desde && !fecha_hasta) return {};

  const filtro = {};
  if (fecha_desde) filtro[Op.gte] = fecha_desde;
  if (fecha_hasta) filtro[Op.lte] = fecha_hasta;

  return { [campoFecha]: filtro };
}

/**
 * GET /api/kpi/resumen-financiero
 * Resumen alto nivel: ventas, gastos, cobros, utilidad, margen, cuentas por cobrar
 */
exports.obtenerResumenFinanciero = async (req, res) => {
  try {
    const whereVentas = buildRangoFechas(req.query, "fecha_venta");
    const whereGastos = buildRangoFechas(req.query, "fecha_gasto");
    const whereCobros = buildRangoFechas(req.query, "fecha_cobro");

    const [totalVentas, totalGastos, totalCobros] = await Promise.all([
      Venta.sum("total_general", { where: whereVentas }),
      Gasto.sum("monto", { where: whereGastos }),
      CobroCliente.sum("monto", { where: whereCobros }),
    ]);

    const totalVentasNum = Number(totalVentas) || 0;
    const totalGastosNum = Number(totalGastos) || 0;
    const totalCobrosNum = Number(totalCobros) || 0;

    const utilidadNeta = totalVentasNum - totalGastosNum;
    const margenSobreVentas =
      totalVentasNum > 0 ? utilidadNeta / totalVentasNum : 0;

    // Estimación simple: cuentas por cobrar = ventas - cobros realizados
    const cuentasPorCobrarEstimada = totalVentasNum - totalCobrosNum;

    return res.json({
      rango_fechas: {
        fecha_desde: req.query.fecha_desde || null,
        fecha_hasta: req.query.fecha_hasta || null,
      },
      resumen: {
        total_ventas: totalVentasNum,
        total_gastos: totalGastosNum,
        total_cobros_clientes: totalCobrosNum,
        utilidad_neta_estimada: utilidadNeta,
        margen_sobre_ventas: margenSobreVentas,
        cuentas_por_cobrar_estimadas: cuentasPorCobrarEstimada,
      },
    });
  } catch (err) {
    console.error("Error en obtenerResumenFinanciero:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno al obtener resumen financiero" });
  }
};

/**
 * GET /api/kpi/ventas-diarias
 * Serie de tiempo de ventas diarias (total y cantidad de ventas)
 */
exports.obtenerVentasDiarias = async (req, res) => {
  try {
    const whereVentas = buildRangoFechas(req.query, "fecha_venta");

    const rows = await Venta.findAll({
      where: whereVentas,
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("fecha_venta")), "fecha"],
        [Sequelize.fn("SUM", Sequelize.col("total_general")), "total_ventas"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "cantidad_ventas"],
      ],
      group: [Sequelize.fn("DATE", Sequelize.col("fecha_venta"))],
      order: [[Sequelize.fn("DATE", Sequelize.col("fecha_venta")), "ASC"]],
    });

    return res.json(rows);
  } catch (err) {
    console.error("Error en obtenerVentasDiarias:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno al obtener ventas diarias" });
  }
};

/**
 * GET /api/kpi/ventas-por-categoria
 * Agrega ventas por categoría de producto
 */
exports.obtenerVentasPorCategoria = async (req, res) => {
  try {
    const whereVentas = buildRangoFechas(req.query, "fecha_venta");

    const rows = await DetalleVenta.findAll({
      include: [
        {
          model: Venta,
          as: "venta",
          attributes: [],
          where: whereVentas,
        },
        {
          model: Presentacion,
          as: "presentacion",
          attributes: [],
          include: [
            {
              model: Producto,
              as: "producto",
              attributes: [],
              include: [
                {
                  model: CategoriaProducto,
                  as: "categoria",
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],
      attributes: [
        [Sequelize.col("presentacion->producto->categoria.id"), "id_categoria"],
        [
          Sequelize.col("presentacion->producto->categoria.nombre"),
          "nombre_categoria",
        ],
        [Sequelize.fn("SUM", Sequelize.col("subtotal_linea")), "total_ventas"],
        [
          Sequelize.fn("SUM", Sequelize.col("cantidad_unidad_venta")),
          "unidades_vendidas",
        ],
      ],
      group: [
        Sequelize.col("presentacion->producto->categoria.id"),
        Sequelize.col("presentacion->producto->categoria.nombre"),
      ],
      order: [[Sequelize.fn("SUM", Sequelize.col("subtotal_linea")), "DESC"]],
    });

    return res.json(rows);
  } catch (err) {
    console.error("Error en obtenerVentasPorCategoria:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno al obtener ventas por categoría" });
  }
};

/**
 * GET /api/kpi/top-productos
 * Top N productos por ventas (en Q) y unidades (base)
 * query: limite=10 (por defecto)
 */
exports.obtenerTopProductos = async (req, res) => {
  try {
    const whereVentas = buildRangoFechas(req.query, "fecha_venta");
    const limite = parseInt(req.query.limite, 10) || 10;

    const rows = await DetalleVenta.findAll({
      include: [
        {
          model: Venta,
          as: "venta",
          attributes: [],
          where: whereVentas,
        },
        {
          model: Presentacion,
          as: "presentacion",
          attributes: [],
          include: [
            {
              model: Producto,
              as: "producto",
              attributes: [],
            },
          ],
        },
      ],
      attributes: [
        [Sequelize.col("presentacion->producto.id"), "id_producto"],
        [Sequelize.col("presentacion->producto.nombre"), "nombre_producto"],
        [Sequelize.fn("SUM", Sequelize.col("subtotal_linea")), "total_ventas"],
        [
          Sequelize.fn("SUM", Sequelize.col("cantidad_unidad_base")),
          "unidades_vendidas_base",
        ],
      ],
      group: [
        Sequelize.col("presentacion->producto.id"),
        Sequelize.col("presentacion->producto.nombre"),
      ],
      order: [[Sequelize.fn("SUM", Sequelize.col("subtotal_linea")), "DESC"]],
      limit: limite,
    });

    return res.json(rows);
  } catch (err) {
    console.error("Error en obtenerTopProductos:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno al obtener top de productos" });
  }
};

/**
 * GET /api/kpi/inventario-bajo-minimo
 * Productos cuyo stock disponible está por debajo o igual a su stock_minimo
 */
exports.obtenerProductosBajoMinimo = async (req, res) => {
  try {
    const saldos = await InventarioSaldo.findAll({
      attributes: [
        "id_producto",
        [Sequelize.fn("SUM", Sequelize.col("cantidad_disponible")), "stock_disponible"],
        [Sequelize.fn("SUM", Sequelize.col("cantidad_reservada")), "stock_reservado"],
      ],
      include: [
        {
          model: Producto,
          as: "producto",
          attributes: ["nombre", "stock_minimo", "es_perecedero"],
          include: [
            {
              model: CategoriaProducto,
              as: "categoria",
              attributes: ["id", "nombre"],
            },
            {
              model: Unidad,
              as: "unidad_base",
              attributes: ["id", "codigo", "nombre"], // 👈 usamos código + nombre
            },
          ],
        },
      ],
      group: [
        "inventario_saldo.id_producto",
        "producto.id",
        "producto->categoria.id",
        "producto->unidad_base.id",
      ],
    });

    const resultado = saldos
      .map((row) => {
        const stockDisponible = Number(row.get("stock_disponible")) || 0;
        const stockReservado = Number(row.get("stock_reservado")) || 0;
        const producto = row.producto;

        if (!producto) return null;

        const stockMinimo = Number(producto.stock_minimo) || 0;

        return {
          id_producto: row.id_producto,
          nombre_producto: producto.nombre,
          categoria: producto.categoria
            ? {
              id: producto.categoria.id,
              nombre: producto.categoria.nombre,
            }
            : null,
          unidad_base: producto.unidad_base
            ? {
              id: producto.unidad_base.id,
              codigo: producto.unidad_base.codigo,
              nombre: producto.unidad_base.nombre,
            }
            : null,
          stock_disponible: stockDisponible,
          stock_reservado: stockReservado,
          stock_total: stockDisponible + stockReservado,
          stock_minimo: stockMinimo,
          es_perecedero: producto.es_perecedero,
          bajo_minimo: stockDisponible <= stockMinimo,
        };
      })
      .filter((x) => x && x.bajo_minimo);

    return res.json(resultado);

  } catch (err) {
    console.error("Error en obtenerProductosBajoMinimo:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno al obtener productos bajo mínimo" });
  }
};

/**
 * GET /api/kpi/gastos-por-categoria
 * Agrupa los gastos por categoría
 */
exports.obtenerGastosPorCategoria = async (req, res) => {
  try {
    const whereGastos = buildRangoFechas(req.query, "fecha_gasto");

    const rows = await Gasto.findAll({
      where: whereGastos,
      attributes: [
        "id_categoria_gasto",
        [Sequelize.fn("SUM", Sequelize.col("monto")), "total_gasto"],
      ],
      include: [
        {
          model: db.categorias_gastos,
          as: "categoria_gasto",
          attributes: ["nombre"],
        },
      ],
      group: ["id_categoria_gasto", "categoria_gasto.id"],
      order: [[Sequelize.fn("SUM", Sequelize.col("monto")), "DESC"]],
    });

    return res.json(rows);
  } catch (err) {
    console.error("Error en obtenerGastosPorCategoria:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno al obtener gastos por categoría" });
  }
};

/**
 * GET /api/kpi/rotacion-inventario
 * Mide rotación por producto en un periodo (ventas en unidades base vs stock actual)
 * query: dias=30 (por defecto)
 */
exports.obtenerRotacionInventario = async (req, res) => {
  try {
    const dias = parseInt(req.query.dias, 10) || 30;

    const hoy = new Date();
    const fechaHastaISO = hoy.toISOString().slice(0, 10);
    const fechaDesde = new Date(hoy);
    fechaDesde.setDate(hoy.getDate() - dias);
    const fechaDesdeISO = fechaDesde.toISOString().slice(0, 10);

    const whereVentas = {
      fecha_venta: { [Op.between]: [fechaDesdeISO, fechaHastaISO] },
    };

    // Ventas por producto (en unidad base)
    const ventasPorProducto = await DetalleVenta.findAll({
      include: [
        {
          model: Venta,
          as: "venta",
          attributes: [],
          where: whereVentas,
        },
        {
          model: Presentacion,
          as: "presentacion",
          attributes: [],
          include: [
            {
              model: Producto,
              as: "producto",
              attributes: [],
            },
          ],
        },
      ],
      attributes: [
        [Sequelize.col("presentacion->producto.id"), "id_producto"],
        [Sequelize.col("presentacion->producto.nombre"), "nombre_producto"],
        [
          Sequelize.fn("SUM", Sequelize.col("cantidad_unidad_base")),
          "unidades_vendidas_base",
        ],
        [
          Sequelize.fn("SUM", Sequelize.col("subtotal_linea")),
          "ventas_totales",
        ],
      ],
      group: [
        Sequelize.col("presentacion->producto.id"),
        Sequelize.col("presentacion->producto.nombre"),
      ],
    });

    // Stock actual por producto
    const stockActual = await InventarioSaldo.findAll({
      attributes: [
        "id_producto",
        [Sequelize.fn("SUM", Sequelize.col("cantidad_disponible")), "stock_disponible"],
        [Sequelize.fn("SUM", Sequelize.col("cantidad_reservada")), "stock_reservado"],
      ],
      group: ["id_producto"],
    });

    const mapaStock = {};
    stockActual.forEach((s) => {
      mapaStock[s.id_producto] = {
        stock_disponible: Number(s.get("stock_disponible")) || 0,
        stock_reservado: Number(s.get("stock_reservado")) || 0,
      };
    });

    const resultado = ventasPorProducto.map((row) => {
      const id_producto = row.get("id_producto");
      const nombre_producto = row.get("nombre_producto");
      const unidadesVendidas =
        Number(row.get("unidades_vendidas_base")) || 0;
      const ventasTotales = Number(row.get("ventas_totales")) || 0;

      const stock = mapaStock[id_producto] || {
        stock_disponible: 0,
        stock_reservado: 0,
      };

      const stockTotal = stock.stock_disponible + stock.stock_reservado;
      const indice_rotacion =
        stockTotal > 0 ? unidadesVendidas / stockTotal : null;

      return {
        id_producto,
        nombre_producto,
        unidades_vendidas_base: unidadesVendidas,
        ventas_totales: ventasTotales,
        stock_disponible: stock.stock_disponible,
        stock_reservado: stock.stock_reservado,
        stock_total: stockTotal,
        dias_periodo: dias,
        indice_rotacion, // >1 = se vende más que lo que hay en stock actual
      };
    });

    return res.json({
      desde: fechaDesdeISO,
      hasta: fechaHastaISO,
      dias_periodo: dias,
      productos: resultado,
    });
  } catch (err) {
    console.error("Error en obtenerRotacionInventario:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno al obtener rotación de inventario" });
  }
};

const db = require("../models");
const Carrito = db.carritos_compras;
const ItemCarrito = db.items_carrito;
const Presentacion = db.presentaciones_productos;
const Producto = db.productos;
const Ubicacion = db.ubicaciones_inventario;
const InventarioSaldo = db.inventarios_saldos;
const MovimientoInventario = db.movimientos_inventario;
const Pedido = db.pedidos;
const DetallePedido = db.detalles_pedidos;
const { Op } = db.Sequelize;

const getFechaHoy = () => new Date().toISOString().slice(0, 10);

// 🔹 Helper: obtener (o crear) carrito ACTIVO del usuario
const obtenerOCrearCarritoActivo = async (idUsuario) => {
  let carrito = await Carrito.findOne({
    where: {
      id_usuario_cliente: idUsuario,
      estado: "ACTIVO",
    },
  });

  if (!carrito) {
    carrito = await Carrito.create({
      id_usuario_cliente: idUsuario,
      estado: "ACTIVO",
    });
  }

  return carrito;
};

// GET /api/carrito/mi-carrito
const obtenerMiCarrito = async (req, res) => {
  try {
    const carrito = await obtenerOCrearCarritoActivo(req.usuario.id);

    const carritoCompleto = await Carrito.findByPk(carrito.id, {
      include: [
        {
          model: ItemCarrito,
          as: "items",
          include: [
            {
              model: Presentacion,
              as: "presentacion",
              include: [
                {
                  model: Producto,
                  as: "producto",
                },
              ],
            },
          ],
        },
      ],
    });

    return res.json(carritoCompleto);
  } catch (err) {
    console.error("Error en obtenerMiCarrito:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/carrito/items
// body: { id_presentacion_producto, cantidad_unidad_venta, notas? }
const agregarItemCarrito = async (req, res) => {
  try {
    const { id_presentacion_producto, cantidad_unidad_venta, notas } = req.body;

    if (!id_presentacion_producto || !cantidad_unidad_venta) {
      return res.status(400).json({
        mensaje:
          "id_presentacion_producto y cantidad_unidad_venta son obligatorios",
      });
    }

    if (cantidad_unidad_venta <= 0) {
      return res.status(400).json({
        mensaje: "La cantidad debe ser mayor a cero",
      });
    }

    const presentacion = await Presentacion.findByPk(id_presentacion_producto, {
      include: [{ model: Producto, as: "producto" }],
    });

    if (!presentacion || !presentacion.activo) {
      return res
        .status(400)
        .json({ mensaje: "La presentación de producto no existe o está inactiva" });
    }

    const carrito = await obtenerOCrearCarritoActivo(req.usuario.id);

    const precioUnitario =
      presentacion.precio_venta_por_defecto || presentacion.precio_minimo || 0;

    const subtotalLinea = precioUnitario * cantidad_unidad_venta;

    // si ya existe item de esa presentación, sumamos cantidad
    let item = await ItemCarrito.findOne({
      where: {
        id_carrito: carrito.id,
        id_presentacion_producto,
      },
    });

    if (item) {
      item.cantidad_unidad_venta =
        parseFloat(item.cantidad_unidad_venta) +
        parseFloat(cantidad_unidad_venta);
      item.precio_unitario = precioUnitario; // actualizamos snapshot
      item.subtotal_linea = item.cantidad_unidad_venta * precioUnitario;
      if (notas !== undefined) item.notas = notas;
      await item.save();
    } else {
      item = await ItemCarrito.create({
        id_carrito: carrito.id,
        id_presentacion_producto,
        cantidad_unidad_venta,
        precio_unitario: precioUnitario,
        subtotal_linea: subtotalLinea,
        notas: notas || null,
      });
    }

    const carritoCompleto = await Carrito.findByPk(carrito.id, {
      include: [
        {
          model: ItemCarrito,
          as: "items",
          include: [
            {
              model: Presentacion,
              as: "presentacion",
              include: [{ model: Producto, as: "producto" }],
            },
          ],
        },
      ],
    });

    return res.status(201).json({
      mensaje: "Item agregado al carrito",
      carrito: carritoCompleto,
    });
  } catch (err) {
    console.error("Error en agregarItemCarrito:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// PATCH /api/carrito/items/:id
// body: { cantidad_unidad_venta, notas? }
const actualizarItemCarrito = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad_unidad_venta, notas } = req.body;

    const item = await ItemCarrito.findByPk(id, {
      include: [{ model: Carrito, as: "carrito" }],
    });

    if (!item || item.carrito.id_usuario_cliente !== req.usuario.id) {
      return res.status(404).json({ mensaje: "Item no encontrado en tu carrito" });
    }

    if (cantidad_unidad_venta !== undefined) {
      if (cantidad_unidad_venta <= 0) {
        await item.destroy();
        return res.json({ mensaje: "Item eliminado del carrito" });
      }
      item.cantidad_unidad_venta = cantidad_unidad_venta;
      item.subtotal_linea = cantidad_unidad_venta * item.precio_unitario;
    }

    if (notas !== undefined) item.notas = notas;

    await item.save();

    return res.json({
      mensaje: "Item de carrito actualizado",
      item,
    });
  } catch (err) {
    console.error("Error en actualizarItemCarrito:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// DELETE /api/carrito/items/:id
const eliminarItemCarrito = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ItemCarrito.findByPk(id, {
      include: [{ model: Carrito, as: "carrito" }],
    });

    if (!item || item.carrito.id_usuario_cliente !== req.usuario.id) {
      return res.status(404).json({ mensaje: "Item no encontrado en tu carrito" });
    }

    await item.destroy();

    return res.json({ mensaje: "Item eliminado del carrito" });
  } catch (err) {
    console.error("Error en eliminarItemCarrito:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// DELETE /api/carrito/mi-carrito/items
const vaciarMiCarrito = async (req, res) => {
  try {
    const carrito = await obtenerOCrearCarritoActivo(req.usuario.id);

    await ItemCarrito.destroy({
      where: { id_carrito: carrito.id },
    });

    return res.json({ mensaje: "Carrito vaciado" });
  } catch (err) {
    console.error("Error en vaciarMiCarrito:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/carrito/confirmar
// body: { id_ubicacion_salida, cargo_envio?, descuento_total?, notas_cliente? }
const confirmarCarritoCrearPedido = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      id_ubicacion_salida,
      cargo_envio = 0,
      descuento_total = 0,
      notas_cliente,
    } = req.body;

    if (!id_ubicacion_salida) {
      await t.rollback();
      return res
        .status(400)
        .json({ mensaje: "id_ubicacion_salida es obligatorio" });
    }

    const ubicacion = await Ubicacion.findByPk(id_ubicacion_salida);
    if (!ubicacion) {
      await t.rollback();
      return res
        .status(400)
        .json({ mensaje: "La ubicación de salida indicada no existe" });
    }

    const carrito = await Carrito.findOne({
      where: {
        id_usuario_cliente: req.usuario.id,
        estado: "ACTIVO",
      },
      include: [
        {
          model: ItemCarrito,
          as: "items",
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!carrito || !carrito.items || carrito.items.length === 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ mensaje: "El carrito está vacío o no existe" });
    }

    const presentacionIds = [
      ...new Set(carrito.items.map((i) => i.id_presentacion_producto)),
    ];

    const presentaciones = await Presentacion.findAll({
      where: { id: { [Op.in]: presentacionIds } },
      include: [{ model: Producto, as: "producto" }],
      transaction: t,
    });

    if (presentaciones.length !== presentacionIds.length) {
      await t.rollback();
      return res.status(400).json({
        mensaje:
          "Una o más presentaciones del carrito ya no existen o fueron eliminadas",
      });
    }

    const mapaPresentaciones = {};
    presentaciones.forEach((p) => {
      mapaPresentaciones[p.id] = p;
    });

    // calcular requerido por producto en unidad base
    const requeridoPorProducto = {};
    let subtotalProductos = 0;

    for (const item of carrito.items) {
      const presentacion =
        mapaPresentaciones[item.id_presentacion_producto];
      const unidadesPorVenta =
        presentacion.unidades_por_unidad_venta || 1;
      const cantidadBase =
        parseFloat(item.cantidad_unidad_venta) * unidadesPorVenta;
      const id_producto = presentacion.id_producto;

      if (!requeridoPorProducto[id_producto]) {
        requeridoPorProducto[id_producto] = 0;
      }
      requeridoPorProducto[id_producto] += cantidadBase;

      subtotalProductos +=
        parseFloat(item.cantidad_unidad_venta) *
        parseFloat(item.precio_unitario);
    }

    // verificar stock disponible
    for (const idProductoStr of Object.keys(requeridoPorProducto)) {
      const id_producto = parseInt(idProductoStr, 10);
      const requeridoBase = requeridoPorProducto[id_producto];

      let saldo = await InventarioSaldo.findOne({
        where: {
          id_producto,
          id_ubicacion: id_ubicacion_salida,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const disponible = saldo ? saldo.cantidad_disponible : 0;

      if (disponible < requeridoBase) {
        await t.rollback();
        return res.status(400).json({
          mensaje: `Stock insuficiente para el producto ${id_producto}. Disponible: ${disponible}, requerido para pedido: ${requeridoBase}`,
        });
      }
    }

    const totalAntesDescuento = subtotalProductos + parseFloat(cargo_envio);
    const totalGeneral = totalAntesDescuento - parseFloat(descuento_total || 0);

    // crear pedido
    const pedido = await Pedido.create(
      {
        id_usuario_cliente: req.usuario.id,
        id_ubicacion_salida,
        fuente: "TIENDA_EN_LINEA",
        estado: "PENDIENTE",
        fecha_pedido: getFechaHoy(),
        subtotal_productos: subtotalProductos,
        cargo_envio: cargo_envio || 0,
        descuento_total: descuento_total || 0,
        total_general: totalGeneral,
        notas_cliente: notas_cliente || null,
        notas_internas: "Pedido generado desde carrito de tienda en línea",
      },
      { transaction: t }
    );

    // crear detalles de pedido
    for (const item of carrito.items) {
      const presentacion =
        mapaPresentaciones[item.id_presentacion_producto];
      const unidadesPorVenta =
        presentacion.unidades_por_unidad_venta || 1;
      const cantidadBase =
        parseFloat(item.cantidad_unidad_venta) * unidadesPorVenta;

      await DetallePedido.create(
        {
          id_pedido: pedido.id,
          id_presentacion_producto: item.id_presentacion_producto,
          cantidad_unidad_venta: item.cantidad_unidad_venta,
          cantidad_unidad_base: cantidadBase,
          precio_unitario: item.precio_unitario,
          origen_precio: "DESDE_CARRITO",
          subtotal_linea: item.subtotal_linea,
        },
        { transaction: t }
      );
    }

    // actualizar inventario (reservar stock)
    for (const idProductoStr of Object.keys(requeridoPorProducto)) {
      const id_producto = parseInt(idProductoStr, 10);
      const cantidadBase = requeridoPorProducto[id_producto];

      let saldo = await InventarioSaldo.findOne({
        where: {
          id_producto,
          id_ubicacion: id_ubicacion_salida,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!saldo) {
        saldo = await InventarioSaldo.create(
          {
            id_producto,
            id_ubicacion: id_ubicacion_salida,
            cantidad_disponible: 0,
            cantidad_reservada: 0,
          },
          { transaction: t }
        );
      }

      saldo.cantidad_disponible -= cantidadBase;
      saldo.cantidad_reservada += cantidadBase;

      await saldo.save({ transaction: t });

      await MovimientoInventario.create(
        {
          id_producto,
          id_ubicacion: id_ubicacion_salida,
          tipo_movimiento: "RESERVA_PEDIDO",
          cantidad: -cantidadBase,
          referencia: `Pedido #${pedido.id} (carrito)`,
          id_usuario: req.usuario.id,
        },
        { transaction: t }
      );
    }

    // marcar carrito como convertido y vaciar items
    carrito.estado = "CONVERTIDO";
    await carrito.save({ transaction: t });

    await ItemCarrito.destroy({
      where: { id_carrito: carrito.id },
      transaction: t,
    });

    await t.commit();

    return res.status(201).json({
      mensaje: "Pedido creado correctamente desde el carrito",
      pedido_id: pedido.id,
      total_general: totalGeneral,
    });
  } catch (err) {
    console.error("Error en confirmarCarritoCrearPedido:", err);
    await t.rollback();
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  obtenerMiCarrito,
  agregarItemCarrito,
  actualizarItemCarrito,
  eliminarItemCarrito,
  vaciarMiCarrito,
  confirmarCarritoCrearPedido,
};

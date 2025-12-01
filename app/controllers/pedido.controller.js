const db = require("../models");
const Pedido = db.pedidos;
const DetallePedido = db.detalles_pedidos;
const Presentacion = db.presentaciones_productos;
const Producto = db.productos;
const InventarioSaldo = db.inventarios_saldos;
const Ubicacion = db.ubicaciones_inventario;
const Usuario = db.usuarios;
const { Op } = db.Sequelize;

// helpers
const getFechaHoy = () => new Date().toISOString().slice(0, 10);

// GET /api/pedidos
const listarPedidos = async (req, res) => {
  try {
    const { estado } = req.query;
    const where = {};

    if (estado) where.estado = estado;

    // si es cliente, solo ve sus pedidos
    if (req.usuario.rol === "CLIENTE") {
      where.id_usuario_cliente = req.usuario.id;
    }

    const pedidos = await Pedido.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: "cliente_usuario",
          attributes: ["id", "nombre", "correo"],
        },
        {
          model: Ubicacion,
          as: "ubicacion_salida",
          attributes: ["id", "nombre", "tipo"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json(pedidos);
  } catch (err) {
    console.error("Error en listarPedidos:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/pedidos/:id
const obtenerPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Pedido.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "cliente_usuario",
          attributes: ["id", "nombre", "correo"],
        },
        {
          model: Ubicacion,
          as: "ubicacion_salida",
          attributes: ["id", "nombre", "tipo"],
        },
        {
          model: DetallePedido,
          as: "detalles",
          include: [
            {
              model: Presentacion,
              as: "presentacion",
              include: [
                {
                  model: Producto,
                  as: "producto",
                  attributes: ["id", "nombre"],
                },
              ],
            },
          ],
        },
        {
          model: db.ventas,
          as: "venta",
        },
      ],
    });

    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    // si es cliente, solo puede ver su propio pedido
    if (
      req.usuario.rol === "CLIENTE" &&
      pedido.id_usuario_cliente !== req.usuario.id
    ) {
      return res.status(403).json({ mensaje: "No tienes acceso a este pedido" });
    }

    return res.json(pedido);
  } catch (err) {
    console.error("Error en obtenerPedidoPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/pedidos
// Crea pedido y reserva stock
// Body: { id_usuario_cliente?, id_ubicacion_salida, fuente?, cargo_envio?, notas_cliente?, detalles: [ { id_presentacion_producto, cantidad_unidad_venta, precio_unitario_opcional } ] }
const crearPedido = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    let {
      id_usuario_cliente,
      id_ubicacion_salida,
      fuente,
      cargo_envio,
      notas_cliente,
      detalles,
    } = req.body;

    if (!Array.isArray(detalles) || detalles.length === 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ mensaje: "El pedido debe incluir al menos un detalle" });
    }

    if (!id_ubicacion_salida) {
      await t.rollback();
      return res
        .status(400)
        .json({ mensaje: "id_ubicacion_salida es obligatorio" });
    }

    const ubicacion = await Ubicacion.findByPk(id_ubicacion_salida);
    if (!ubicacion) {
      await t.rollback();
      return res.status(400).json({ mensaje: "La ubicación indicada no existe" });
    }

    // Definir cliente: si no viene en body y el rol es CLIENTE, usamos el del token.
    if (!id_usuario_cliente && req.usuario && req.usuario.rol === "CLIENTE") {
      id_usuario_cliente = req.usuario.id;
    }

    if (id_usuario_cliente) {
      const cliente = await Usuario.findByPk(id_usuario_cliente);
      if (!cliente) {
        await t.rollback();
        return res.status(400).json({ mensaje: "El usuario cliente no existe" });
      }
    }

    fuente = fuente || (req.usuario.rol === "CLIENTE" ? "ONLINE" : "ADMIN");
    cargo_envio = cargo_envio !== undefined ? cargo_envio : 0;

    // Cargar presentaciones y validar inventario
    const presentacionIds = [...new Set(detalles.map((d) => d.id_presentacion_producto))];

    const presentaciones = await Presentacion.findAll({
      where: {
        id: {
          [Op.in]: presentacionIds,
        },
      },
      include: [
        {
          model: Producto,
          as: "producto",
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (presentaciones.length !== presentacionIds.length) {
      await t.rollback();
      return res.status(400).json({
        mensaje: "Una o más presentaciones de producto no existen",
      });
    }

    // Map de presentación por id
    const mapaPresentaciones = {};
    presentaciones.forEach((p) => {
      mapaPresentaciones[p.id] = p;
    });

    // Calcular unidades base por producto y verificar stock libre
    const requeridoPorProducto = {};

    for (const det of detalles) {
      const { id_presentacion_producto, cantidad_unidad_venta } = det;

      if (!id_presentacion_producto || !cantidad_unidad_venta) {
        await t.rollback();
        return res.status(400).json({
          mensaje:
            "Cada detalle debe tener id_presentacion_producto y cantidad_unidad_venta",
        });
      }

      const presentacion = mapaPresentaciones[id_presentacion_producto];
      const unidadesPorVenta = presentacion.unidades_por_unidad_venta || 1;
      const cantidadBase = cantidad_unidad_venta * unidadesPorVenta;
      const id_producto = presentacion.id_producto;

      if (!requeridoPorProducto[id_producto]) {
        requeridoPorProducto[id_producto] = 0;
      }
      requeridoPorProducto[id_producto] += cantidadBase;
    }

    // Verificar stock libre para cada producto
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
      const reservada = saldo ? saldo.cantidad_reservada : 0;
      const stockLibre = disponible - reservada;

      if (stockLibre < requeridoBase) {
        await t.rollback();
        return res.status(400).json({
          mensaje: `Stock insuficiente para el producto ${id_producto}. Stock libre: ${stockLibre}, requerido: ${requeridoBase}`,
        });
      }
    }

    // Crear pedido
    let subtotalProductos = 0;

    const pedido = await Pedido.create(
      {
        id_usuario_cliente: id_usuario_cliente || null,
        id_ubicacion_salida,
        fuente,
        estado: "PENDIENTE",
        fecha_pedido: getFechaHoy(),
        subtotal_productos: 0,
        cargo_envio,
        descuento_total: 0,
        total_general: 0,
        notas_cliente: notas_cliente || null,
        notas_internas: null,
      },
      { transaction: t }
    );

    // Crear detalles y acumular subtotal
    for (const det of detalles) {
      const {
        id_presentacion_producto,
        cantidad_unidad_venta,
        precio_unitario, // opcional para admins
      } = det;

      const presentacion = mapaPresentaciones[id_presentacion_producto];
      const unidadesPorVenta = presentacion.unidades_por_unidad_venta || 1;
      const cantidadBase = cantidad_unidad_venta * unidadesPorVenta;

      // Precio según lógica:
      // - Si viene precio_unitario y el rol es ADMINISTRADOR o VENDEDOR: usarlo (MANUAL)
      // - De lo contrario usar precio_venta_por_defecto de la presentación (SISTEMA)
      let precioFinal = presentacion.precio_venta_por_defecto;
      let origen_precio = "SISTEMA";

      if (
        precio_unitario !== undefined &&
        (req.usuario.rol === "ADMINISTRADOR" || req.usuario.rol === "VENDEDOR")
      ) {
        precioFinal = precio_unitario;
        origen_precio = "MANUAL";
      }

      if (!precioFinal) {
        await t.rollback();
        return res.status(400).json({
          mensaje: `No hay precio definido para la presentación ${id_presentacion_producto}. Debes enviar precio_unitario o definir precio_venta_por_defecto.`,
        });
      }

      const subtotalLinea = parseFloat(precioFinal) * cantidad_unidad_venta;
      subtotalProductos += subtotalLinea;

      await DetallePedido.create(
        {
          id_pedido: pedido.id,
          id_presentacion_producto,
          cantidad_unidad_venta,
          cantidad_unidad_base: cantidadBase,
          precio_unitario: precioFinal,
          origen_precio,
          subtotal_linea: subtotalLinea,
        },
        { transaction: t }
      );
    }

    // Actualizar reservas en inventario
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

      if (!saldo) {
        // esto solo pasa si quieres reservar sin saldo previo; ya hubiera fallado arriba por stockLibre
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

      saldo.cantidad_reservada += requeridoBase;
      await saldo.save({ transaction: t });
    }

    pedido.subtotal_productos = subtotalProductos;
    pedido.total_general =
      subtotalProductos + parseFloat(pedido.cargo_envio) - parseFloat(pedido.descuento_total || 0);
    await pedido.save({ transaction: t });

    await t.commit();

    const pedidoCompleto = await Pedido.findByPk(pedido.id, {
      include: [
        { model: Usuario, as: "cliente_usuario", attributes: ["id", "nombre", "correo"] },
        { model: Ubicacion, as: "ubicacion_salida", attributes: ["id", "nombre", "tipo"] },
        {
          model: DetallePedido,
          as: "detalles",
          include: [
            {
              model: Presentacion,
              as: "presentacion",
              include: [
                { model: Producto, as: "producto", attributes: ["id", "nombre"] },
              ],
            },
          ],
        },
      ],
    });

    return res.status(201).json({
      mensaje: "Pedido creado y stock reservado correctamente",
      pedido: pedidoCompleto,
    });
  } catch (err) {
    console.error("Error en crearPedido:", err);
    await t.rollback();
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// PATCH /api/pedidos/:id/cancelar
const cancelarPedido = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;

    const pedido = await Pedido.findByPk(id, {
      include: [
        {
          model: DetallePedido,
          as: "detalles",
          include: [
            {
              model: Presentacion,
              as: "presentacion",
            },
          ],
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    if (pedido.estado !== "PENDIENTE") {
      await t.rollback();
      return res
        .status(400)
        .json({ mensaje: "Solo se pueden cancelar pedidos en estado PENDIENTE" });
    }

    // Si es cliente, solo puede cancelar su propio pedido
    if (
      req.usuario.rol === "CLIENTE" &&
      pedido.id_usuario_cliente !== req.usuario.id
    ) {
      await t.rollback();
      return res
        .status(403)
        .json({ mensaje: "No tienes permiso para cancelar este pedido" });
    }

    // Revertir reservas
    for (const det of pedido.detalles) {
      const presentacion = det.presentacion;
      const id_producto = presentacion.id_producto;
      const cantidadBase = det.cantidad_unidad_base;

      const saldo = await InventarioSaldo.findOne({
        where: {
          id_producto,
          id_ubicacion: pedido.id_ubicacion_salida,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (saldo) {
        saldo.cantidad_reservada = Math.max(
          0,
          saldo.cantidad_reservada - cantidadBase
        );
        await saldo.save({ transaction: t });
      }
    }

    pedido.estado = "CANCELADO";
    await pedido.save({ transaction: t });

    await t.commit();

    return res.json({
      mensaje: "Pedido cancelado y reservas revertidas",
      pedido,
    });
  } catch (err) {
    console.error("Error en cancelarPedido:", err);
    await t.rollback();
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarPedidos,
  obtenerPedidoPorId,
  crearPedido,
  cancelarPedido,
};

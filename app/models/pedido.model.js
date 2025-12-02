module.exports = (sequelize, Sequelize) => {
  const Pedido = sequelize.define(
    "pedido",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario_cliente: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      id_ubicacion_salida: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ubicaciones_inventario",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      fuente: {
        type: Sequelize.ENUM("ONLINE", "ADMIN", "OTRO", "TIENDA_EN_LINEA", "DESDE_CARRITO"),
        allowNull: false,
        defaultValue: "ONLINE",
      },
      estado: {
        type: Sequelize.ENUM("PENDIENTE", "CANCELADO", "COMPLETADO"),
        allowNull: false,
        defaultValue: "PENDIENTE",
      },
      fecha_pedido: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      subtotal_productos: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      cargo_envio: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      descuento_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total_general: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      notas_cliente: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      notas_internas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "pedidos",
      timestamps: true,
      underscored: true,
    }
  );

  return Pedido;
};

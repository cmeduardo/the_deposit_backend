module.exports = (sequelize, Sequelize) => {
  const DetallePedido = sequelize.define(
    "detalle_pedido",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_pedido: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "pedidos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_presentacion_producto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "presentaciones_productos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      cantidad_unidad_venta: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cantidad_unidad_base: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      precio_unitario: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      origen_precio: {
        type: Sequelize.ENUM("SISTEMA", "MANUAL", "DESDE_CARRITO"),
        allowNull: false,
        defaultValue: "SISTEMA",
      },
      subtotal_linea: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      tableName: "detalles_pedidos",
      timestamps: true,
      underscored: true,
    }
  );

  return DetallePedido;
};

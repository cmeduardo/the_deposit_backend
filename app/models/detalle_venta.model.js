module.exports = (sequelize, Sequelize) => {
  const DetalleVenta = sequelize.define(
    "detalle_venta",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_venta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ventas",
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
      precio_unitario_venta: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      precio_unitario_base: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      es_precio_manual: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      subtotal_linea: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
    },
    {
      tableName: "detalles_ventas",
      timestamps: true,
      underscored: true,
    }
  );

  return DetalleVenta;
};

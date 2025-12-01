module.exports = (sequelize, Sequelize) => {
  const DetalleCompra = sequelize.define(
    "detalle_compra",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_compra: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "compras",
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
      costo_unitario_unidad_venta: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      costo_unitario_unidad_base: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      precio_referencia: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      precio_competencia: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      fecha_vencimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
    },
    {
      tableName: "detalles_compras",
      timestamps: true,
      underscored: true,
    }
  );

  return DetalleCompra;
};

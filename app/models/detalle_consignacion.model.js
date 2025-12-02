module.exports = (sequelize, Sequelize) => {
  const DetalleConsignacion = sequelize.define(
    "detalle_consignacion",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_consignacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "consignaciones",
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
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false,
      },
      cantidad_unidad_base: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false,
      },
      precio_unitario_estimado: {
        // precio que esperas vender (de referencia)
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      subtotal_estimado: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "detalles_consignaciones",
      timestamps: true,
      underscored: true,
    }
  );

  return DetalleConsignacion;
};

module.exports = (sequelize, Sequelize) => {
  const MovimientoInventario = sequelize.define(
    "movimiento_inventario",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_producto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "productos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      id_ubicacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ubicaciones_inventario",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      tipo_movimiento: {
        type: Sequelize.ENUM(
          "COMPRA",
          "VENTA",
          "AJUSTE",
          "CONSIGNACION_SALIDA",
          "CONSIGNACION_RETORNO",
          "OTRO"
        ),
        allowNull: false,
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Positivo entra, negativo sale. En unidades base.",
      },
      referencia_tipo: {
        type: Sequelize.STRING(50),
        allowNull: true, // COMPRA, VENTA, AJUSTE_MANUAL, etc.
      },
      id_referencia: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "movimientos_inventario",
      timestamps: true,
      underscored: true,
    }
  );

  return MovimientoInventario;
};

module.exports = (sequelize, Sequelize) => {
  const UbicacionInventario = sequelize.define(
    "ubicacion_inventario",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM("ALMACEN", "CONSIGNACION", "OTRO"),
        allowNull: false,
        defaultValue: "ALMACEN",
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "ubicaciones_inventario",
      timestamps: true,
      underscored: true,
    }
  );

  return UbicacionInventario;
};

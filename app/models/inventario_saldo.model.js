module.exports = (sequelize, Sequelize) => {
  const InventarioSaldo = sequelize.define(
    "inventario_saldo",
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
        onDelete: "CASCADE",
      },
      id_ubicacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ubicaciones_inventario",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      cantidad_disponible: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "En unidades base",
      },
      cantidad_reservada: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "En unidades base",
      },
    },
    {
      tableName: "inventarios_saldos",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["id_producto", "id_ubicacion"],
        },
      ],
    }
  );

  return InventarioSaldo;
};

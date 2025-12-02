module.exports = (sequelize, Sequelize) => {
  const CarritoCompra = sequelize.define(
    "carrito_compra",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      estado: {
        type: Sequelize.ENUM("ACTIVO", "CONVERTIDO", "CANCELADO"),
        allowNull: false,
        defaultValue: "ACTIVO",
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "carritos_compras",
      timestamps: true,
      underscored: true,
    }
  );

  return CarritoCompra;
};

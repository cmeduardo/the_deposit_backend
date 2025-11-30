module.exports = (sequelize, Sequelize) => {
  const CategoriaProducto = sequelize.define(
    "categoria_producto",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
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
      tableName: "categorias_productos",
      timestamps: true,
      underscored: true,
    }
  );

  return CategoriaProducto;
};

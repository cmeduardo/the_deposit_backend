module.exports = (sequelize, Sequelize) => {
  const Producto = sequelize.define(
    "producto",
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
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      marca: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      id_categoria: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "categorias_productos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      id_unidad_base: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "unidades",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      es_perecedero: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      stock_minimo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "productos",
      timestamps: true,
      underscored: true,
    }
  );

  return Producto;
};

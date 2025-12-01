module.exports = (sequelize, Sequelize) => {
  const CategoriaGasto = sequelize.define(
    "categoria_gasto",
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
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      tipo_por_defecto: {
        type: Sequelize.ENUM("FIJO", "VARIABLE"),
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "categorias_gastos",
      timestamps: true,
      underscored: true,
    }
  );

  return CategoriaGasto;
};

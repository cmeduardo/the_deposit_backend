module.exports = (sequelize, Sequelize) => {
  const Unidad = sequelize.define(
    "unidad",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: "Código corto de la unidad, ej. UNIDAD, FARDO, PAQ6",
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Nombre descriptivo de la unidad",
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
      tableName: "unidades",
      timestamps: true,
      underscored: true,
    }
  );

  return Unidad;
};

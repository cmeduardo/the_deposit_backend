module.exports = (sequelize, Sequelize) => {
  const PresentacionProducto = sequelize.define(
    "presentacion_producto",
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
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: "Ej. Fardo x24, Unidad suelta",
      },
      codigo_barras: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      id_unidad_venta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "unidades",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      unidades_por_unidad_venta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "Cuántas unidades base contiene esta presentación",
      },
      precio_venta_por_defecto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      precio_minimo: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "presentaciones_productos",
      timestamps: true,
      underscored: true,
    }
  );

  return PresentacionProducto;
};

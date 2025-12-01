module.exports = (sequelize, Sequelize) => {
  const Compra = sequelize.define(
    "compra",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_proveedor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "proveedores",
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
      fecha_compra: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      numero_documento: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      subtotal: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      impuestos: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      costos_adicionales: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total: {
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
      tableName: "compras",
      timestamps: true,
      underscored: true,
    }
  );

  return Compra;
};

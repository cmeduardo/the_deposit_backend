module.exports = (sequelize, Sequelize) => {
  const Gasto = sequelize.define(
    "gasto",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_categoria_gasto: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "categorias_gastos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      id_usuario_registro: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      fecha_gasto: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM("FIJO", "VARIABLE"),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      monto: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      metodo_pago: {
        type: Sequelize.STRING(50),
        allowNull: true, // Efectivo, Transferencia, Tarjeta, etc.
      },
      referencia_pago: {
        type: Sequelize.STRING(100),
        allowNull: true, // No. de factura, voucher, etc.
      },
      es_recurrente: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      periodo_recurrencia: {
        type: Sequelize.ENUM("MENSUAL", "TRIMESTRAL", "ANUAL"),
        allowNull: true,
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "gastos",
      timestamps: true,
      underscored: true,
    }
  );

  return Gasto;
};

module.exports = (sequelize, Sequelize) => {
  const CobroCliente = sequelize.define(
    "cobro_cliente",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_venta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ventas",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      fecha_cobro: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      monto: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      metodo_pago: {
        type: Sequelize.STRING(50),
        allowNull: true, // Efectivo, Transferencia, etc.
      },
      referencia_pago: {
        type: Sequelize.STRING(100),
        allowNull: true, // No. recibo, voucher, etc.
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "cobros_clientes",
      timestamps: true,
      underscored: true,
    }
  );

  return CobroCliente;
};

module.exports = (sequelize, Sequelize) => {
  const Venta = sequelize.define(
    "venta",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_pedido: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "pedidos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      id_usuario_cliente: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      id_ubicacion_salida: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ubicaciones_inventario",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      nombre_cliente: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      fecha_venta: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      subtotal_productos: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      impuestos: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      cargo_envio: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      descuento_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total_general: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      tipo_pago: {
        type: Sequelize.STRING(50),
        allowNull: true, // Contado, Transferencia, etc.
      },
      estado_pago: {
        type: Sequelize.ENUM("PENDIENTE", "PAGADO", "PARCIAL"),
        allowNull: false,
        defaultValue: "PAGADO",
      },
      estado: {
        type: Sequelize.ENUM("REGISTRADA", "ANULADA"),
        allowNull: false,
        defaultValue: "REGISTRADA",
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "ventas",
      timestamps: true,
      underscored: true,
    }
  );

  return Venta;
};

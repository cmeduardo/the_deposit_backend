// app/models/factura.model.js
module.exports = (sequelize, Sequelize) => {
  const Factura = sequelize.define(
    "factura",
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
        onDelete: "RESTRICT",
      },

      serie: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "Serie de la factura (ej. A, FEL, etc.)",
      },

      numero: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "Número/correlativo de la factura",
      },

      tipo_documento: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: "FACTURA",
        comment: "FACTURA, NOTA_CREDITO, etc.",
      },

      fecha_emision: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      nombre_cliente_factura: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },

      nit_cliente: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "CF",
      },

      direccion_cliente: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      impuestos: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      total_facturado: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      estado: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "EMITIDA", // EMITIDA, ANULADA
      },

      notas: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "facturas",
      timestamps: true,
      underscored: true,
    }
  );

  return Factura;
};

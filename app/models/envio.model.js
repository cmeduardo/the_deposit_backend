module.exports = (sequelize, Sequelize) => {
  const Envio = sequelize.define(
    "envio",
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
      id_venta: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "ventas",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      fecha_envio: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      estado_envio: {
        type: Sequelize.ENUM(
          "PENDIENTE",
          "EN_PROCESO",
          "DESPACHADO",
          "ENTREGADO",
          "CANCELADO"
        ),
        allowNull: false,
        defaultValue: "PENDIENTE",
      },
      nombre_destinatario: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      direccion_entrega: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      referencia_direccion: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      telefono_contacto: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      zona: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ciudad: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      transportista: {
        type: Sequelize.STRING(100),
        allowNull: true, // "PROPIO", "Guatex", etc.
      },
      tipo_envio: {
        type: Sequelize.ENUM("LOCAL", "NACIONAL"),
        allowNull: true,
      },
      costo_cobrado: {
        // lo que se le cobró al cliente por el envío
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      costo_real: {
        // lo que realmente costó el envío
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "envios",
      timestamps: true,
      underscored: true,
    }
  );

  return Envio;
};

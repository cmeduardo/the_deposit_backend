module.exports = (sequelize, Sequelize) => {
  const Consignacion = sequelize.define(
    "consignacion",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario_cliente: {
        // el “socio” o tienda donde dejas el producto
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
        // bodega desde donde sale la mercadería
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ubicaciones_inventario",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      fecha_envio: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM("ABIERTA", "CERRADA", "CANCELADA"),
        allowNull: false,
        defaultValue: "ABIERTA",
      },
      subtotal_estimado: {
        // suma de precio_unitario_estimado * cantidad
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
      tableName: "consignaciones",
      timestamps: true,
      underscored: true,
    }
  );

  return Consignacion;
};

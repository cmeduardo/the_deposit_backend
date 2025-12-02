module.exports = (sequelize, Sequelize) => {
  const ItemCarrito = sequelize.define(
    "item_carrito",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_carrito: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "carritos_compras",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_presentacion_producto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "presentaciones_productos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      cantidad_unidad_venta: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false,
      },
      precio_unitario: {
        // snapshot del precio al momento de agregar al carrito
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      subtotal_linea: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "items_carrito",
      timestamps: true,
      underscored: true,
    }
  );

  return ItemCarrito;
};

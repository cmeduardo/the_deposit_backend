module.exports = (sequelize, Sequelize) => {
    const Proveedor = sequelize.define(
        "proveedor",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            nombre: {
                type: Sequelize.STRING(150),
                allowNull: false,
            },
            nit: {
                type: Sequelize.STRING(10),
                allowNull: true,
            },
            tipo: {
                type: Sequelize.STRING(50),
                allowNull: true, // Supermercado, Tienda en línea, etc.
            },
            telefono: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            correo: {
                type: Sequelize.STRING(150),
                allowNull: true,
            },
            direccion: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            notas: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            activo: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            tableName: "proveedores",
            timestamps: true,
            underscored: true,
        }
    );

    return Proveedor;
};

module.exports = (sequelize, Sequelize) => {
  const Usuario = sequelize.define(
    "usuario",
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

      correo: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      contrasena_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      rol: {
        type: Sequelize.ENUM("ADMINISTRADOR", "VENDEDOR", "CLIENTE"),
        allowNull: false,
        defaultValue: "CLIENTE",
      },

      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      telefono: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },

      nit: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: "CF", // Consumidor Final
      },

      direccion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      dpi: {
        type: Sequelize.STRING(25),
        allowNull: true,
      },
    },
    {
      tableName: "usuarios",
      timestamps: true,
      underscored: true, // created_at, updated_at
    }
  );

  return Usuario;
};

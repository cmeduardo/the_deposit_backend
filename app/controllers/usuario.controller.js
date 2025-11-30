const bcrypt = require("bcryptjs");
const db = require("../models");
const Usuario = db.usuarios;

const ROLES_VALIDOS = ["ADMINISTRADOR", "VENDEDOR", "CLIENTE"];

// GET /api/usuarios
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ["id", "nombre", "correo", "rol", "activo", "createdAt", "updatedAt"],
    });

    return res.json(usuarios);
  } catch (err) {
    console.error("Error en listarUsuarios:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/usuarios/:id
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      attributes: ["id", "nombre", "correo", "rol", "activo", "createdAt", "updatedAt"],
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    return res.json(usuario);
  } catch (err) {
    console.error("Error en obtenerUsuarioPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/usuarios
// Crea usuarios de cualquier rol (ADMINISTRADOR, VENDEDOR, CLIENTE)
const crearUsuario = async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol, activo } = req.body;

    if (!nombre || !correo || !contrasena || !rol) {
      return res.status(400).json({
        mensaje: "Nombre, correo, contraseña y rol son obligatorios",
      });
    }

    if (!ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({
        mensaje: `Rol inválido. Roles permitidos: ${ROLES_VALIDOS.join(", ")}`,
      });
    }

    const existente = await Usuario.findOne({ where: { correo } });
    if (existente) {
      return res
        .status(409)
        .json({ mensaje: "Ya existe un usuario con ese correo" });
    }

    const salt = await bcrypt.genSalt(10);
    const contrasena_hash = await bcrypt.hash(contrasena, salt);

    const usuario = await Usuario.create({
      nombre,
      correo,
      contrasena_hash,
      rol,
      activo: activo !== undefined ? activo : true,
    });

    return res.status(201).json({
      mensaje: "Usuario creado correctamente",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        activo: usuario.activo,
      },
    });
  } catch (err) {
    console.error("Error en crearUsuario:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// PATCH /api/usuarios/:id
// Actualizar datos básicos y rol. Si se envía contrasena, se actualiza.
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, rol, activo, contrasena } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (rol && !ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({
        mensaje: `Rol inválido. Roles permitidos: ${ROLES_VALIDOS.join(", ")}`,
      });
    }

    if (correo && correo !== usuario.correo) {
      const existente = await Usuario.findOne({ where: { correo } });
      if (existente) {
        return res
          .status(409)
          .json({ mensaje: "Ya existe un usuario con ese correo" });
      }
    }

    if (nombre !== undefined) usuario.nombre = nombre;
    if (correo !== undefined) usuario.correo = correo;
    if (rol !== undefined) usuario.rol = rol;
    if (activo !== undefined) usuario.activo = activo;

    if (contrasena) {
      const salt = await bcrypt.genSalt(10);
      usuario.contrasena_hash = await bcrypt.hash(contrasena, salt);
    }

    await usuario.save();

    return res.json({
      mensaje: "Usuario actualizado correctamente",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        activo: usuario.activo,
      },
    });
  } catch (err) {
    console.error("Error en actualizarUsuario:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// PATCH /api/usuarios/:id/estado
// Activar / desactivar usuario
const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (activo === undefined) {
      return res.status(400).json({
        mensaje: "El campo 'activo' es obligatorio (true/false)",
      });
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    usuario.activo = activo;
    await usuario.save();

    return res.json({
      mensaje: "Estado del usuario actualizado correctamente",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        activo: usuario.activo,
      },
    });
  } catch (err) {
    console.error("Error en cambiarEstadoUsuario:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
};

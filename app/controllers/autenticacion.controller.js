const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const Usuario = db.usuarios;

const JWT_SECRETO = process.env.JWT_SECRETO;
const JWT_EXPIRA_EN = process.env.JWT_EXPIRA_EN;

const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      rol: usuario.rol,
    },
    JWT_SECRETO,
    { expiresIn: JWT_EXPIRA_EN }
  );
};

// POST /api/autenticacion/registro
const registrar = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({
        mensaje: "Nombre, correo y contraseña son obligatorios",
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
      rol: "CLIENTE", // registro público -> cliente
    });

    const token = generarToken(usuario);

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (err) {
    console.error("Error en registrar:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/autenticacion/login
const iniciarSesion = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({
        mensaje: "Correo y contraseña son obligatorios",
      });
    }

    const usuario = await Usuario.findOne({ where: { correo } });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const coincide = await bcrypt.compare(
      contrasena,
      usuario.contrasena_hash
    );

    if (!coincide) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const token = generarToken(usuario);

    return res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (err) {
    console.error("Error en iniciarSesion:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/autenticacion/perfil
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    return res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    });
  } catch (err) {
    console.error("Error en obtenerPerfil:", err);
    return res
      .status(500)
      .json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  registrar,
  iniciarSesion,
  obtenerPerfil,
};

const db = require("../models");
const Proveedor = db.proveedores;

const listarProveedores = async (req, res) => {
  try {
    const { activo } = req.query;
    const where = {};
    if (activo !== undefined) where.activo = activo === "true";

    const proveedores = await Proveedor.findAll({ where });
    return res.json(proveedores);
  } catch (err) {
    console.error("Error en listarProveedores:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const obtenerProveedorPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      return res.status(404).json({ mensaje: "Proveedor no encontrado" });
    }
    return res.json(proveedor);
  } catch (err) {
    console.error("Error en obtenerProveedorPorId:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const obtenerProveedorPorNit = async (req, res) => {
  try {
    const { nit } = req.params;  
    const proveedor = await Proveedor.findOne({
      where: { nit: nit }
    });
    
    if (!proveedor) {
      return res.status(404).json({ mensaje: "Proveedor no encontrado" });
    }
    
    return res.json(proveedor);
  } catch (err) {
    console.error("Error en obtenerProveedorPorNit:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const crearProveedor = async (req, res) => {
  try {
    const { nombre, nit, tipo, telefono, correo, direccion, notas, activo } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: "El nombre es obligatorio" });
    }

    const proveedor = await Proveedor.create({
      nombre,
      nit,
      tipo,
      telefono,
      correo,
      direccion,
      notas,
      activo: activo !== undefined ? activo : true,
    });

    return res.status(201).json({
      mensaje: "Proveedor creado correctamente",
      proveedor,
    });
  } catch (err) {
    console.error("Error en crearProveedor:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, nit, tipo, telefono, correo, direccion, notas, activo } = req.body;

    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      return res.status(404).json({ mensaje: "Proveedor no encontrado" });
    }

    if (nombre !== undefined) proveedor.nombre = nombre;
    if (nit !== undefined) proveedor.nit = nit;
    if (tipo !== undefined) proveedor.tipo = tipo;
    if (telefono !== undefined) proveedor.telefono = telefono;
    if (correo !== undefined) proveedor.correo = correo;
    if (direccion !== undefined) proveedor.direccion = direccion;
    if (notas !== undefined) proveedor.notas = notas;
    if (activo !== undefined) proveedor.activo = activo;

    await proveedor.save();

    return res.json({
      mensaje: "Proveedor actualizado correctamente",
      proveedor,
    });
  } catch (err) {
    console.error("Error en actualizarProveedor:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  listarProveedores,
  obtenerProveedorPorId,
  obtenerProveedorPorNit,
  crearProveedor,
  actualizarProveedor,
};

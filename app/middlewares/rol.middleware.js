const rolMiddleware = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ mensaje: "No autenticado" });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permisos para esta acción" });
    }

    next();
  };
};

module.exports = rolMiddleware;

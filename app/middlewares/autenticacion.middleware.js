const jwt = require("jsonwebtoken");

const autenticacionMiddleware = (req, res, next) => {
  const cabecera = req.headers["authorization"];

  if (!cabecera) {
    return res.status(401).json({ mensaje: "No se proporcionó token" });
  }

  const partes = cabecera.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({ mensaje: "Formato de token inválido" });
  }

  const token = partes[1];

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRETO || "cambiar_esto"
    );

    req.usuario = {
      id: payload.id,
      rol: payload.rol,
    };

    next();
  } catch (err) {
    console.error("Error verificando token:", err);
    return res
      .status(401)
      .json({ mensaje: "Token inválido o expirado" });
  }
};

module.exports = autenticacionMiddleware;

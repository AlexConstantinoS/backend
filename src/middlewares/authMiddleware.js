
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Autenticación requerida",
    });
  }

  const token = authorization.slice(7);

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error("JWT_SECRET no está configurado correctamente");
    return res.status(500).json({
      error: "Error de configuración de autenticación",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "zerotrust-api",
      audience: "zerotrust-web",
    });

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido o expirado",
    });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "No tienes permiso para acceder a este recurso",
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};

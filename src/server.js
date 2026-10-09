
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const authRoutes = require("./routes/authRoutes");
const {
  authenticateToken,
  authorizeRoles,
} = require("./middlewares/authMiddleware");

// Cabeceras HTTP de seguridad
app.use(helmet());


const allowedOrigin =
  process.env.FRONTEND_URL || "http://localhost:5174";

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin) {
        return callback(null, true);
      }

      return callback(null, false);
    },
  })
);

// Interpretar solicitudes con contenido JSON
app.use(express.json({ limit: "10kb" }));
app.use("/api/auth", authRoutes);
app.get("/api/me", authenticateToken, (req, res) => {
  res.json({
    message: "Acceso autorizado",
    user: req.user,
  });
});

app.get(
  "/api/admin",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      message: "Acceso de administrador autorizado",
    });
  }
);
// Ruta de comprobación
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API funcionando correctamente",
  });
});

// Ruta para direcciones inexistentes
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
  });
});

// Manejo básico de errores

app.use((err, req, res, next) => {
  const status =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 600
      ? err.status
      : 500;

  if (status >= 500) {
    console.error("Error en la API:", err.message);
  }

  return res.status(status).json({
    error: status === 500
      ? "Error interno del servidor"
      : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`API disponible en http://localhost:${PORT}`);
});

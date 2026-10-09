
const express = require("express");
const authController = require("../controllers/authController");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiados intentos. Intenta de nuevo más tarde.",
  },
});

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);

module.exports = router;


const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

async function register({ name, email, password }) {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedName || !normalizedEmail || !password) {
    const error = new Error("Todos los campos son obligatorios");
    error.status = 400;
    throw error;
  }

  if (normalizedName.length > 100 || normalizedEmail.length > 255) {
    const error = new Error("Los datos exceden la longitud permitida");
    error.status = 400;
    throw error;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    const error = new Error("El correo electrónico no es válido");
    error.status = 400;
    throw error;
  }

  if (typeof password !== "string" || password.length < 12 || password.length > 72) {
    const error = new Error("La contraseña debe tener entre 12 y 72 caracteres");
    error.status = 400;
    throw error;
  }

  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("No se pudo registrar el usuario con esos datos");
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return userRepository.createUser({
    name: normalizedName,
    email: normalizedEmail,
    passwordHash,
  });
}

async function login({ email, password }) {
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    const error = new Error("Correo y contraseña son obligatorios");
    error.status = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    const error = new Error("Correo o contraseña incorrectos");
    error.status = 401;
    throw error;
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("La configuración de autenticación no está disponible");
  }

  const token = jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: "15m",
      issuer: "zerotrust-api",
      audience: "zerotrust-web",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = {
  register,
  login,
};

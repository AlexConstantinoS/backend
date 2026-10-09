
const pool = require("../config/database");

async function findByEmail(email) {
  const result = await pool.query(
    `SELECT id, name, email, password_hash, role, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
}

async function createUser({ name, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'user')
     RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash]
  );

  return result.rows[0];
}

module.exports = {
  findByEmail,
  createUser,
};


const pool = require("./database");

async function testDatabase() {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, NOW() AS server_time"
    );

    console.log("Conexión a PostgreSQL exitosa:");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("No se pudo conectar a PostgreSQL:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testDatabase();

// scripts/debug-neon.ts
import "dotenv/config";
import { Pool } from "pg";

async function debugNeon() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL no está definida");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    console.log("✅ Conectado a Neon");

    // 1️⃣ Listar tablas
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    console.log("📦 Tablas:");
    tables.rows.forEach((t: { table_name: any; }) => console.log(" -", t.table_name));

    // 2️⃣ Ver usuarios (ajusta si la tabla se llama distinto)
    console.log("\n👤 Usuarios:");
    const users = await client.query(`
      SELECT *
      FROM users
      LIMIT 10
    `);

    console.table(users.rows);

  } catch (err) {
    console.error("❌ Error consultando Neon:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

debugNeon();

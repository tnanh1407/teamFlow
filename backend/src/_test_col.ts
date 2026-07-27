import pool from "./config/database.js";

try {
  // Test what column names actually exist
  const r = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
  );
  console.log("Users columns:");
  for (const row of r.rows) {
    console.log(`  ${row.column_name} (${row.data_type})`);
  }

  // Test find by username with snake_case
  const r2 = await pool.query(
    "SELECT * FROM users WHERE username = $1",
    ["admin"]
  );
  console.log("\nUser found:", r2.rows.length > 0);
  if (r2.rows.length > 0) {
    console.log("Row keys:", Object.keys(r2.rows[0]));
  }
} catch (e) {
  console.error("Error:", e.message);
}
await pool.end();

import pool from "./config/database.js";

const tables = ["departments", "employees", "positions", "projects", "users", "project_comments", "project_departments", "project_employees", "project_logs"];

for (const table of tables) {
  const r = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
    [table]
  );
  console.log(`\n${table}:`);
  for (const row of r.rows) {
    console.log(`  ${row.column_name}`);
  }
}

await pool.end();

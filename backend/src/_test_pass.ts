import bcrypt from "bcryptjs";

// Test all known password hashes
const tests = [
  { username: "admin", hash: "$2b$10$KjKzLbjsYfIMvHBwVjCz0uo", password: "admin123" },
];

for (const t of tests) {
  const match = bcrypt.compareSync(t.password, t.hash);
  console.log(`${t.username}: compare("${t.password}") => ${match}`);
}

// Also test: does the current users table have proper hashes?
import pool from "./config/database.js";

const { rows } = await pool.query("SELECT username, password FROM users WHERE username = 'admin'");
if (rows.length > 0) {
  const storedHash = rows[0].password;
  console.log("\nStored hash:", storedHash);
  console.log("Matches admin123:", bcrypt.compareSync("admin123", storedHash));
}
await pool.end();

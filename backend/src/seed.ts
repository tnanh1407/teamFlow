import pool from "./config/database.js";
import users from "./data/user.data.js";

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM users");

    for (const user of users) {
      await client.query(
        `INSERT INTO users (employee_id, username, password, role, status) VALUES ($1, $2, $3, $4, $5)`,
        [user.employeeId, user.username, user.password, user.role, user.status]
      );
    }

    console.log("Seeded 2 users successfully");
    console.log("---");
    console.log("Admin: admin / admin123");
    console.log("User:  user  / user123");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();

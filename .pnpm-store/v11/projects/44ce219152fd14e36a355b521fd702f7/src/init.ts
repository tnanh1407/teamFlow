import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dropAll = async () => {
  await pool.query(`
    DROP TABLE IF EXISTS sessions CASCADE;
    DROP TABLE IF EXISTS password_resets CASCADE;
    DROP TABLE IF EXISTS project_tasks CASCADE;
    DROP TABLE IF EXISTS project_logs CASCADE;
    DROP TABLE IF EXISTS project_comments CASCADE;
    DROP TABLE IF EXISTS project_departments CASCADE;
    DROP TABLE IF EXISTS project_employees CASCADE;
    DROP TABLE IF EXISTS project_notifications CASCADE;
    DROP TABLE IF EXISTS system_notifications CASCADE;
    DROP TABLE IF EXISTS system_notification_reads CASCADE;
    DROP TABLE IF EXISTS projects CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS departments CASCADE;
    DROP TABLE IF EXISTS positions CASCADE;
    DROP TYPE IF EXISTS EUserRole;
    DROP TYPE IF EXISTS Eposition;
    DROP TYPE IF EXISTS EProjectStatus;
    DROP TYPE IF EXISTS ENotificationType;
    DROP TYPE IF EXISTS ESystemNotificationSource;
    DROP TYPE IF EXISTS ESystemNotificationAudience;
    DROP TYPE IF EXISTS EPriority;
    DROP TYPE IF EXISTS EGender;
    DROP TYPE IF EXISTS EProjectRole;
    DROP TYPE IF EXISTS ELevel;
    DROP TYPE IF EXISTS EProjectAction;
    DROP TYPE IF EXISTS EProjectTaskStatus;
  `);
};

const init = async () => {
  const sqlPath = path.resolve(__dirname, "../sql/init.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  try {
    await dropAll();
    await pool.query(sql);
    console.log("✅ Database tables created successfully from init.sql");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
};

init();

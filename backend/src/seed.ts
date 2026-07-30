import pool from "./config/database.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "./data");

const loadJSON = <T = any>(file: string): T[] =>
  JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${file}.json`), "utf-8"));

const pwdFor = (username: string): string => {
  if (username === "root") return "root123";
  if (username === "admin") return "admin123";
  if (username.endsWith("_manager") || username === "manager") return "manager123";
  return "123456";
};

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM task_logs");
    await client.query("DELETE FROM task_comments");
    await client.query("DELETE FROM task_departments");
    await client.query("DELETE FROM task_employees");
    await client.query("DELETE FROM tasks");
    await client.query("UPDATE departments SET manager_id = NULL");
    await client.query("DELETE FROM users");
    await client.query("DELETE FROM departments");
    await client.query("DELETE FROM positions");

    const dataFiles = fs.readdirSync(DATA_DIR)
      .filter(f => f.endsWith(".json"))
      .map(f => f.replace(".json", ""));
    const has = (name: string) => dataFiles.includes(name);

    const counts: Record<string, number> = {};

    if (has("departments")) {
      const data = loadJSON<any>("departments");
      for (const d of data) {
        await client.query(
          `INSERT INTO departments (id, name, code, description, is_active, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [d.id, d.name, d.code, d.description, d.isActive, d.createdAt, d.updatedAt]
        );
      }
      counts.departments = data.length;
      console.log(`Inserted ${data.length} departments`);
    }

    if (has("positions")) {
      const data = loadJSON<any>("positions");
      for (const p of data) {
        await client.query(
          `INSERT INTO positions (id, name, description, level, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6)`,
          [p.id, p.name, p.description, p.level, p.createdAt, p.updatedAt]
        );
      }
      counts.positions = data.length;
      console.log(`Inserted ${data.length} positions`);
    }

    if (has("users")) {
      const data = loadJSON<any>("users");
      for (const u of data) {
        const hashed = bcrypt.hashSync(pwdFor(u.username), 10);
        await client.query(
          `INSERT INTO users (id, department_id, position_id, employee_code, name, email, phone, birth_date, hire_date, gender, username, password, role, position, status, avatar_url, last_login, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
          [u.id, u.departmentId, u.positionId, u.employeeCode, u.name, u.email, u.phone, u.birthDate, u.hireDate, u.gender, u.username, hashed, u.role, u.position, u.status, u.avatarURL, u.lastLogin, u.createdAt, u.updatedAt]
        );
      }
      counts.users = data.length;
      console.log(`Inserted ${data.length} users`);
    }

    if (has("departments")) {
      const data = loadJSON<any>("departments");
      for (const d of data) {
        if (d.managerId) {
          await client.query(
            `UPDATE departments SET manager_id = $1 WHERE id = $2`,
            [d.managerId, d.id]
          );
        }
      }
      console.log("Updated department managers");
    }

    if (has("tasks")) {
      const data = loadJSON<any>("tasks");
      for (const t of data) {
        await client.query(
          `INSERT INTO tasks (id, title, description, priority, status, progress, start_date, due_date, assigned_by, created_by, completed_by, estimated_hours, actual_hours, completed_at, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
          [t.id, t.title, t.description, t.priority, t.status, t.progress, t.startDate, t.dueDate, t.assignedBy, t.createdBy, t.completedBy || null, t.estimatedHours, t.actualHours, t.completedAt || null, t.createdAt, t.updatedAt]
        );
      }
      counts.tasks = data.length;
      console.log(`Inserted ${data.length} tasks`);
    }

    if (has("task_employees")) {
      const data = loadJSON<any>("task_employees");
      for (const te of data) {
        await client.query(
          `INSERT INTO task_employees (id, task_id, employee_id, role, assigned_at) VALUES ($1,$2,$3,$4,$5)`,
          [te.id, te.taskId, te.employeeId, te.role, te.assignedAt]
        );
      }
      counts.task_employees = data.length;
      console.log(`Inserted ${data.length} task_employees`);
    }

    if (has("task_departments")) {
      const data = loadJSON<any>("task_departments");
      for (const td of data) {
        await client.query(
          `INSERT INTO task_departments (task_id, department_id, assigned_at) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
          [td.taskId, td.departmentId, td.assignedAt]
        );
      }
      counts.task_departments = data.length;
      console.log(`Inserted ${data.length} task_departments`);
    }

    if (has("task_comments")) {
      const data = loadJSON<any>("task_comments");
      for (const c of data) {
        await client.query(
          `INSERT INTO task_comments (id, task_id, employee_id, content, attachments, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [c.id, c.taskId, c.employeeId, c.content, c.attachments, c.createdAt, c.updatedAt]
        );
      }
      counts.task_comments = data.length;
      console.log(`Inserted ${data.length} task_comments`);
    }

    if (has("task_logs")) {
      const data = loadJSON<any>("task_logs");
      for (const l of data) {
        await client.query(
          `INSERT INTO task_logs (id, task_id, employee_id, action, description, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
          [l.id, l.taskId, l.employeeId, l.action, l.description, l.createdAt]
        );
      }
      counts.task_logs = data.length;
      console.log(`Inserted ${data.length} task_logs`);
    }

    await client.query("COMMIT");

    console.log("\n✅ Seed completed successfully!");
    console.log("---");
    const summary = Object.entries(counts)
      .map(([k, v]) => `${v} ${k}`)
      .join(", ");
    console.log(`Summary: ${summary}`);
    process.exit(0);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Seed error:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();

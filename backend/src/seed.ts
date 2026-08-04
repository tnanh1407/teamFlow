import pool from "./config/database.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "./data");

const loadJSON = <T = any>(file: string): T[] =>
  JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${file}.json`), "utf-8").replace(/^\uFEFF/, ""));

const pwdFor = (username: string): string => {
  if (username === "root") return "root123";
  if (username === "admin") return "admin123";
  if (username.endsWith("_manager") || username === "manager") return "manager123";
  return "123456";
};

const normalizePosition = (value: string | undefined) => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "member") return "staff";
  if (normalized === "manager" || normalized === "staff" || normalized === "intern") return normalized;
  return null;
};

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query(`ALTER TYPE Eposition ADD VALUE IF NOT EXISTS 'staff'`);
    await client.query(`ALTER TYPE Eposition ADD VALUE IF NOT EXISTS 'intern'`);
    await client.query("BEGIN");

    await client.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS ck_users_position`);
    await client.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS ck_users_admin_assignment`);
    await client.query(`ALTER TABLE users DROP COLUMN IF EXISTS position`);
    await client.query(`ALTER TABLE users ALTER COLUMN department_id DROP NOT NULL`);
    await client.query(`ALTER TABLE users ALTER COLUMN position_id DROP NOT NULL`);
    await client.query(`ALTER TABLE users ALTER COLUMN employee_code DROP NOT NULL`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS leave_date DATE`);
    await client.query("DELETE FROM project_logs");
    await client.query("DELETE FROM project_tasks");
    await client.query("DELETE FROM project_comments");
    await client.query("DELETE FROM project_departments");
    await client.query("DELETE FROM project_employees");
    await client.query("DELETE FROM projects");
    await client.query("UPDATE departments SET manager_id = NULL");
    await client.query("DELETE FROM users");
    await client.query(`
      ALTER TABLE users
      ADD CONSTRAINT ck_users_admin_assignment
      CHECK (
        (role = 'admin' AND department_id IS NULL AND position_id IS NULL)
        OR
        (role <> 'admin' AND department_id IS NOT NULL AND position_id IS NOT NULL)
      )
    `);
    await client.query(`
      ALTER TABLE users
      ADD CONSTRAINT ck_users_employee_code_role
      CHECK (
        (role = 'admin' AND employee_code IS NULL)
        OR
        (role <> 'admin' AND employee_code IS NOT NULL AND length(trim(employee_code)) > 0)
      )
    `);
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
          `INSERT INTO users (id, department_id, position_id, employee_code, name, email, phone, birth_date, hire_date, leave_date, gender, username, password, role, status, avatar_url, last_login, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
          [u.id, u.role === "admin" ? null : u.departmentId, u.role === "admin" ? null : u.positionId, u.role === "admin" ? null : u.employeeCode, u.name, u.email, u.phone, u.birthDate, u.hireDate, u.leaveDate ?? null, u.gender, u.username, hashed, u.role, u.status, u.avatarURL, u.lastLogin, u.createdAt, u.updatedAt]
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

    if (has("projects")) {
      const data = loadJSON<any>("projects");
      for (const t of data) {
        await client.query(
          `INSERT INTO projects (id, title, description, priority, status, progress, start_date, due_date, assigned_by, created_by, estimated_hours, actual_hours, completed_at, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          [t.id, t.title, t.description, t.priority, t.status, t.progress, t.startDate, t.dueDate, t.assignedBy, t.createdBy, t.estimatedHours, t.actualHours, t.completedAt || null, t.createdAt, t.updatedAt]
        );
      }
      counts.projects = data.length;
      console.log(`Inserted ${data.length} projects`);
    }

    if (has("project_employees")) {
      const data = loadJSON<any>("project_employees");
      for (const te of data) {
        await client.query(
          `INSERT INTO project_employees (id, project_id, employee_id, role, assigned_at) VALUES ($1,$2,$3,$4,$5)`,
          [te.id, te.projectId, te.employeeId, te.role, te.assignedAt]
        );
      }
      counts.project_employees = data.length;
      console.log(`Inserted ${data.length} project_employees`);
    }

    if (has("project_departments")) {
      const data = loadJSON<any>("project_departments");
      for (const td of data) {
        await client.query(
          `INSERT INTO project_departments (project_id, department_id, assigned_at) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
          [td.projectId, td.departmentId, td.assignedAt]
        );
      }
      counts.project_departments = data.length;
      console.log(`Inserted ${data.length} project_departments`);
    }

    if (has("project_comments")) {
      const data = loadJSON<any>("project_comments");
      for (const c of data) {
        await client.query(
          `INSERT INTO project_comments (id, project_id, employee_id, content, attachments, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [c.id, c.projectId, c.employeeId, c.content, c.attachments, c.createdAt, c.updatedAt]
        );
      }
      counts.project_comments = data.length;
      console.log(`Inserted ${data.length} project_comments`);
    }

    if (has("project_logs")) {
      const data = loadJSON<any>("project_logs");
      for (const l of data) {
        await client.query(
          `INSERT INTO project_logs (id, project_id, employee_id, action, description, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
          [l.id, l.projectId, l.employeeId, l.action, l.description, l.createdAt]
        );
      }
      counts.project_logs = data.length;
      console.log(`Inserted ${data.length} project_logs`);
    }

    if (has("project_tasks")) {
      const data = loadJSON<any>("project_tasks");
      for (const t of data) {
        await client.query(
          `INSERT INTO project_tasks (id, project_id, title, description, status, priority, assigned_to, assigned_by, assigned_at, due_date, created_by, completed_at, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [t.id, t.projectId, t.title, t.description, t.status, t.priority, t.assignedTo, t.assignedBy, t.assignedAt, t.dueDate, t.createdBy, t.completedAt || null, t.createdAt, t.updatedAt]
        );
      }
      counts.project_tasks = data.length;
      console.log(`Inserted ${data.length} project_tasks`);
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

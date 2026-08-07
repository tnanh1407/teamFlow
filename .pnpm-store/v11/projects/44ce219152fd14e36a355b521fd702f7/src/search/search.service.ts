import pool from "../config/database.js";
import { EAccountRole } from "../enums/account-role.enum.js";
import {
  UserSchema,
  DepartmentSchema,
  PositionSchema,
  ProjectSchema,
  ProjectTaskSchema,
} from "../schemas/index.js";

const userColumns = UserSchema.columns;
const departmentColumns = DepartmentSchema.columns;
const positionColumns = PositionSchema.columns;
const projectColumns = ProjectSchema.columns;
const projectTaskColumns = ProjectTaskSchema.columns;

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (m) => `\\${m}`);

class SearchService {
  async searchAll(keyword: string, userId: string, role: string, limit = 5) {
    const q = keyword.trim();
    if (!q) {
      return { users: [], projects: [], tasks: [], departments: [], positions: [] };
    }
    const like = `%${escapeLike(q)}%`;
    const isAdmin = role === EAccountRole.ADMIN;

    const users = pool.query(
      `SELECT ${userColumns} FROM users
       WHERE name ILIKE $1 OR username ILIKE $1 OR email ILIKE $1 OR employee_code ILIKE $1 OR id::text ILIKE $1
       ORDER BY created_at DESC LIMIT $2`,
      [like, limit]
    );

    const projects = isAdmin
      ? pool.query(
          `SELECT ${projectColumns} FROM projects
           WHERE title ILIKE $1 OR description ILIKE $1
           ORDER BY created_at DESC LIMIT $2`,
          [like, limit]
        )
      : pool.query(
          `SELECT DISTINCT ${projectColumns
            .split(",")
            .map((c) => `t.${c.trim()}`)
            .join(", ")} FROM projects t
           LEFT JOIN project_employees te ON te.project_id = t.id
           LEFT JOIN users e ON e.id = $1
           LEFT JOIN project_departments td ON td.project_id = t.id
           WHERE (te.employee_id = $1 OR t.created_by = $1 OR td.department_id = e.department_id)
             AND (t.title ILIKE $2 OR t.description ILIKE $2)
           ORDER BY t.created_at DESC LIMIT $3`,
          [userId, like, limit]
        );

    const tasks = isAdmin
      ? pool.query(
          `SELECT ${projectTaskColumns} FROM project_tasks
           WHERE title ILIKE $1 OR description ILIKE $1
           ORDER BY created_at DESC LIMIT $2`,
          [like, limit]
        )
      : pool.query(
          `SELECT DISTINCT ${projectTaskColumns
            .split(",")
            .map((c) => `tk.${c.trim()}`)
            .join(", ")} FROM project_tasks tk
           JOIN projects p ON p.id = tk.project_id
           LEFT JOIN project_employees te ON te.project_id = p.id
           LEFT JOIN users e ON e.id = $1
           LEFT JOIN project_departments td ON td.project_id = p.id
           WHERE (te.employee_id = $1 OR p.created_by = $1 OR td.department_id = e.department_id)
             AND (tk.title ILIKE $2 OR tk.description ILIKE $2)
           ORDER BY tk.created_at DESC LIMIT $3`,
          [userId, like, limit]
        );

    const departments = isAdmin
      ? pool.query(
          `SELECT ${departmentColumns} FROM departments
           WHERE name ILIKE $1 OR code ILIKE $1
           ORDER BY created_at DESC LIMIT $2`,
          [like, limit]
        )
      : Promise.resolve({ rows: [] });

    const positions = isAdmin
      ? pool.query(
          `SELECT ${positionColumns} FROM positions
           WHERE name ILIKE $1 OR description ILIKE $1
           ORDER BY created_at DESC LIMIT $2`,
          [like, limit]
        )
      : Promise.resolve({ rows: [] });

    const [usersResult, projectsResult, tasksResult, departmentsResult, positionsResult] =
      await Promise.all([users, projects, tasks, departments, positions]);

    return {
      users: usersResult.rows,
      projects: projectsResult.rows,
      tasks: tasksResult.rows,
      departments: departmentsResult.rows,
      positions: positionsResult.rows,
    };
  }
}

export default new SearchService();

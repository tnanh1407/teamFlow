import pool from "../../config/database.js";
import { ProjectLogSchema } from "../../schemas/index.js";

interface ProjectLogRow {
  id: string;
  projectId: string;
  employeeId: string;
  action: string;
  description: string;
  createdAt: Date;
}

const projectLogColumns = ProjectLogSchema.columns;

class ProjectLogService {
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const countResult = await pool.query<{ count: string }>(`SELECT COUNT(*) as count FROM project_logs`);
    const total = parseInt(countResult.rows[0].count, 10);
    const { rows } = await pool.query<ProjectLogRow>(
      `SELECT ${projectLogColumns} FROM project_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const { rows } = await pool.query<ProjectLogRow>(
      `SELECT ${projectLogColumns} FROM project_logs WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByProject(projectId: string) {
    const { rows } = await pool.query<ProjectLogRow>(
      `SELECT ${projectLogColumns} FROM project_logs WHERE project_id = $1 ORDER BY created_at DESC`,
      [projectId]
    );
    return rows;
  }

  async findByEmployee(employeeId: string) {
    const { rows } = await pool.query<ProjectLogRow>(
      `SELECT ${projectLogColumns} FROM project_logs WHERE employee_id = $1 ORDER BY created_at DESC`,
      [employeeId]
    );
    return rows;
  }

  async create(data: {
    projectId: string;
    employeeId: string;
    action?: string;
    description?: string;
  }) {
    const { rows } = await pool.query<ProjectLogRow>(
      `INSERT INTO project_logs (project_id, employee_id, action, description) VALUES ($1, $2, $3, $4) RETURNING ${projectLogColumns}`,
      [data.projectId, data.employeeId, data.action || null, data.description || null]
    );
    return rows[0];
  }
}

export default new ProjectLogService();

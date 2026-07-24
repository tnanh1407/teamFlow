import pool from "../config/database.js";
import { ProjectLogSchema } from "../schemas/index.js";

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
  async findAll() {
    const { rows } = await pool.query<ProjectLogRow>(
      `SELECT ${projectLogColumns} FROM project_logs ORDER BY created_at DESC`
    );
    return rows;
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

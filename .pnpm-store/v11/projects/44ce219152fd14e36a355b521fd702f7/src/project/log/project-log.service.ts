import pool from "../../config/database.js";
import { ProjectLogSchema } from "../../schemas/index.js";
import { AppError } from "../../utils/errors/app-error.js";

// dữ liệu database
interface ProjectLogRow {
  id: string;
  projectId: string;
  employeeId: string;
  action: string;
  description: string;
  createdAt: Date;
}

// dữ liệu đầu vào
export interface CreateProjectLogDataInput {
  projectId: string;
  employeeId: string;
  action?: string;
  description?: string;
}

const projectLogColumns = ProjectLogSchema.columns;

const normalizeOptionalText = (value: string | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};
const isAdminUser = async (userId: string) => {
  const { rows } = await pool.query<{ role: string }>(
    `SELECT role FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0]?.role === "admin";
};

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

  async create(data: CreateProjectLogDataInput) {
    // chuẩn hóa lại dữ liệu trước khi đẩy vào db
    if (await isAdminUser(data.employeeId)) {
      throw new AppError("Admin cannot be used as a project actor", 400);
    }
    const payload = {
      projectId: data.projectId,
      employeeId: data.employeeId,
      action: normalizeOptionalText(data.action),
      description: normalizeOptionalText(data.description),
    };

    const { rows } = await pool.query<ProjectLogRow>(
      `INSERT INTO project_logs (project_id, employee_id, action, description) VALUES ($1, $2, $3, $4) RETURNING ${projectLogColumns}`,
      [payload.projectId, payload.employeeId, payload.action, payload.description]
    );
    return rows[0];
  }
}

export default new ProjectLogService();

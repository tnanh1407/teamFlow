import pool from "../../config/database.js";
import { AppError } from "../../utils/errors/app-error.js";
import { ProjectSchema } from "../../schemas/index.js";

interface ProjectRow {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  progress: number;
  startDate: string;
  dueDate: string;
  assignedBy: string;
  createdBy: string;
  estimatedHours: number;
  actualHours: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
interface ProjectData {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  progress?: number;
  startDate?: string;
  dueDate?: string;
  assignedBy?: string;
  createdBy: string;
  estimatedHours?: number;
  actualHours?: number;
  completedAt?: Date;  
} 


export type CreateProjectDataInput = ProjectData
export type UpdateProjectDataInput = Partial<ProjectData>

const projectColumns = ProjectSchema.columns;

class ProjectService {
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const countResult = await pool.query<{ count: string }>(`SELECT COUNT(*) as count FROM projects`);
    const total = parseInt(countResult.rows[0].count, 10);
    const { rows } = await pool.query<ProjectRow>(
      `SELECT ${projectColumns} FROM projects ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const { rows } = await pool.query<ProjectRow>(
      `SELECT ${projectColumns} FROM projects WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByStatus(status: string) {
    const { rows } = await pool.query<ProjectRow>(
      `SELECT ${projectColumns} FROM projects WHERE status = $1 ORDER BY created_at DESC`,
      [status]
    );
    return rows;
  }

  async findByStatusForUser(status: string, userId: string) {
    const cols = projectColumns.split(",").map((c) => `t.${c.trim()}`).join(", ");
    const { rows } = await pool.query<ProjectRow>(
      `SELECT DISTINCT ${cols}
       FROM projects t
       LEFT JOIN project_employees te ON te.project_id = t.id
       LEFT JOIN users e ON e.id = $2
       LEFT JOIN project_departments td ON td.project_id = t.id
       WHERE t.status = $1
       AND (te.employee_id = $2 OR t.created_by = $2 OR td.department_id = e.department_id)
       ORDER BY t.created_at DESC`,
      [status, userId]
    );
    return rows;
}

  async findByPriority(priority: string) {
    const { rows } = await pool.query<ProjectRow>(
      `SELECT ${projectColumns} FROM projects WHERE priority = $1 ORDER BY created_at DESC`,
      [priority]
    );
    return rows;
  }

  async findByPriorityForUser(priority: string, userId: string) {
    const cols = projectColumns.split(",").map((c) => `t.${c.trim()}`).join(", ");
    const { rows } = await pool.query<ProjectRow>(
      `SELECT DISTINCT ${cols}
       FROM projects t
       LEFT JOIN project_employees te ON te.project_id = t.id
       LEFT JOIN users e ON e.id = $2
       LEFT JOIN project_departments td ON td.project_id = t.id
       WHERE t.priority = $1
       AND (te.employee_id = $2 OR t.created_by = $2 OR td.department_id = e.department_id)
       ORDER BY t.created_at DESC`,
      [priority, userId]
    );
    return rows;
  }

  async findByCreatedBy(employeeId: string) {
    const { rows } = await pool.query<ProjectRow>(
      `SELECT ${projectColumns} FROM projects WHERE created_by = $1 ORDER BY created_at DESC`,
      [employeeId]
    );
    return rows;
  }

  async findByEmployeeId(employeeId: string) {
    const cols = projectColumns.split(",").map((c) => `t.${c.trim()}`).join(", ");
    const { rows } = await pool.query<ProjectRow>(
      `SELECT DISTINCT ${cols}
       FROM projects t
       LEFT JOIN project_employees te ON te.project_id = t.id
       LEFT JOIN users e ON e.id = $1
       LEFT JOIN project_departments td ON td.project_id = t.id
       WHERE te.employee_id = $1 OR t.created_by = $1 OR td.department_id = e.department_id
       ORDER BY t.created_at DESC`,
      [employeeId]
    );
    return rows;
  }

  async create(data: CreateProjectDataInput) {
    const { rows } = await pool.query<ProjectRow>(
      `INSERT INTO projects (title, description, priority, status, progress, start_date, due_date, assigned_by, created_by, estimated_hours, actual_hours) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING ${projectColumns}`,
      [
        data.title, data.description || null, data.priority || "medium",
        data.status || "todo", data.progress ?? 0, data.startDate || null,
        data.dueDate || null, data.assignedBy || null, data.createdBy,
        data.estimatedHours || null, data.actualHours || null,
      ]
    );
    return rows[0];
  }

  async update(id: string, data: UpdateProjectDataInput) {
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.title !== undefined) { setClauses.push(`title = $${idx++}`); values.push(data.title); }
    if (data.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(data.description); }
    if (data.priority !== undefined) { setClauses.push(`priority = $${idx++}`); values.push(data.priority); }
    if (data.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(data.status); }
    if (data.progress !== undefined) { setClauses.push(`progress = $${idx++}`); values.push(data.progress); }
    if (data.startDate !== undefined) { setClauses.push(`start_date = $${idx++}`); values.push(data.startDate); }
    if (data.dueDate !== undefined) { setClauses.push(`due_date = $${idx++}`); values.push(data.dueDate); }
    if (data.assignedBy !== undefined) { setClauses.push(`assigned_by = $${idx++}`); values.push(data.assignedBy); }
    if (data.estimatedHours !== undefined) { setClauses.push(`estimated_hours = $${idx++}`); values.push(data.estimatedHours); }
    if (data.actualHours !== undefined) { setClauses.push(`actual_hours = $${idx++}`); values.push(data.actualHours); }
    if (data.completedAt !== undefined) { setClauses.push(`completed_at = $${idx++}`); values.push(data.completedAt); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query<ProjectRow>(
      `UPDATE projects SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${projectColumns}`,
      values
    );
    return rows[0] || null;
  }

  async delete(id: string) {
    const { rows } = await pool.query<ProjectRow>(
      `DELETE FROM projects WHERE id = $1 RETURNING ${projectColumns}`,
      [id]
    );
    return rows[0] || null;
  }
}

export default new ProjectService();

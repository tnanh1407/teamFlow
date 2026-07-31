import pool from "../../config/database.js";
import { AppError } from "../../utils/errors/app-error.js";
import { ProjectSchema } from "../../schemas/index.js";

interface ProjectRow {
  id: string;
  title: string;
  description: string;
  avatarURL: string;
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
  avatar?: string;
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

const normalizeRequiredText = (value: string) => value.trim();
const normalizeOptionalText = (value: string | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};
const toNumberOrNull = (v: unknown): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

class ProjectService {
  async findAll(
    page = 1,
    limit = 10,
    filters: { q?: string; status?: string; priority?: string; mine?: boolean; userId?: string } = {}
  ) {
    const offset = (page - 1) * limit;
    const { q, status, priority, mine, userId } = filters;

    const values: any[] = [];
    const conditions: string[] = [];
    let idx = 1;
    let distinct = "";
    let selectCols: string = projectColumns;
    let fromClause = "FROM projects";
    let orderBy = "created_at DESC";

    if (mine && userId) {
      distinct = "DISTINCT";
      selectCols = projectColumns.split(",").map((c) => `t.${c.trim()}`).join(", ");
      fromClause = `FROM projects t
        LEFT JOIN project_employees te ON te.project_id = t.id
        LEFT JOIN users e ON e.id = $${idx}
        LEFT JOIN project_departments td ON td.project_id = t.id`;
      orderBy = "t.created_at DESC";
      conditions.push(`(te.employee_id = $${idx} OR t.created_by = $${idx} OR td.department_id = e.department_id)`);
      values.push(userId);
      idx++;
    }

    if (q) {
      const titleCol = mine && userId ? "t.title" : "title";
      const descCol = mine && userId ? "t.description" : "description";
      conditions.push(`(${titleCol} ILIKE $${idx++} OR ${descCol} ILIKE $${idx++})`);
      values.push(`%${q}%`, `%${q}%`);
    }
    if (status) {
      conditions.push(`${mine && userId ? "t.status" : "status"} = $${idx++}`);
      values.push(status);
    }
    if (priority) {
      conditions.push(`${mine && userId ? "t.priority" : "priority"} = $${idx++}`);
      values.push(priority);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM (SELECT ${distinct} ${selectCols} ${fromClause} ${where}) sub`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const { rows } = await pool.query<ProjectRow>(
      `SELECT ${distinct} ${selectCols} ${fromClause} ${where} ORDER BY ${orderBy} LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
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

  async findEmployeesByProject(projectId: string) {
    const { rows } = await pool.query(
      `SELECT u.id, u.employee_code, u.name, u.email, u.avatar_url,
              u.position_id, u.department_id, pe.role AS "projectRole", pe.assigned_at
       FROM project_employees pe
       JOIN users u ON u.id = pe.employee_id
       WHERE pe.project_id = $1
       ORDER BY pe.assigned_at DESC`,
      [projectId]
    );
    return rows;
  }

  async create(data: CreateProjectDataInput) {
    if (!data.createdBy) throw new AppError("CreatedBy is required", 400);

    // chuẩn hóa lại dữ liệu trước khi đẩy vào db
    const payload = {
      title: normalizeRequiredText(data.title),
      description: normalizeOptionalText(data.description),
      avatar: normalizeOptionalText(data.avatar),
      priority: (data.priority || "medium").toLowerCase(),
      status: (data.status || "todo").toLowerCase(),
      progress: data.progress ?? 0,
      startDate: normalizeOptionalText(data.startDate),
      dueDate: normalizeOptionalText(data.dueDate),
      assignedBy: normalizeOptionalText(data.assignedBy),
      createdBy: data.createdBy,
      estimatedHours: toNumberOrNull(data.estimatedHours),
      actualHours: toNumberOrNull(data.actualHours),
    };

    const { rows } = await pool.query<ProjectRow>(
      `INSERT INTO projects (title, description, avatar_url, priority, status, progress, start_date, due_date, assigned_by, created_by, estimated_hours, actual_hours) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING ${projectColumns}`,
      [
        payload.title, payload.description, payload.avatar, payload.priority, payload.status,
        payload.progress, payload.startDate, payload.dueDate, payload.assignedBy,
        payload.createdBy, payload.estimatedHours, payload.actualHours,
      ]
    );
    return rows[0];
  }

  async update(id: string, data: UpdateProjectDataInput) {
    // chuẩn hóa lại dữ liệu trước khi đẩy vào db
    const payload: UpdateProjectDataInput = {};

    if (data.title !== undefined) payload.title = normalizeRequiredText(data.title);
    if (data.description !== undefined) payload.description = normalizeOptionalText(data.description) ?? undefined;
    if (data.avatar !== undefined) payload.avatar = normalizeOptionalText(data.avatar) ?? undefined;
    if (data.priority !== undefined) payload.priority = data.priority.toLowerCase();
    if (data.status !== undefined) payload.status = data.status.toLowerCase();
    if (data.progress !== undefined) payload.progress = data.progress;
    if (data.startDate !== undefined) payload.startDate = normalizeOptionalText(data.startDate) ?? undefined;
    if (data.dueDate !== undefined) payload.dueDate = normalizeOptionalText(data.dueDate) ?? undefined;
    if (data.assignedBy !== undefined) payload.assignedBy = normalizeOptionalText(data.assignedBy) ?? undefined;
    if (data.estimatedHours !== undefined) payload.estimatedHours = toNumberOrNull(data.estimatedHours) ?? undefined;
    if (data.actualHours !== undefined) payload.actualHours = toNumberOrNull(data.actualHours) ?? undefined;
    if (data.completedAt !== undefined) payload.completedAt = data.completedAt;

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (payload.title !== undefined) { setClauses.push(`title = $${idx++}`); values.push(payload.title); }
    if (payload.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(payload.description); }
    if (payload.avatar !== undefined) { setClauses.push(`avatar_url = $${idx++}`); values.push(payload.avatar); }
    if (payload.priority !== undefined) { setClauses.push(`priority = $${idx++}`); values.push(payload.priority); }
    if (payload.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(payload.status); }
    if (payload.progress !== undefined) { setClauses.push(`progress = $${idx++}`); values.push(payload.progress); }
    if (payload.startDate !== undefined) { setClauses.push(`start_date = $${idx++}`); values.push(payload.startDate); }
    if (payload.dueDate !== undefined) { setClauses.push(`due_date = $${idx++}`); values.push(payload.dueDate); }
    if (payload.assignedBy !== undefined) { setClauses.push(`assigned_by = $${idx++}`); values.push(payload.assignedBy); }
    if (payload.estimatedHours !== undefined) { setClauses.push(`estimated_hours = $${idx++}`); values.push(payload.estimatedHours); }
    if (payload.actualHours !== undefined) { setClauses.push(`actual_hours = $${idx++}`); values.push(payload.actualHours); }
    if (payload.completedAt !== undefined) { setClauses.push(`completed_at = $${idx++}`); values.push(payload.completedAt); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query<ProjectRow>(
      `UPDATE projects SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${projectColumns}`,
      values
    );
    if (!rows[0]) throw new AppError("Project not found", 404);
    return rows[0];
  }

  async updateAvatar(id: string, avatarURL: string): Promise<void> {
    const { rows } = await pool.query<ProjectRow>(
      `UPDATE projects SET avatar_url = $1 WHERE id = $2 RETURNING ${projectColumns}`,
      [avatarURL, id]
    );
    if (!rows[0]) throw new AppError("Project not found", 404);
  }

  async removeAvatar(id: string): Promise<void> {
    const { rows } = await pool.query<ProjectRow>(
      `UPDATE projects SET avatar_url = NULL WHERE id = $1 RETURNING ${projectColumns}`,
      [id]
    );
    if (!rows[0]) throw new AppError("Project not found", 404);
  }

  async delete(id: string): Promise<void> {
    const { rows } = await pool.query<ProjectRow>(
      `DELETE FROM projects WHERE id = $1 RETURNING ${projectColumns}`,
      [id]
    );
    if (!rows[0]) throw new AppError("Project not found", 404);
  }
}

export default new ProjectService();

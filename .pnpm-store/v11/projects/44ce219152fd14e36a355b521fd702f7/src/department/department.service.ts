import pool from "../config/database.js";
import { AppError } from "../utils/errors/app-error.js";
import { DepartmentSchema, ProjectSchema } from "../schemas/index.js";

// dữ liệu database
interface DepartmentRow {
  id: string;
  name: string;
  code: string;
  description: string;
  managerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

// dữ liệu đầu vào
export interface CreateDepartmentDataInput {
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  isActive?: boolean;
}
export type UpdateDepartmentDataInput = Partial<CreateDepartmentDataInput>;

const departmentColumns = DepartmentSchema.columns;
const projectColumns = ProjectSchema.columns;

const normalizeRequiredText = (value: string) => value.trim();
const normalizeOptionalText = (value: string | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

class DepartmentService {
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const countResult = await pool.query<{ count: string }>(`SELECT COUNT(*) as count FROM departments`);
    const total = parseInt(countResult.rows[0].count, 10);
    const { rows } = await pool.query<DepartmentRow>(
      `SELECT ${departmentColumns} FROM departments ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findActiveOptions() {
    const { rows } = await pool.query<Pick<DepartmentRow, "id" | "name" | "code">>(
      `SELECT id, name, code FROM departments WHERE is_active = true ORDER BY name ASC`,
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<DepartmentRow>(
      `SELECT ${departmentColumns} FROM departments WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByName(name: string) {
    const { rows } = await pool.query<DepartmentRow>(
      `SELECT ${departmentColumns} FROM departments WHERE name = $1`,
      [name]
    );
    return rows[0] || null;
  }

  async findByCode(code: string) {
    const { rows } = await pool.query<DepartmentRow>(
      `SELECT ${departmentColumns} FROM departments WHERE code = $1`,
      [code]
    );
    return rows[0] || null;
  }

  async findProjectsByDepartment(departmentId: string) {
    const { rows } = await pool.query<ProjectRow>(
      `SELECT DISTINCT ${projectColumns}
       FROM projects p
       JOIN project_departments pd ON pd.project_id = p.id
       WHERE pd.department_id = $1
       ORDER BY p.created_at DESC`,
      [departmentId]
    );
    return rows;
  }

  async create(data: CreateDepartmentDataInput) {
    // chuẩn hóa lại dữ liệu trước khi đẩy vào db
    const payload = {
      name: normalizeRequiredText(data.name).toLowerCase(),
      code: normalizeRequiredText(data.code).toLowerCase(),
      description: normalizeOptionalText(data.description),
      managerId: normalizeOptionalText(data.managerId),
      isActive: data.isActive ?? true,
    };

    const existingName = await this.findByName(payload.name);
    if (existingName) throw new AppError("Department name already exists", 409);

    const existingCode = await this.findByCode(payload.code);
    if (existingCode) throw new AppError("Department code already exists", 409);

    const { rows } = await pool.query<DepartmentRow>(
      `INSERT INTO departments (name, code, description, manager_id, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING ${departmentColumns}`,
      [payload.name, payload.code, payload.description, payload.managerId, payload.isActive]
    );
    return rows[0];
  }

  async update(id: string, data: UpdateDepartmentDataInput) {
    // chuẩn hóa lại dữ liệu trước khi đẩy vào db
    const payload: UpdateDepartmentDataInput = {};

    if (data.name !== undefined) payload.name = normalizeRequiredText(data.name).toLowerCase();
    if (data.code !== undefined) payload.code = normalizeRequiredText(data.code).toLowerCase();
    if (data.description !== undefined) payload.description = normalizeOptionalText(data.description) ?? undefined;
    if (data.managerId !== undefined) payload.managerId = normalizeOptionalText(data.managerId) ?? undefined;
    if (data.isActive !== undefined) payload.isActive = data.isActive;

    if (payload.name !== undefined) {
      const existing = await this.findByName(payload.name);
      if (existing && existing.id !== id) throw new AppError("Department name already exists", 409);
    }
    if (payload.code !== undefined) {
      const existing = await this.findByCode(payload.code);
      if (existing && existing.id !== id) throw new AppError("Department code already exists", 409);
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (payload.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(payload.name); }
    if (payload.code !== undefined) { setClauses.push(`code = $${idx++}`); values.push(payload.code); }
    if (payload.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(payload.description); }
    if (payload.managerId !== undefined) { setClauses.push(`manager_id = $${idx++}`); values.push(payload.managerId); }
    if (payload.isActive !== undefined) { setClauses.push(`is_active = $${idx++}`); values.push(payload.isActive); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query<DepartmentRow>(
      `UPDATE departments SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${departmentColumns}`,
      values
    );
    if (!rows[0]) throw new AppError("Department not found", 404);
    return rows[0];
  }

  async delete(id: string): Promise<void> {
    const { rows } = await pool.query<DepartmentRow>(
      `DELETE FROM departments WHERE id = $1 RETURNING ${departmentColumns}`,
      [id]
    );
    if (!rows[0]) throw new AppError("Department not found", 404);
  }
}

export default new DepartmentService();

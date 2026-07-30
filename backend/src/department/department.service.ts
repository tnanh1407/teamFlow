import pool from "../config/database.js";
import { AppError } from "../utils/errors/app-error.js";
import { DepartmentSchema } from "../schemas/index.js";

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

interface DepartmentData {
  name : string;
  code : string;
  description?: string ;
  managerId? :string ;
  isActive?: boolean;
}

export type CreateDepartmentDataInput = DepartmentData;
export type UpdateDepartmentDataInput = Partial<DepartmentData>

const departmentColumns = DepartmentSchema.columns;

class DepartmentService {
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const countResult = await pool.query<{ count: string }>(`SELECT COUNT(*) as count FROM departments`);
    const total = parseInt(countResult.rows[0].count, 10);
    const { rows } = await pool.query<DepartmentRow>(
      `SELECT ${departmentColumns} FROM departments ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    console.log("DEBUG ROWS : " ,rows)
    return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
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

  async create(data: CreateDepartmentDataInput) {
    const payload = {
      ...data,
      name : data.name.trim().toLowerCase(),
      code : data.code.trim().toLowerCase(),
    }
    const existingName = await this.findByName(payload.name);
    if (existingName) throw new AppError("Department name already exists", 409);

    const existingCode = await this.findByCode(payload.code);
    if (existingCode) throw new AppError("Department code already exists", 409);

    const { rows } = await pool.query<DepartmentRow>(
      `INSERT INTO departments (name, code, description, manager_id, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING ${departmentColumns}`,
      [payload.name, payload.code, payload.description || null, payload.managerId || null, payload.isActive ?? true]
    );
    return rows[0];
  }

  async update(id: string, data: UpdateDepartmentDataInput) {
    if (data.name) {
      const existing = await this.findByName(data.name);
      if (existing && existing.id !== id) throw new AppError("Department name already exists", 409);
    }

    if (data.code) {
      const existing = await this.findByCode(data.code);
      if (existing && existing.id !== id) throw new AppError("Department code already exists", 409);
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(data.name); }
    if (data.code !== undefined) { setClauses.push(`code = $${idx++}`); values.push(data.code); }
    if (data.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(data.description); }
    if (data.managerId !== undefined) { setClauses.push(`manager_id = $${idx++}`); values.push(data.managerId); }
    if (data.isActive !== undefined) { setClauses.push(`is_active = $${idx++}`); values.push(data.isActive); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query<DepartmentRow>(
      `UPDATE departments SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${departmentColumns}`,
      values
    );
    return rows[0] || null;
  }

  async delete(id: string) {
    const { rows } = await pool.query<DepartmentRow>(
      `DELETE FROM departments WHERE id = $1 RETURNING ${departmentColumns}`,
      [id]
    );
    return rows[0] || null;
  }
}

export default new DepartmentService();

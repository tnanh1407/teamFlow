import pool from "../config/database.js";
import { AppError } from "../utils/errors/app-error.js";

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

const departmentColumns = `id, name, code, description, manager_id AS "managerId", is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"`;

class DepartmentService {
  async findAll() {
    const { rows } = await pool.query<DepartmentRow>(
      `SELECT ${departmentColumns} FROM departments ORDER BY created_at DESC`
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

  async create(data: {
    name: string;
    code: string;
    description?: string;
    managerId?: string;
    isActive?: boolean;
  }) {
    const existingName = await this.findByName(data.name);
    if (existingName) throw new AppError("Department name already exists", 409);

    const existingCode = await this.findByCode(data.code);
    if (existingCode) throw new AppError("Department code already exists", 409);

    const { rows } = await pool.query<DepartmentRow>(
      `INSERT INTO departments (name, code, description, manager_id, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING ${departmentColumns}`,
      [data.name, data.code, data.description || null, data.managerId || null, data.isActive ?? true]
    );
    return rows[0];
  }

  async update(id: string, data: Partial<{
    name: string;
    code: string;
    description: string;
    managerId: string;
    isActive: boolean;
  }>) {
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

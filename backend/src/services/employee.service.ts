import pool from "../config/database.js";
import { AppError } from "../utils/errors/app-error.js";

interface EmployeeRow {
  id: string;
  departmentId: string;
  positionId: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  hireDate: string;
  gender: string;
  status: string;
  avatarURL: string;
  createdAt: Date;
  updatedAt: Date;
}

const employeeColumns = `id, department_id AS "departmentId", position_id AS "positionId", employee_code AS "employeeCode", name, email, phone, birth_date AS "birthDate", hire_date AS "hireDate", gender, status, avatar_url AS "avatarURL", created_at AS "createdAt", updated_at AS "updatedAt"`;

class EmployeeService {
  async findAll() {
    const { rows } = await pool.query<EmployeeRow>(
      `SELECT ${employeeColumns} FROM employees ORDER BY created_at DESC`
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<EmployeeRow>(
      `SELECT ${employeeColumns} FROM employees WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByEmployeeCode(code: string) {
    const { rows } = await pool.query<EmployeeRow>(
      `SELECT ${employeeColumns} FROM employees WHERE employee_code = $1`,
      [code]
    );
    return rows[0] || null;
  }

  async findByEmail(email: string) {
    const { rows } = await pool.query<EmployeeRow>(
      `SELECT ${employeeColumns} FROM employees WHERE email = $1`,
      [email]
    );
    return rows[0] || null;
  }

  async findByPhone(phone: string) {
    const { rows } = await pool.query<EmployeeRow>(
      `SELECT ${employeeColumns} FROM employees WHERE phone = $1`,
      [phone]
    );
    return rows[0] || null;
  }

  async findByDepartment(departmentId: string) {
    const { rows } = await pool.query<EmployeeRow>(
      `SELECT ${employeeColumns} FROM employees WHERE department_id = $1 ORDER BY created_at DESC`,
      [departmentId]
    );
    return rows;
  }

  async findByPosition(positionId: string) {
    const { rows } = await pool.query<EmployeeRow>(
      `SELECT ${employeeColumns} FROM employees WHERE position_id = $1 ORDER BY created_at DESC`,
      [positionId]
    );
    return rows;
  }

  async create(data: {
    departmentId: string;
    positionId: string;
    employeeCode: string;
    name: string;
    email: string;
    phone?: string;
    birthDate?: string;
    hireDate?: string;
    gender?: string;
    status?: string;
    avatarURL?: string;
  }) {
    const existingCode = await this.findByEmployeeCode(data.employeeCode);
    if (existingCode) throw new AppError("Employee code already exists", 409);

    const existingEmail = await this.findByEmail(data.email);
    if (existingEmail) throw new AppError("Email already exists", 409);

    if (data.phone) {
      const existingPhone = await this.findByPhone(data.phone);
      if (existingPhone) throw new AppError("Phone already exists", 409);
    }

    const { rows } = await pool.query<EmployeeRow>(
      `INSERT INTO employees (department_id, position_id, employee_code, name, email, phone, birth_date, hire_date, gender, status, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING ${employeeColumns}`,
      [
        data.departmentId, data.positionId, data.employeeCode, data.name,
        data.email, data.phone || null, data.birthDate || null,
        data.hireDate || null, data.gender || "other", data.status || "active",
        data.avatarURL || null,
      ]
    );
    return rows[0];
  }

  async update(id: string, data: Partial<{
    departmentId: string;
    positionId: string;
    employeeCode: string;
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    hireDate: string;
    gender: string;
    status: string;
    avatarURL: string;
  }>) {
    if (data.employeeCode) {
      const existing = await this.findByEmployeeCode(data.employeeCode);
      if (existing && existing.id !== id) throw new AppError("Employee code already exists", 409);
    }

    if (data.email) {
      const existing = await this.findByEmail(data.email);
      if (existing && existing.id !== id) throw new AppError("Email already exists", 409);
    }

    if (data.phone) {
      const existing = await this.findByPhone(data.phone);
      if (existing && existing.id !== id) throw new AppError("Phone already exists", 409);
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.departmentId !== undefined) { setClauses.push(`department_id = $${idx++}`); values.push(data.departmentId); }
    if (data.positionId !== undefined) { setClauses.push(`position_id = $${idx++}`); values.push(data.positionId); }
    if (data.employeeCode !== undefined) { setClauses.push(`employee_code = $${idx++}`); values.push(data.employeeCode); }
    if (data.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(data.name); }
    if (data.email !== undefined) { setClauses.push(`email = $${idx++}`); values.push(data.email); }
    if (data.phone !== undefined) { setClauses.push(`phone = $${idx++}`); values.push(data.phone); }
    if (data.birthDate !== undefined) { setClauses.push(`birth_date = $${idx++}`); values.push(data.birthDate); }
    if (data.hireDate !== undefined) { setClauses.push(`hire_date = $${idx++}`); values.push(data.hireDate); }
    if (data.gender !== undefined) { setClauses.push(`gender = $${idx++}`); values.push(data.gender); }
    if (data.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(data.status); }
    if (data.avatarURL !== undefined) { setClauses.push(`avatar_url = $${idx++}`); values.push(data.avatarURL); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query<EmployeeRow>(
      `UPDATE employees SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${employeeColumns}`,
      values
    );
    return rows[0] || null;
  }

  async delete(id: string) {
    const { rows } = await pool.query<EmployeeRow>(
      `DELETE FROM employees WHERE id = $1 RETURNING ${employeeColumns}`,
      [id]
    );
    return rows[0] || null;
  }
}

export default new EmployeeService();

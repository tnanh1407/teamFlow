import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import { EAccountRole, EAccountPosition } from "../enums/account-role.enum.js";
import { AppError } from "../utils/errors/app-error.js";
import { UserSchema } from "../schemas/index.js";

interface UserRow {
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
  username: string;
  password: string;
  role: EAccountRole;
  position: EAccountPosition | null;
  status: boolean;
  avatarURL: string;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userColumns = UserSchema.columns;

class UserService {
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const countResult = await pool.query<{ count: string }>(`SELECT COUNT(*) as count FROM users`)
    const total = parseInt(countResult.rows[0].count, 10);
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumns} FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]
    );
    return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumns} FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByUsername(username: string) {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumns} FROM users WHERE username = $1`,
      [username]
    );
    return rows[0] || null;
  }

  async findByEmployeeCode(code: string) {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumns} FROM users WHERE employee_code = $1`,
      [code]
    );
    return rows[0] || null;
  }

  async findByEmail(email: string) {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumns} FROM users WHERE email = $1`,
      [email]
    );
    return rows[0] || null;
  }

  async findByPhone(phone: string) {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumns} FROM users WHERE phone = $1`,
      [phone]
    );
    return rows[0] || null;
  }

  async findByDepartment(departmentId: string) {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumns} FROM users WHERE department_id = $1 ORDER BY created_at DESC`,
      [departmentId]
    );
    return rows;
  }

  async findByPosition(positionId: string) {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumns} FROM users WHERE position_id = $1 ORDER BY created_at DESC`,
      [positionId]
    );
    return rows;
  }

  async findAllRaw() {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumns} FROM users ORDER BY created_at DESC`
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
    username: string;
    password: string;
    role: EAccountRole;
    position: EAccountPosition | null;
    status?: boolean;
    avatarURL?: string;
  }) {
    const existingUser = await this.findByUsername(data.username);
    if (existingUser) throw new AppError("Username already exists", 409);

    const existingCode = await this.findByEmployeeCode(data.employeeCode);
    if (existingCode) throw new AppError("Employee code already exists", 409);

    const existingEmail = await this.findByEmail(data.email);
    if (existingEmail) throw new AppError("Email already exists", 409);

    if (data.phone) {
      const existingPhone = await this.findByPhone(data.phone);
      if (existingPhone) throw new AppError("Phone already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (department_id, position_id, employee_code, name, email, phone, birth_date, hire_date, gender, username, password, role, position, status, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING ${userColumns}`,
      [
        data.departmentId, data.positionId, data.employeeCode, data.name,
        data.email, data.phone || null, data.birthDate || null,
        data.hireDate || null, data.gender || "other",
        data.username, hashedPassword, data.role, data.position,
        data.status ?? true, data.avatarURL || null,
      ]
    );
    return this.findById(rows[0].id);
  }

  async update(
    id: string,
    data: Partial<{
      departmentId: string;
      positionId: string;
      employeeCode: string;
      name: string;
      email: string;
      phone: string;
      birthDate: string;
      hireDate: string;
      gender: string;
      username: string;
      password: string;
      role: EAccountRole;
      position: EAccountPosition;
      status: boolean;
      avatarURL: string;
    }>
  ) {
    if (data.username) {
      const existing = await this.findByUsername(data.username);
      if (existing && existing.id !== id) throw new AppError("Username already exists", 409);
    }
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

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
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
    if (data.username !== undefined) { setClauses.push(`username = $${idx++}`); values.push(data.username); }
    if (data.password !== undefined) { setClauses.push(`password = $${idx++}`); values.push(data.password); }
    if (data.role !== undefined) { setClauses.push(`role = $${idx++}`); values.push(data.role); }
    if (data.position !== undefined) { setClauses.push(`position = $${idx++}`); values.push(data.position); }
    if (data.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(data.status); }
    if (data.avatarURL !== undefined) { setClauses.push(`avatar_url = $${idx++}`); values.push(data.avatarURL); }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const { rows } = await pool.query<UserRow>(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${userColumns}`,
      values
    );
    return rows[0] ? this.findById(rows[0].id) : null;
  }

  async updateAvatar(id: string, avatarURL: string) {
    const { rows } = await pool.query<UserRow>(
      `UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING ${userColumns}`,
      [avatarURL, id]
    );
    return rows[0] ? this.findById(rows[0].id) : null;
  }

  async updateLastLogin(id: string) {
    await pool.query(
      `UPDATE users SET last_login = now() WHERE id = $1`,
      [id]
    );
  }

  async delete(id: string) {
    const { rows } = await pool.query<UserRow>(
      `UPDATE users SET status = false WHERE id = $1 RETURNING ${userColumns}`,
      [id]
    );
    return rows[0] ? this.findById(rows[0].id) : null;
  }
}

export default new UserService();

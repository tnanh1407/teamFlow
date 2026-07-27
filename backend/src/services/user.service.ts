import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import { EUserRole } from "../enums/user-role.enum.js";
import { AppError } from "../utils/errors/app-error.js";
import { UserSchema } from "../schemas/index.js";

interface UserRow {
  id: string;
  employeeId: string;
  username: string;
  password: string;
  role: string;
  status: boolean;
  avatarURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userColumns = UserSchema.columns;
const userColumnsWithAvatar = `u.id, u.employee_id, u.username, u.password, u.role, u.status, e.avatar_url, u.created_at, u.updated_at`;
const userJoin = `FROM users u LEFT JOIN employees e ON u.employee_id = e.id`;

class UserService {
  async findAll() {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumnsWithAvatar} ${userJoin} ORDER BY u.created_at DESC`
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumnsWithAvatar} ${userJoin} WHERE u.id = $1`,
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

  async findByEmployeeId(employeeId: string) {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumns} FROM users WHERE employee_id = $1`,
      [employeeId]
    );
    return rows[0] || null;
  }

  async create(data: {
    employeeId: string;
    username: string;
    password: string;
    role?: EUserRole;
    status?: boolean;
  }) {
    const existingUser = await this.findByUsername(data.username);
    if (existingUser) {
      throw new AppError("Username already exists", 409);
    }

    const existingEmployee = await this.findByEmployeeId(data.employeeId);
    if (existingEmployee) {
      throw new AppError("Employee ID already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (employee_id, username, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING ${userColumns}`,
      [data.employeeId, data.username, hashedPassword, data.role || EUserRole.USER, data.status ?? true]
    );
    return rows[0];
  }

  async update(
    id: string,
    data: Partial<{
      employeeId: string;
      username: string;
      password: string;
      role: EUserRole;
      status: boolean;
    }>
  ) {
    if (data.username) {
      const existing = await this.findByUsername(data.username);
      if (existing && existing.id !== id) {
        throw new AppError("Username already exists", 409);
      }
    }

    if (data.employeeId) {
      const existing = await this.findByEmployeeId(data.employeeId);
      if (existing && existing.id !== id) {
        throw new AppError("Employee ID already exists", 409);
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.employeeId !== undefined) {
      setClauses.push(`employee_id = $${idx++}`);
      values.push(data.employeeId);
    }
    if (data.username !== undefined) {
      setClauses.push(`username = $${idx++}`);
      values.push(data.username);
    }
    if (data.password !== undefined) {
      setClauses.push(`password = $${idx++}`);
      values.push(data.password);
    }
    if (data.role !== undefined) {
      setClauses.push(`role = $${idx++}`);
      values.push(data.role);
    }
    if (data.status !== undefined) {
      setClauses.push(`status = $${idx++}`);
      values.push(data.status);
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const { rows } = await pool.query<UserRow>(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${userColumns}`,
      values
    );
    return rows[0] || null;
  }

  async delete(id: string) {
    const { rows } = await pool.query<UserRow>(
      `DELETE FROM users WHERE id = $1 RETURNING ${userColumns}`,
      [id]
    );
    return rows[0] || null;
  }
}

export default new UserService();

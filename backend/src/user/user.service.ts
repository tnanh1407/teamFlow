import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import { EUserRole, EUserPosition } from "../enums/user-role.enum.js";
import { AppError } from "../utils/errors/app-error.js";
import { UserSchema } from "../schemas/index.js";

interface UserRow {
  id: string;
  employeeId: string;
  username: string;
  password: string;
  role: string;
  position: string;
  status: boolean;
  avatarURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userColumnsWithAvatar = `id, id AS employee_id, username, password, role, position, account_status AS status, avatar_url, created_at, updated_at`;
const userJoin = `FROM employees`;

class UserService {
  async findAll() {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumnsWithAvatar} ${userJoin} WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumnsWithAvatar} ${userJoin} WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  }

  async findByUsername(username: string) {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumnsWithAvatar} ${userJoin} WHERE username = $1 AND deleted_at IS NULL`,
      [username]
    );
    return rows[0] || null;
  }

  async findByEmployeeId(employeeId: string) {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumnsWithAvatar} ${userJoin} WHERE id = $1 AND deleted_at IS NULL`,
      [employeeId]
    );
    return rows[0] || null;
  }

  async create(data: {
    employeeId: string;
    username: string;
    password: string;
    role?: EUserRole;
    position?: EUserPosition;
    status?: boolean;
  }) {
    const existingUser = await this.findByUsername(data.username);
    if (existingUser) {
      throw new AppError("Username already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const role = data.role || EUserRole.USER;
    const position = data.position || EUserPosition.MEMBER;

    const { rows } = await pool.query<UserRow>(
      `UPDATE employees SET username = $1, password = $2, role = $3, position = $4, account_status = $5 WHERE id = $6 RETURNING ${userColumnsWithAvatar}`,
      [data.username, hashedPassword, role, position, data.status ?? true, data.employeeId]
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
      position: EUserPosition;
      status: boolean;
    }>
  ) {
    if (data.username) {
      const existing = await this.findByUsername(data.username);
      if (existing && existing.id !== id) {
        throw new AppError("Username already exists", 409);
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

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
    if (data.position !== undefined) {
      setClauses.push(`position = $${idx++}`);
      values.push(data.position);
    }
    if (data.status !== undefined) {
      setClauses.push(`account_status = $${idx++}`);
      values.push(data.status);
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const { rows } = await pool.query<UserRow>(
      `UPDATE employees SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${userColumnsWithAvatar}`,
      values
    );
    return rows[0] || null;
  }

  async updateAvatar(userId: string, avatarURL: string) {
    const user = await this.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    await pool.query(
      `UPDATE employees SET avatar_url = $1 WHERE id = $2`,
      [avatarURL, userId]
    );
    return this.findById(userId);
  }

  async delete(id: string) {
    const { rows } = await pool.query<UserRow>(
      `UPDATE employees SET username = NULL, password = NULL, account_status = false WHERE id = $1 RETURNING ${userColumnsWithAvatar}`,
      [id]
    );
    return rows[0] || null;
  }
}

export default new UserService();

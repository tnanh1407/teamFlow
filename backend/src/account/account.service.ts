import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import { EAccountRole, EAccountPosition } from "../enums/account-role.enum.js";
import { AppError } from "../utils/errors/app-error.js";
import { AccountSchema } from "../schemas/index.js";

interface AccountRow {
  id: string
  employeeId: string
  username: string
  password: string
  role: string
  position: string
  status: boolean
  avatarURL?: string
  lastLogin: Date | null
  createdAt: Date
  updatedAt: Date
}

const accountColumns = AccountSchema.columns;

const accountColumnsWithAvatar = `a.id, a.employee_id, a.username, a.password, a.role, a.position, a.status, e.avatar_url, a.created_at, a.updated_at`;
const accountJoin = `FROM accounts a LEFT JOIN employees e ON e.id = a.employee_id`;

class AccountService {
  async findAll() {
    const { rows } = await pool.query<AccountRow>(
      `SELECT ${accountColumnsWithAvatar} ${accountJoin} ORDER BY a.created_at DESC`
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<AccountRow>(
      `SELECT ${accountColumnsWithAvatar} ${accountJoin} WHERE a.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByUsername(username: string) {
    const { rows } = await pool.query<AccountRow>(
      `SELECT ${accountColumnsWithAvatar} ${accountJoin} WHERE a.username = $1`,
      [username]
    );
    return rows[0] || null;
  }

  async findByEmployeeId(employeeId: string) {
    const { rows } = await pool.query<AccountRow>(
      `SELECT ${accountColumnsWithAvatar} ${accountJoin} WHERE a.employee_id = $1`,
      [employeeId]
    );
    return rows[0] || null;
  }

  async create(data: {
    employeeId: string;
    username: string;
    password: string;
    role?: EAccountRole;
    position?: EAccountPosition;
    status?: boolean;
  }) {
    const existingUser = await this.findByUsername(data.username);
    if (existingUser) {
      throw new AppError("Username already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const role = data.role || EAccountRole.USER;
    const position = data.position || EAccountPosition.MEMBER;
    const status = data.status ?? true;

    const { rows } = await pool.query<AccountRow>(
      `INSERT INTO accounts (employee_id, username, password, role, position, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${accountColumns}`,
      [data.employeeId, data.username, hashedPassword, role, position, status]
    );
    return this.findById(rows[0].id);
  }

  async update(
    id: string,
    data: Partial<{
      employeeId: string;
      username: string;
      password: string;
      role: EAccountRole;
      position: EAccountPosition;
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
    if (data.position !== undefined) {
      setClauses.push(`position = $${idx++}`);
      values.push(data.position);
    }
    if (data.status !== undefined) {
      setClauses.push(`status = $${idx++}`);
      values.push(data.status);
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const { rows } = await pool.query<AccountRow>(
      `UPDATE accounts SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${accountColumns}`,
      values
    );
    return rows[0] ? this.findById(rows[0].id) : null;
  }

  async updateAvatar(userId: string, avatarURL: string) {
    const user = await this.findById(userId);
    if (!user) throw new AppError("Account not found", 404);
    await pool.query(
      `UPDATE employees SET avatar_url = $1 WHERE id = $2`,
      [avatarURL, user.employeeId]
    );
    return this.findById(userId);
  }

  async updateLastLogin(id: string) {
    await pool.query(
      `UPDATE accounts SET last_login = now() WHERE id = $1`,
      [id]
    );
  }

  async delete(id: string) {
    const { rows } = await pool.query<AccountRow>(
      `UPDATE accounts SET status = false WHERE id = $1 RETURNING ${accountColumns}`,
      [id]
    );
    return rows[0] ? this.findById(rows[0].id) : null;
  }
}

export default new AccountService();

import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EAccountRole, EAccountPosition } from "../enums/account-role.enum.js";
import { AppError } from "../utils/errors/app-error.js";
import { UserSchema } from "../schemas/index.js";
import { EGender } from "@/enums/gender.enum.js";
import env from "../config/env.js";
import sessionService, { generateJti, TOKEN_EXPIRES_IN } from "../session/session.service.js";
import { generateResetCode } from "../utils/mail/mailer.js";

// dữ liệu database
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
  gender: EGender;
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

// dữ liệu đầu vào
export interface UserData {
  departmentId: string;
  positionId: string;
  employeeCode: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  hireDate?: string;
  gender?: EGender;
  username: string;
  password: string;
  role: EAccountRole;
  position: EAccountPosition;
  status?: boolean;
  avatarURL?: string;
}
export type CreateUserDataInput = UserData;
export type UpdateUserDataInput = Partial<Omit<UserData, "password">>
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
export interface ForgotPasswordInput {
  email: string;
  employeeCode: string;
}
export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

const userColumns = UserSchema.columns;

const normalizeRequiredText = (value: string) => value.trim();
const normalizeOptionalText = (value: string | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const RESET_CODE_TTL_MS = 10 * 60 * 1000;

class UserService {
  async login(username: string, password: string, userAgent?: string, ip?: string) {
    const user = await this.findByUsername(username);
    if (!user) throw new AppError("Invalid credentials", 401);
    if (!user.status) throw new AppError("Account is disabled", 403);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError("Invalid credentials", 401);

    await this.updateLastLogin(user.id);

    const jti = generateJti();
    await sessionService.createSession(user.id, jti, userAgent, ip);

    const token = jwt.sign(
      { id: user.id, role: user.role, position: user.position, jti },
      env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

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

  async search(keyword: string) {
    const q = keyword.trim();
    if (!q) return [];

    const { rows } = await pool.query<UserRow>(
      `SELECT ${userColumns}
       FROM users
       WHERE name ILIKE $1
          OR id::text ILIKE $1
          OR email ILIKE $1
          OR username ILIKE $1
          OR employee_code ILIKE $1
          OR phone ILIKE $1
       ORDER BY created_at DESC`,
      [`%${q}%`]
    );
    return rows;
  }

  async create(data: CreateUserDataInput) {
    const payload = {
      departmentId: data.departmentId,
      positionId: data.positionId,
      employeeCode: normalizeRequiredText(data.employeeCode).toUpperCase(),
      name: normalizeRequiredText(data.name),
      email: normalizeRequiredText(data.email).toLowerCase(),
      phone: normalizeOptionalText(data.phone),
      birthDate: normalizeOptionalText(data.birthDate),
      hireDate: normalizeOptionalText(data.hireDate),
      gender: data.gender ?? "other",
      username: normalizeRequiredText(data.username).toLowerCase(),
      password: data.password,
      position: data.position,
      status: data.status ?? true,
      avatarURL: normalizeOptionalText(data.avatarURL),
      role: EAccountRole.USER,
    };

    // xử lí phần trùng

    const existingUser = await this.findByUsername(payload.username);
    if (existingUser) throw new AppError("Username already exists", 409);

    const existingCode = await this.findByEmployeeCode(payload.employeeCode);
    if (existingCode) throw new AppError("Employee code already exists", 409);

    const existingEmail = await this.findByEmail(payload.email);
    if (existingEmail) throw new AppError("Email already exists", 409);

    if (payload.phone) {
      const existingPhone = await this.findByPhone(payload.phone);
      if (existingPhone) throw new AppError("Phone already exists", 409);
    }

    // chuẩn hóa lại dữ liệu


    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (department_id, position_id, employee_code, name, email, phone, birth_date, hire_date, gender, username, password, role, position, status, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING ${userColumns}`,
      [
        payload.departmentId, payload.positionId, payload.employeeCode, payload.name,
        payload.email, payload.phone, payload.birthDate,
        payload.hireDate, payload.gender,
        payload.username, hashedPassword, payload.role, payload.position,
        payload.status, payload.avatarURL,
      ]
    );
    return this.findById(rows[0].id);
  }

  async changePassword(id: string, data: ChangePasswordInput): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);

    if (!isMatch) {
      throw new AppError("Current password is incorrect", 400);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await pool.query(
      `UPDATE users
     SET password = $1,
         updated_at = NOW()
     WHERE id = $2`,
      [hashedPassword, id]
    );

    await sessionService.revokeAllByUserId(id);
  }
  async update(
    id: string,
    data: UpdateUserDataInput
  ) {
    const previous = await this.findById(id);
    if (!previous) throw new AppError("User not found", 404);

    const payload: UpdateUserDataInput = {};

    if (data.departmentId !== undefined) payload.departmentId = data.departmentId;
    if (data.positionId !== undefined) payload.positionId = data.positionId;
    if (data.employeeCode !== undefined) payload.employeeCode = normalizeRequiredText(data.employeeCode).toUpperCase();
    if (data.name !== undefined) payload.name = normalizeRequiredText(data.name);
    if (data.email !== undefined) payload.email = normalizeRequiredText(data.email).toLowerCase();
    if (data.phone !== undefined) payload.phone = normalizeOptionalText(data.phone) ?? undefined;
    if (data.birthDate !== undefined) payload.birthDate = normalizeOptionalText(data.birthDate) ?? undefined;
    if (data.hireDate !== undefined) payload.hireDate = normalizeOptionalText(data.hireDate) ?? undefined;
    if (data.gender !== undefined) payload.gender = data.gender;
    if (data.username !== undefined) payload.username = normalizeRequiredText(data.username).toLowerCase();
    if (data.role !== undefined) payload.role = data.role;
    if (data.position !== undefined) payload.position = data.position;
    if (data.status !== undefined) payload.status = data.status;
    if (data.avatarURL !== undefined) payload.avatarURL = normalizeOptionalText(data.avatarURL) ?? undefined;

    if (payload.username) {
      const existing = await this.findByUsername(payload.username);
      if (existing && existing.id !== id) throw new AppError("Username already exists", 409);
    }
    if (payload.employeeCode) {
      const existing = await this.findByEmployeeCode(payload.employeeCode);
      if (existing && existing.id !== id) throw new AppError("Employee code already exists", 409);
    }
    if (payload.email) {
      const existing = await this.findByEmail(payload.email);
      if (existing && existing.id !== id) throw new AppError("Email already exists", 409);
    }
    if (payload.phone) {
      const existing = await this.findByPhone(payload.phone);
      if (existing && existing.id !== id) throw new AppError("Phone already exists", 409);
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (payload.departmentId !== undefined) { setClauses.push(`department_id = $${idx++}`); values.push(payload.departmentId); }
    if (payload.positionId !== undefined) { setClauses.push(`position_id = $${idx++}`); values.push(payload.positionId); }
    if (payload.employeeCode !== undefined) { setClauses.push(`employee_code = $${idx++}`); values.push(payload.employeeCode); }
    if (payload.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(payload.name); }
    if (payload.email !== undefined) { setClauses.push(`email = $${idx++}`); values.push(payload.email); }
    if (data.phone !== undefined) { setClauses.push(`phone = $${idx++}`); values.push(normalizeOptionalText(data.phone)); }
    if (data.birthDate !== undefined) { setClauses.push(`birth_date = $${idx++}`); values.push(normalizeOptionalText(data.birthDate)); }
    if (data.hireDate !== undefined) { setClauses.push(`hire_date = $${idx++}`); values.push(normalizeOptionalText(data.hireDate)); }
    if (payload.gender !== undefined) { setClauses.push(`gender = $${idx++}`); values.push(payload.gender); }
    if (payload.username !== undefined) { setClauses.push(`username = $${idx++}`); values.push(payload.username); }
    if (payload.role !== undefined) { setClauses.push(`role = $${idx++}`); values.push(payload.role); }
    if (payload.position !== undefined) { setClauses.push(`position = $${idx++}`); values.push(payload.position); }
    if (payload.status !== undefined) { setClauses.push(`status = $${idx++}`); values.push(payload.status); }
    if (data.avatarURL !== undefined) { setClauses.push(`avatar_url = $${idx++}`); values.push(normalizeOptionalText(data.avatarURL)); }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const { rows } = await pool.query<UserRow>(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${userColumns}`,
      values
    );
    if (!rows[0]) throw new AppError("User not found", 404);

    const roleChanged = payload.role !== undefined && payload.role !== previous.role;
    const positionChanged = payload.position !== undefined && payload.position !== previous.position;
    const disabled = payload.status === false;

    if (disabled || roleChanged || positionChanged) {
      await sessionService.revokeAllByUserId(id);
    }

    return rows[0];
  }

  async requestPasswordReset(email: string, employeeCode: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.findByEmail(normalizedEmail);
    if (!user || user.employeeCode.toUpperCase() !== employeeCode.trim().toUpperCase()) {
      throw new AppError("Email or employee code does not match any account", 400);
    }

    await pool.query(
      `DELETE FROM password_resets WHERE user_id = $1 AND used_at IS NULL`,
      [user.id]
    );

    const code = generateResetCode();
    await pool.query(
      `INSERT INTO password_resets (user_id, email, code, expires_at)
       VALUES ($1, $2, $3, now() + ($4 * interval '1 millisecond'))`,
      [user.id, normalizedEmail, code, RESET_CODE_TTL_MS]
    );

    return { email: normalizedEmail, code };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const { rows } = await pool.query<{ id: string; userId: string }>(
      `SELECT id, user_id FROM password_resets
       WHERE email = $1 AND code = $2 AND used_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedEmail, code]
    );
    if (!rows[0]) throw new AppError("Invalid or expired code", 400);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
      [hashedPassword, rows[0].userId]
    );

    await pool.query(
      `UPDATE password_resets SET used_at = now() WHERE id = $1`,
      [rows[0].id]
    );
    await pool.query(
      `DELETE FROM password_resets WHERE user_id = $1 AND used_at IS NULL`,
      [rows[0].userId]
    );

    await sessionService.revokeAllByUserId(rows[0].userId);
  }

  async updateAvatar(id: string, avatarURL: string): Promise<void> {
    await pool.query<UserRow>(
      `UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING ${userColumns}`,
      [avatarURL, id]
    );
  }

  async removeAvatar(id: string): Promise<void> {
    await pool.query<UserRow>(
      `UPDATE users SET avatar_url = NULL WHERE id = $1 RETURNING ${userColumns}`,
      [id]
    );
  }

  async updateLastLogin(id: string) {
    await pool.query(
      `UPDATE users SET last_login = now() WHERE id = $1`,
      [id]
    );
  }

  async delete(id: string) : Promise<void> {
    const { rows } = await pool.query<UserRow>(
      `UPDATE users SET status = false WHERE id = $1 RETURNING ${userColumns}`,
      [id]
    );
    if (!rows[0]) throw new AppError("User not found", 404);
    await sessionService.revokeAllByUserId(id);
  }
}

export default new UserService();

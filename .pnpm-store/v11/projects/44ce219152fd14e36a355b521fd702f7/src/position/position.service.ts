import pool from "../config/database.js";
import { AppError } from "../utils/errors/app-error.js";
import { PositionSchema } from "../schemas/index.js";

const SYSTEM_POSITIONS = [
  { name: "Quản lí", level: "Manager" },
  { name: "Nhân viên", level: "Junior" },
  { name: "Thực tập sinh", level: "Intern" },
] as const;

const SYSTEM_POSITION_NAMES = new Set(SYSTEM_POSITIONS.map((position) => position.name.toLowerCase()));

// dữ liệu database
interface PositionRow {
  id: string;
  name: string;
  description: string;
  level: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// dữ liệu đầu vào
export interface CreatePositionDataInput {
  name: string;
  description?: string;
  level: string;
  isActive?: boolean;
}
export type UpdatePositionDataInput = Partial<CreatePositionDataInput>;

const positionColumns = PositionSchema.columns;

const normalizeRequiredText = (value: string) => value.trim();
const normalizeOptionalText = (value: string | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const normalizePositionName = (value: string) => value.trim();

class PositionService {
  async findAll() {
    const { rows } = await pool.query<PositionRow>(
      `SELECT ${positionColumns} FROM positions ORDER BY created_at DESC`
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<PositionRow>(
      `SELECT ${positionColumns} FROM positions WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByName(name: string) {
    const { rows } = await pool.query<PositionRow>(
      `SELECT ${positionColumns} FROM positions WHERE LOWER(name) = LOWER($1)`,
      [normalizePositionName(name)]
    );
    return rows[0] || null;
  }

  async create(data: CreatePositionDataInput) {
    const payload = {
      name: normalizeRequiredText(data.name),
      description: normalizeOptionalText(data.description),
      level: normalizeRequiredText(data.level).toLowerCase(),
      isActive: data.isActive ?? true,
    };

    if (!SYSTEM_POSITION_NAMES.has(payload.name.toLowerCase())) {
      throw new AppError("Chỉ được phép sử dụng 3 chức vụ hệ thống: Quản lí, Nhân viên, Thực tập sinh", 400);
    }

    const allowed = SYSTEM_POSITIONS.find((position) => position.name.toLowerCase() === payload.name.toLowerCase());
    if (!allowed || allowed.level !== payload.level) {
      throw new AppError("Chức vụ hệ thống không hợp lệ", 400);
    }

    const existing = await this.findByName(payload.name);
    if (existing) throw new AppError("Position name already exists", 409);

    const { rows } = await pool.query<PositionRow>(
      `INSERT INTO positions (name, description, level, is_active) VALUES ($1, $2, $3, $4) RETURNING ${positionColumns}`,
      [payload.name, payload.description, payload.level, payload.isActive]
    );
    return rows[0];
  }

  async update(id: string, data: UpdatePositionDataInput) {
    const current = await this.findById(id);
    if (!current) throw new AppError("Position not found", 404);

    const payload: UpdatePositionDataInput = {};

    if (data.name !== undefined) {
      const normalizedName = normalizeRequiredText(data.name);
      if (normalizedName.toLowerCase() !== current.name.toLowerCase()) {
        throw new AppError("Không được đổi tên các chức vụ hệ thống", 400);
      }
    }

    if (data.level !== undefined) {
      const normalizedLevel = normalizeRequiredText(data.level).toLowerCase();
      if (normalizedLevel !== current.level.toLowerCase()) {
        throw new AppError("Không được đổi mã chức vụ hệ thống", 400);
      }
    }

    if (data.description !== undefined) payload.description = normalizeOptionalText(data.description) ?? undefined;
    if (data.isActive !== undefined) payload.isActive = data.isActive;

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (payload.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(payload.description); }
    if (payload.isActive !== undefined) { setClauses.push(`is_active = $${idx++}`); values.push(payload.isActive); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query<PositionRow>(
      `UPDATE positions SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${positionColumns}`,
      values
    );
    if (!rows[0]) throw new AppError("Position not found", 404);
    return rows[0];
  }

  async delete(id: string): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new AppError("Position not found", 404);
    if (SYSTEM_POSITION_NAMES.has(current.name.toLowerCase())) {
      throw new AppError("Không được xoá các chức vụ hệ thống", 400);
    }
    const { rows } = await pool.query<PositionRow>(
      `DELETE FROM positions WHERE id = $1 RETURNING ${positionColumns}`,
      [id]
    );
    if (!rows[0]) throw new AppError("Position not found", 404);
  }
}

export default new PositionService();

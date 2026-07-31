import pool from "../config/database.js";
import { AppError } from "../utils/errors/app-error.js";
import { PositionSchema } from "../schemas/index.js";

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
      `SELECT ${positionColumns} FROM positions WHERE name = $1`,
      [name]
    );
    return rows[0] || null;
  }

  async create(data: CreatePositionDataInput) {
    // chuẩn hóa lại dữ liệu trước khi đẩy vào db
    const payload = {
      name: normalizeRequiredText(data.name).toLowerCase(),
      description: normalizeOptionalText(data.description),
      level: data.level || null,
      isActive: data.isActive ?? true,
    };

    const existing = await this.findByName(payload.name);
    if (existing) throw new AppError("Position name already exists", 409);

    const { rows } = await pool.query<PositionRow>(
      `INSERT INTO positions (name, description, level, is_active) VALUES ($1, $2, $3, $4) RETURNING ${positionColumns}`,
      [payload.name, payload.description, payload.level, payload.isActive]
    );
    return rows[0];
  }

  async update(id: string, data: UpdatePositionDataInput) {
    // chuẩn hóa lại dữ liệu trước khi đẩy vào db
    const payload: UpdatePositionDataInput = {};

    if (data.name !== undefined) payload.name = normalizeRequiredText(data.name).toLowerCase();
    if (data.description !== undefined) payload.description = normalizeOptionalText(data.description) ?? undefined;
    if (data.level !== undefined) payload.level = data.level;
    if (data.isActive !== undefined) payload.isActive = data.isActive;

    if (payload.name !== undefined) {
      const existing = await this.findByName(payload.name);
      if (existing && existing.id !== id) throw new AppError("Position name already exists", 409);
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (payload.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(payload.name); }
    if (payload.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(payload.description); }
    if (payload.level !== undefined) { setClauses.push(`level = $${idx++}`); values.push(payload.level); }
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
    const { rows } = await pool.query<PositionRow>(
      `DELETE FROM positions WHERE id = $1 RETURNING ${positionColumns}`,
      [id]
    );
    if (!rows[0]) throw new AppError("Position not found", 404);
  }
}

export default new PositionService();

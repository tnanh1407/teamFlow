import pool from "../config/database.js";
import { AppError } from "../utils/errors/app-error.js";
import { PositionSchema } from "../schemas/index.js";

interface PositionRow {
  id: string;
  name: string;
  description: string;
  level: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


interface PositionData {
  name : string;
  description?: string;
  level: string;
  isActive?: boolean;
}

export type CreatePositionDataInput = PositionData
export type UpdatePositionDataInput = Partial<PositionData>

const positionColumns = PositionSchema.columns;

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

  async create(data: CreatePositionDataInput ) {
    const payload = {
      ...data,
      name : data.name.trim().toLowerCase()
    }
    const existing = await this.findByName(payload.name);
    if (existing) throw new AppError("Position name already exists", 409);

    const { rows } = await pool.query<PositionRow>(
      `INSERT INTO positions (name, description, level, is_active) VALUES ($1, $2, $3, $4) RETURNING ${positionColumns}`,
      [payload.name, payload.description || null, payload.level || null, payload.isActive ?? true]
    );
    return rows[0];
  }

  async update(id: string, data: UpdatePositionDataInput) {
    if (data.name) {
      const existing = await this.findByName(data.name);
      if (existing && existing.id !== id) throw new AppError("Position name already exists", 409);
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(data.name); }
    if (data.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(data.description); }
    if (data.level !== undefined) { setClauses.push(`level = $${idx++}`); values.push(data.level); }
    if (data.isActive !== undefined) { setClauses.push(`is_active = $${idx++}`); values.push(data.isActive); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query<PositionRow>(
      `UPDATE positions SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${positionColumns}`,
      values
    );
    return rows[0] || null;
  }

  async delete(id: string) {
    const { rows } = await pool.query<PositionRow>(
      `DELETE FROM positions WHERE id = $1 RETURNING ${positionColumns}`,
      [id]
    );
    return rows[0] || null;
  }
}

export default new PositionService();

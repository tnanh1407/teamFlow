import pool from "../config/database.js";
import { AppError } from "../utils/errors/app-error.js";

interface PositionRow {
  id: string;
  name: string;
  description: string;
  level: string;
  createdAt: Date;
  updatedAt: Date;
}

const positionColumns = `id, name, description, level, created_at AS "createdAt", updated_at AS "updatedAt"`;

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

  async create(data: {
    name: string;
    description?: string;
    level?: string;
  }) {
    const existing = await this.findByName(data.name);
    if (existing) throw new AppError("Position name already exists", 409);

    const { rows } = await pool.query<PositionRow>(
      `INSERT INTO positions (name, description, level) VALUES ($1, $2, $3) RETURNING ${positionColumns}`,
      [data.name, data.description || null, data.level || null]
    );
    return rows[0];
  }

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    level: string;
  }>) {
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

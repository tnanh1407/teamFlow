import { randomUUID } from "crypto";
import pool from "../config/database.js";

export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const TOKEN_EXPIRES_IN = "1d";

export interface SessionRow {
  id: string;
  userId: string;
  jti: string;
  userAgent: string | null;
  ip: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

const sessionColumns = `id, user_id, jti, user_agent, ip, expires_at, revoked_at, created_at`;

class SessionService {
  async createSession(userId: string, jti: string, userAgent?: string, ip?: string): Promise<SessionRow> {
    const { rows } = await pool.query<SessionRow>(
      `INSERT INTO sessions (user_id, jti, user_agent, ip, expires_at)
       VALUES ($1, $2, $3, $4, now() + ($5 * interval '1 millisecond'))
       RETURNING ${sessionColumns}`,
      [userId, jti, userAgent ?? null, ip ?? null, SESSION_TTL_MS]
    );
    return rows[0];
  }

  async validateAndTouch(jti: string): Promise<SessionRow | null> {
    const { rows } = await pool.query<SessionRow>(
      `UPDATE sessions
       SET expires_at = now() + ($2 * interval '1 millisecond')
       WHERE jti = $1 AND revoked_at IS NULL AND expires_at > now()
       RETURNING ${sessionColumns}`,
      [jti, SESSION_TTL_MS]
    );
    return rows[0] || null;
  }

  async revokeSession(jti: string): Promise<void> {
    await pool.query(
      `UPDATE sessions SET revoked_at = now() WHERE jti = $1 AND revoked_at IS NULL`,
      [jti]
    );
  }

  async revokeAllByUserId(userId: string, exceptJti?: string): Promise<void> {
    if (exceptJti) {
      await pool.query(
        `UPDATE sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL AND jti <> $2`,
        [userId, exceptJti]
      );
    } else {
      await pool.query(
        `UPDATE sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId]
      );
    }
  }

  async findByUserId(userId: string): Promise<SessionRow[]> {
    const { rows } = await pool.query<SessionRow>(
      `SELECT ${sessionColumns} FROM sessions WHERE user_id = $1 AND revoked_at IS NULL ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }

  async findById(id: string): Promise<SessionRow | null> {
    const { rows } = await pool.query<SessionRow>(
      `SELECT ${sessionColumns} FROM sessions WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }
}

export const generateJti = () => randomUUID();

export default new SessionService();

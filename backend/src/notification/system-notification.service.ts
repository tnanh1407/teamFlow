import pool from "../config/database.js";
import { AppError } from "../utils/errors/app-error.js";
import { SystemNotificationSchema } from "../schemas/index.js";

interface SystemNotificationRow {
  id: string;
  createdBy: string | null;
  source: "admin" | "system";
  title: string;
  content: string;
  type: string;
  priority: string;
  targetAudience: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSystemNotificationDataInput {
  title: string;
  content: string;
  type?: string;
  priority?: string;
  targetAudience?: string;
  isPinned?: boolean;
}

export type UpdateSystemNotificationDataInput = Partial<CreateSystemNotificationDataInput>;

const systemNotificationColumns = SystemNotificationSchema.columns;

const normalizeRequiredText = (value: string) => value.trim();

const normalizeAudience = (value?: string) => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return "all";
  if (["all", "user", "manager", "staff", "intern", "admin"].includes(normalized)) return normalized;
  return "all";
};

const getViewer = async (userId: string) => {
  const { rows } = await pool.query<{ role: string; position: string | null }>(
    `SELECT
       u.role,
       CASE
         WHEN LOWER(p.name) = 'quản lí' THEN 'manager'
         WHEN LOWER(p.name) = 'nhân viên' THEN 'staff'
         WHEN LOWER(p.name) = 'thực tập sinh' THEN 'intern'
         ELSE NULL
       END AS position
     FROM users u
     LEFT JOIN positions p ON p.id = u.position_id
     WHERE u.id = $1`,
    [userId]
  );

  return rows[0] || null;
};

class SystemNotificationService {
  async findAll() {
    const { rows } = await pool.query<SystemNotificationRow>(
      `SELECT ${systemNotificationColumns}
       FROM system_notifications
       ORDER BY is_pinned DESC, created_at DESC`
    );
    return rows;
  }

  async findVisibleForUser(userId: string) {
    const viewer = await getViewer(userId);
    if (!viewer) throw new AppError("User not found", 404);

    if (viewer.role === "admin") {
      return this.findAll();
    }

    const audiences = ["all", "user"];
    if (viewer.position) audiences.push(viewer.position);

    const { rows } = await pool.query<SystemNotificationRow>(
      `SELECT ${systemNotificationColumns}
       FROM system_notifications
       WHERE target_audience = ANY($1::text[])
       ORDER BY is_pinned DESC, created_at DESC`,
      [audiences]
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<SystemNotificationRow>(
      `SELECT ${systemNotificationColumns}
       FROM system_notifications
       WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByIdForUser(id: string, userId: string) {
    const row = await this.findById(id);
    if (!row) return null;

    const viewer = await getViewer(userId);
    if (!viewer) throw new AppError("User not found", 404);
    if (viewer.role === "admin") return row;

    const audience = row.targetAudience.toLowerCase();
    if (audience === "all" || audience === "user" || audience === viewer.position) {
      return row;
    }

    return null;
  }

  private async assertCanManage(userId: string) {
    const viewer = await getViewer(userId);
    if (!viewer) throw new AppError("User not found", 404);
    if (viewer.role !== "admin") {
      throw new AppError("Only admin can manage system notifications", 403);
    }
  }

  async create(data: CreateSystemNotificationDataInput, actorId: string) {
    await this.assertCanManage(actorId);

    const payload = {
      title: normalizeRequiredText(data.title),
      content: normalizeRequiredText(data.content),
      type: data.type || "announcement",
      priority: data.priority || "medium",
      targetAudience: normalizeAudience(data.targetAudience),
      isPinned: data.isPinned ?? false,
    };

    const { rows } = await pool.query<SystemNotificationRow>(
      `INSERT INTO system_notifications
         (created_by, source, title, content, type, priority, target_audience, is_pinned)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${systemNotificationColumns}`,
      [actorId, "admin", payload.title, payload.content, payload.type, payload.priority, payload.targetAudience, payload.isPinned]
    );

    return rows[0];
  }

  async update(id: string, data: UpdateSystemNotificationDataInput, actorId: string) {
    await this.assertCanManage(actorId);

    const current = await this.findById(id);
    if (!current) throw new AppError("Notification not found", 404);

    const payload: UpdateSystemNotificationDataInput = {};
    if (data.title !== undefined) payload.title = normalizeRequiredText(data.title);
    if (data.content !== undefined) payload.content = normalizeRequiredText(data.content);
    if (data.type !== undefined) payload.type = data.type;
    if (data.priority !== undefined) payload.priority = data.priority;
    if (data.targetAudience !== undefined) payload.targetAudience = normalizeAudience(data.targetAudience);
    if (data.isPinned !== undefined) payload.isPinned = data.isPinned;

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (payload.title !== undefined) { setClauses.push(`title = $${idx++}`); values.push(payload.title); }
    if (payload.content !== undefined) { setClauses.push(`content = $${idx++}`); values.push(payload.content); }
    if (payload.type !== undefined) { setClauses.push(`type = $${idx++}`); values.push(payload.type); }
    if (payload.priority !== undefined) { setClauses.push(`priority = $${idx++}`); values.push(payload.priority); }
    if (payload.targetAudience !== undefined) { setClauses.push(`target_audience = $${idx++}`); values.push(payload.targetAudience); }
    if (payload.isPinned !== undefined) { setClauses.push(`is_pinned = $${idx++}`); values.push(payload.isPinned); }

    if (setClauses.length === 0) return current;

    values.push(id);
    const { rows } = await pool.query<SystemNotificationRow>(
      `UPDATE system_notifications
       SET ${setClauses.join(", ")}
       WHERE id = $${idx}
       RETURNING ${systemNotificationColumns}`,
      values
    );

    return rows[0];
  }

  async delete(id: string, actorId: string): Promise<void> {
    await this.assertCanManage(actorId);

    const { rows } = await pool.query<SystemNotificationRow>(
      `DELETE FROM system_notifications
       WHERE id = $1
       RETURNING ${systemNotificationColumns}`,
      [id]
    );

    if (!rows[0]) throw new AppError("Notification not found", 404);
  }
}

export default new SystemNotificationService();

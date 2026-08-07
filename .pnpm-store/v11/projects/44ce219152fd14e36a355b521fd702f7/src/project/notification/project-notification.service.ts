import pool from "../../config/database.js";
import { AppError } from "../../utils/errors/app-error.js";
import { ProjectNotificationSchema } from "../../schemas/index.js";

interface ProjectNotificationRow {
  id: string;
  projectId: string;
  createdBy: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectNotificationDataInput {
  projectId: string;
  title: string;
  content: string;
  type?: string;
  priority?: string;
  isPinned?: boolean;
}

export type UpdateProjectNotificationDataInput = Partial<Omit<CreateProjectNotificationDataInput, "projectId">>;

const projectNotificationColumns = ProjectNotificationSchema.columns;

const normalizeRequiredText = (value: string) => value.trim();

const isAdminUser = async (userId: string) => {
  const { rows } = await pool.query<{ role: string }>(
    `SELECT role FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0]?.role === "admin";
};

const isProjectLeader = async (projectId: string, userId: string) => {
  const { rows } = await pool.query<{ id: string }>(
    `SELECT id
     FROM project_employees
     WHERE project_id = $1
       AND employee_id = $2
       AND role = 'leader'
     LIMIT 1`,
    [projectId, userId]
  );
  return Boolean(rows[0]);
};

class ProjectNotificationService {
  async findAllByProject(projectId: string) {
    const { rows } = await pool.query<ProjectNotificationRow>(
      `SELECT ${projectNotificationColumns}
       FROM project_notifications
       WHERE project_id = $1
       ORDER BY is_pinned DESC, created_at DESC`,
      [projectId]
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<ProjectNotificationRow>(
      `SELECT ${projectNotificationColumns}
       FROM project_notifications
       WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  private async assertCanManage(projectId: string, userId: string) {
    if (await isAdminUser(userId)) {
      throw new AppError("Admin can only view project notifications", 403);
    }

    const project = await pool.query(`SELECT id FROM projects WHERE id = $1`, [projectId]);
    if (!project.rows[0]) throw new AppError("Project not found", 404);

    const allowed = await isProjectLeader(projectId, userId);
    if (!allowed) {
      throw new AppError("Only project leader can manage notifications", 403);
    }
  }

  async create(data: CreateProjectNotificationDataInput, actorId: string) {
    await this.assertCanManage(data.projectId, actorId);

    const payload = {
      projectId: data.projectId,
      createdBy: actorId,
      title: normalizeRequiredText(data.title),
      content: normalizeRequiredText(data.content),
      type: data.type || "announcement",
      priority: data.priority || "medium",
      isPinned: data.isPinned ?? false,
    };

    const { rows } = await pool.query<ProjectNotificationRow>(
      `INSERT INTO project_notifications
         (project_id, created_by, title, content, type, priority, is_pinned)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${projectNotificationColumns}`,
      [
        payload.projectId,
        payload.createdBy,
        payload.title,
        payload.content,
        payload.type,
        payload.priority,
        payload.isPinned,
      ]
    );
    return rows[0];
  }

  async update(id: string, data: UpdateProjectNotificationDataInput, actorId: string) {
    const current = await this.findById(id);
    if (!current) throw new AppError("Notification not found", 404);

    await this.assertCanManage(current.projectId, actorId);

    const payload: UpdateProjectNotificationDataInput = {};
    if (data.title !== undefined) payload.title = normalizeRequiredText(data.title);
    if (data.content !== undefined) payload.content = normalizeRequiredText(data.content);
    if (data.type !== undefined) payload.type = data.type;
    if (data.priority !== undefined) payload.priority = data.priority;
    if (data.isPinned !== undefined) payload.isPinned = data.isPinned;

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (payload.title !== undefined) { setClauses.push(`title = $${idx++}`); values.push(payload.title); }
    if (payload.content !== undefined) { setClauses.push(`content = $${idx++}`); values.push(payload.content); }
    if (payload.type !== undefined) { setClauses.push(`type = $${idx++}`); values.push(payload.type); }
    if (payload.priority !== undefined) { setClauses.push(`priority = $${idx++}`); values.push(payload.priority); }
    if (payload.isPinned !== undefined) { setClauses.push(`is_pinned = $${idx++}`); values.push(payload.isPinned); }

    if (setClauses.length === 0) return current;

    values.push(id);
    const { rows } = await pool.query<ProjectNotificationRow>(
      `UPDATE project_notifications
       SET ${setClauses.join(", ")}
       WHERE id = $${idx}
       RETURNING ${projectNotificationColumns}`,
      values
    );
    return rows[0];
  }

  async delete(id: string, actorId: string): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new AppError("Notification not found", 404);

    await this.assertCanManage(current.projectId, actorId);

    const { rows } = await pool.query<ProjectNotificationRow>(
      `DELETE FROM project_notifications WHERE id = $1 RETURNING ${projectNotificationColumns}`,
      [id]
    );
    if (!rows[0]) throw new AppError("Notification not found", 404);
  }
}

export default new ProjectNotificationService();

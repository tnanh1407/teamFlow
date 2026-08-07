import { uploadToCloudinary } from "@/utils/upload/cloudinary.js";
import pool from "../../config/database.js";
import { ProjectCommentSchema } from "../../schemas/index.js";
import { AppError } from "../../utils/errors/app-error.js";

interface ProjectCommentRow {
  id: string;
  projectId: string;
  employeeId: string;
  content: string | null;
  attachments: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectCommentData {
  projectId: string;
  employeeId: string;
  content?: string;
  attachments?: string;
}

export type CreateProjectCommentDataInput = ProjectCommentData;
export type UpdateProjectCommentDataInput = Partial<Omit<ProjectCommentData ,"projectId , employeeId">>;

const projectCommentColumns = ProjectCommentSchema.columns;

const normalizeOptionalText = (value: string | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};
const isAdminUser = async (userId: string) => {
  const { rows } = await pool.query<{ role: string }>(
    `SELECT role FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0]?.role === "admin";
};

class ProjectCommentService {
  async findAll() {
    const { rows } = await pool.query<ProjectCommentRow>(
      `SELECT ${projectCommentColumns} FROM project_comments ORDER BY created_at DESC`
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<ProjectCommentRow>(
      `SELECT ${projectCommentColumns} FROM project_comments WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByProject(projectId: string) {
    const { rows } = await pool.query<ProjectCommentRow>(
      `SELECT ${projectCommentColumns} FROM project_comments WHERE project_id = $1 ORDER BY created_at DESC`,
      [projectId]
    );
    return rows;
  }

  async findByEmployee(employeeId: string) {
    const { rows } = await pool.query<ProjectCommentRow>(
      `SELECT ${projectCommentColumns} FROM project_comments WHERE employee_id = $1 ORDER BY created_at DESC`,
      [employeeId]
    );
    return rows;
  }

  async uploadFiles(files: Express.Multer.File[]) {
    const results = [];
    for (const f of files) {
      results.push({
        originalName: f.originalname,
        url: await uploadToCloudinary(f, "attachments"),
        size: f.size,
        mimetype: f.mimetype,
      });
    }
    return results;
  }

  async create(data: CreateProjectCommentDataInput) {
    if (await isAdminUser(data.employeeId)) {
      throw new AppError("Admin cannot be used as a project actor", 400);
    }

    const content = normalizeOptionalText(data.content);
    const attachments = normalizeOptionalText(data.attachments);

    const { rows } = await pool.query<ProjectCommentRow>(
      `INSERT INTO project_comments (project_id, employee_id, content, attachments) VALUES ($1, $2, $3, $4) RETURNING ${projectCommentColumns}`,
      [data.projectId, data.employeeId, content, attachments]
    );

    await pool.query(
      `INSERT INTO project_logs (project_id, employee_id, action, description) VALUES ($1, $2, $3, $4)`,
      [
        data.projectId,
        data.employeeId,
        "commented",
        content
          ? `Bình luận: "${content.slice(0, 50)}${content.length > 50 ? "..." : ""}"`
          : "đã đăng một bình luận",
      ]
    );

    return rows[0];
  }

  async update(id: string, data: UpdateProjectCommentDataInput) {
    // chuẩn hóa lại dữ liệu trước khi đẩy vào db
    const payload: UpdateProjectCommentDataInput = {};

    if (data.content !== undefined) payload.content = normalizeOptionalText(data.content) ?? undefined;
    if (data.attachments !== undefined) payload.attachments = normalizeOptionalText(data.attachments) ?? undefined;

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (payload.content !== undefined) { setClauses.push(`content = $${idx++}`); values.push(payload.content); }
    if (payload.attachments !== undefined) { setClauses.push(`attachments = $${idx++}`); values.push(payload.attachments); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query<ProjectCommentRow>(
      `UPDATE project_comments SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${projectCommentColumns}`,
      values
    );
    if (!rows[0]) throw new AppError("Comment not found", 404);
    return rows[0];
  }

  async delete(id: string): Promise<void> {
    const { rows } = await pool.query<ProjectCommentRow>(
      `DELETE FROM project_comments WHERE id = $1 RETURNING ${projectCommentColumns}`,
      [id]
    );
    if (!rows[0]) throw new AppError("Comment not found", 404);
  }
}

export default new ProjectCommentService();

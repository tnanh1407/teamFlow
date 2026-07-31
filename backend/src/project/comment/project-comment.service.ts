import { handleFileUpload } from "@/utils/upload/upload.js";
import pool from "../../config/database.js";
import { ProjectCommentSchema } from "../../schemas/index.js";

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
    return files.map((f) => ({
      originalName: f.originalname,
      url: handleFileUpload(f, "attachments")!,
      size: f.size,
      mimetype: f.mimetype,
    }));
  }

  async create(data: CreateProjectCommentDataInput) {
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
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (data.content !== undefined) {
      setClauses.push(`content = $${idx++}`);
      values.push(normalizeOptionalText(data.content));
    }
    if (data.attachments !== undefined) {
      setClauses.push(`attachments = $${idx++}`);
      values.push(normalizeOptionalText(data.attachments));
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query<ProjectCommentRow>(
      `UPDATE project_comments SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${projectCommentColumns}`,
      values
    );
    return rows[0] || null;
  }

  async delete(id: string) {
    const { rows } = await pool.query<ProjectCommentRow>(
      `DELETE FROM project_comments WHERE id = $1 RETURNING ${projectCommentColumns}`,
      [id]
    );
    return rows[0] || null;
  }
}

export default new ProjectCommentService();

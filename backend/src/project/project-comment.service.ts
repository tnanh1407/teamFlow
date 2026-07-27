import pool from "../config/database.js";
import { ProjectCommentSchema } from "../schemas/index.js";

interface ProjectCommentRow {
  id: string;
  projectId: string;
  employeeId: string;
  content: string;
  attachments: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectCommentColumns = ProjectCommentSchema.columns;

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

  async create(data: {
    projectId: string;
    employeeId: string;
    content?: string;
    attachments?: string;
  }) {
    const { rows } = await pool.query<ProjectCommentRow>(
      `INSERT INTO project_comments (project_id, employee_id, content, attachments) VALUES ($1, $2, $3, $4) RETURNING ${projectCommentColumns}`,
      [data.projectId, data.employeeId, data.content || null, data.attachments || null]
    );
    return rows[0];
  }

  async update(id: string, data: Partial<{
    projectId: string;
    employeeId: string;
    content: string;
    attachments: string;
  }>) {
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.projectId !== undefined) { setClauses.push(`project_id = $${idx++}`); values.push(data.projectId); }
    if (data.employeeId !== undefined) { setClauses.push(`employee_id = $${idx++}`); values.push(data.employeeId); }
    if (data.content !== undefined) { setClauses.push(`content = $${idx++}`); values.push(data.content); }
    if (data.attachments !== undefined) { setClauses.push(`attachments = $${idx++}`); values.push(data.attachments); }

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

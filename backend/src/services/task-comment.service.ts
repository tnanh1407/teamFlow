import pool from "../config/database.js";

interface TaskCommentRow {
  id: string;
  taskId: string;
  employeeId: string;
  content: string;
  attachments: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskCommentColumns = `id, task_id AS "taskId", employee_id AS "employeeId", content, attachments, created_at AS "createdAt", updated_at AS "updatedAt"`;

class TaskCommentService {
  async findAll() {
    const { rows } = await pool.query<TaskCommentRow>(
      `SELECT ${taskCommentColumns} FROM task_comments ORDER BY created_at DESC`
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<TaskCommentRow>(
      `SELECT ${taskCommentColumns} FROM task_comments WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByTask(taskId: string) {
    const { rows } = await pool.query<TaskCommentRow>(
      `SELECT ${taskCommentColumns} FROM task_comments WHERE task_id = $1 ORDER BY created_at DESC`,
      [taskId]
    );
    return rows;
  }

  async findByEmployee(employeeId: string) {
    const { rows } = await pool.query<TaskCommentRow>(
      `SELECT ${taskCommentColumns} FROM task_comments WHERE employee_id = $1 ORDER BY created_at DESC`,
      [employeeId]
    );
    return rows;
  }

  async create(data: {
    taskId: string;
    employeeId: string;
    content?: string;
    attachments?: string;
  }) {
    const { rows } = await pool.query<TaskCommentRow>(
      `INSERT INTO task_comments (task_id, employee_id, content, attachments) VALUES ($1, $2, $3, $4) RETURNING ${taskCommentColumns}`,
      [data.taskId, data.employeeId, data.content || null, data.attachments || null]
    );
    return rows[0];
  }

  async update(id: string, data: Partial<{
    taskId: string;
    employeeId: string;
    content: string;
    attachments: string;
  }>) {
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.taskId !== undefined) { setClauses.push(`task_id = $${idx++}`); values.push(data.taskId); }
    if (data.employeeId !== undefined) { setClauses.push(`employee_id = $${idx++}`); values.push(data.employeeId); }
    if (data.content !== undefined) { setClauses.push(`content = $${idx++}`); values.push(data.content); }
    if (data.attachments !== undefined) { setClauses.push(`attachments = $${idx++}`); values.push(data.attachments); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query<TaskCommentRow>(
      `UPDATE task_comments SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${taskCommentColumns}`,
      values
    );
    return rows[0] || null;
  }

  async delete(id: string) {
    const { rows } = await pool.query<TaskCommentRow>(
      `DELETE FROM task_comments WHERE id = $1 RETURNING ${taskCommentColumns}`,
      [id]
    );
    return rows[0] || null;
  }
}

export default new TaskCommentService();

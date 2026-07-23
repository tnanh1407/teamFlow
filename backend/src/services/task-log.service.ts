import pool from "../config/database.js";
import { TaskLogSchema } from "../schemas/index.js";

interface TaskLogRow {
  id: string;
  taskId: string;
  employeeId: string;
  action: string;
  description: string;
  createdAt: Date;
}

const taskLogColumns = TaskLogSchema.columns;

class TaskLogService {
  async findAll() {
    const { rows } = await pool.query<TaskLogRow>(
      `SELECT ${taskLogColumns} FROM task_logs ORDER BY created_at DESC`
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<TaskLogRow>(
      `SELECT ${taskLogColumns} FROM task_logs WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByTask(taskId: string) {
    const { rows } = await pool.query<TaskLogRow>(
      `SELECT ${taskLogColumns} FROM task_logs WHERE task_id = $1 ORDER BY created_at DESC`,
      [taskId]
    );
    return rows;
  }

  async findByEmployee(employeeId: string) {
    const { rows } = await pool.query<TaskLogRow>(
      `SELECT ${taskLogColumns} FROM task_logs WHERE employee_id = $1 ORDER BY created_at DESC`,
      [employeeId]
    );
    return rows;
  }

  async create(data: {
    taskId: string;
    employeeId: string;
    action?: string;
    description?: string;
  }) {
    const { rows } = await pool.query<TaskLogRow>(
      `INSERT INTO task_logs (task_id, employee_id, action, description) VALUES ($1, $2, $3, $4) RETURNING ${taskLogColumns}`,
      [data.taskId, data.employeeId, data.action || null, data.description || null]
    );
    return rows[0];
  }
}

export default new TaskLogService();

import pool from "../config/database.js";
import { TaskDepartmentSchema } from "../schemas/index.js";

interface TaskDepartmentRow {
  taskId: string;
  departmentId: string;
  assignedAt: Date;
}

const taskDepartmentColumns = TaskDepartmentSchema.columns;

class TaskDepartmentService {
  async findAll() {
    const { rows } = await pool.query<TaskDepartmentRow>(
      `SELECT ${taskDepartmentColumns} FROM task_departments ORDER BY assigned_at DESC`
    );
    return rows;
  }

  async findByTask(taskId: string) {
    const { rows } = await pool.query<TaskDepartmentRow>(
      `SELECT ${taskDepartmentColumns} FROM task_departments WHERE task_id = $1 ORDER BY assigned_at DESC`,
      [taskId]
    );
    return rows;
  }

  async findByDepartment(departmentId: string) {
    const { rows } = await pool.query<TaskDepartmentRow>(
      `SELECT ${taskDepartmentColumns} FROM task_departments WHERE department_id = $1 ORDER BY assigned_at DESC`,
      [departmentId]
    );
    return rows;
  }

  async create(data: {
    taskId: string;
    departmentId: string;
  }) {
    const { rows } = await pool.query<TaskDepartmentRow>(
      `INSERT INTO task_departments (task_id, department_id) VALUES ($1, $2) RETURNING ${taskDepartmentColumns}`,
      [data.taskId, data.departmentId]
    );
    return rows[0];
  }

  async delete(taskId: string, departmentId: string) {
    const { rows } = await pool.query<TaskDepartmentRow>(
      `DELETE FROM task_departments WHERE task_id = $1 AND department_id = $2 RETURNING ${taskDepartmentColumns}`,
      [taskId, departmentId]
    );
    return rows[0] || null;
  }
}

export default new TaskDepartmentService();

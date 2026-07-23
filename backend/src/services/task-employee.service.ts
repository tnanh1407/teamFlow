import pool from "../config/database.js";
import { TaskEmployeeSchema } from "../schemas/index.js";

interface TaskEmployeeRow {
  id: string;
  taskId: string;
  employeeId: string;
  role: string;
  assignedAt: Date;
}

const taskEmployeeColumns = TaskEmployeeSchema.columns;

class TaskEmployeeService {
  async findAll() {
    const { rows } = await pool.query<TaskEmployeeRow>(
      `SELECT ${taskEmployeeColumns} FROM task_employees ORDER BY assigned_at DESC`
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<TaskEmployeeRow>(
      `SELECT ${taskEmployeeColumns} FROM task_employees WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByTask(taskId: string) {
    const { rows } = await pool.query<TaskEmployeeRow>(
      `SELECT ${taskEmployeeColumns} FROM task_employees WHERE task_id = $1 ORDER BY assigned_at DESC`,
      [taskId]
    );
    return rows;
  }

  async findByEmployee(employeeId: string) {
    const { rows } = await pool.query<TaskEmployeeRow>(
      `SELECT ${taskEmployeeColumns} FROM task_employees WHERE employee_id = $1 ORDER BY assigned_at DESC`,
      [employeeId]
    );
    return rows;
  }

  async create(data: {
    taskId: string;
    employeeId: string;
    role?: string;
  }) {
    const { rows } = await pool.query<TaskEmployeeRow>(
      `INSERT INTO task_employees (task_id, employee_id, role) VALUES ($1, $2, $3) RETURNING ${taskEmployeeColumns}`,
      [data.taskId, data.employeeId, data.role || "member"]
    );
    return rows[0];
  }

  async update(id: string, data: Partial<{
    taskId: string;
    employeeId: string;
    role: string;
  }>) {
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.taskId !== undefined) { setClauses.push(`task_id = $${idx++}`); values.push(data.taskId); }
    if (data.employeeId !== undefined) { setClauses.push(`employee_id = $${idx++}`); values.push(data.employeeId); }
    if (data.role !== undefined) { setClauses.push(`role = $${idx++}`); values.push(data.role); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query<TaskEmployeeRow>(
      `UPDATE task_employees SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${taskEmployeeColumns}`,
      values
    );
    return rows[0] || null;
  }

  async delete(id: string) {
    const { rows } = await pool.query<TaskEmployeeRow>(
      `DELETE FROM task_employees WHERE id = $1 RETURNING ${taskEmployeeColumns}`,
      [id]
    );
    return rows[0] || null;
  }

  async deleteByTaskAndEmployee(taskId: string, employeeId: string) {
    const { rows } = await pool.query<TaskEmployeeRow>(
      `DELETE FROM task_employees WHERE task_id = $1 AND employee_id = $2 RETURNING ${taskEmployeeColumns}`,
      [taskId, employeeId]
    );
    return rows[0] || null;
  }
}

export default new TaskEmployeeService();

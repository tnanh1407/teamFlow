import pool from "../../config/database.js";
import { ProjectEmployeeSchema } from "../../schemas/index.js";
import { AppError } from "../../utils/errors/app-error.js";

interface ProjectEmployeeRow {
  id: string;
  projectId: string;
  employeeId: string;
  role: string;
  assignedAt: Date;
}


const projectEmployeeColumns = ProjectEmployeeSchema.columns;

class ProjectEmployeeService {
  async findAll() {
    const { rows } = await pool.query<ProjectEmployeeRow>(
      `SELECT ${projectEmployeeColumns} FROM project_employees ORDER BY assigned_at DESC`
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<ProjectEmployeeRow>(
      `SELECT ${projectEmployeeColumns} FROM project_employees WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByEmployee(employeeId: string) {
    const { rows } = await pool.query<ProjectEmployeeRow>(
      `SELECT ${projectEmployeeColumns} FROM project_employees WHERE employee_id = $1 ORDER BY assigned_at DESC`,
      [employeeId]
    );
    return rows;
  }

  async create(data: {
    projectId: string;
    employeeId: string;
    role?: string;
  }) {
    const user = await pool.query(
      `SELECT department_id FROM users WHERE id = $1`,
      [data.employeeId]
    );
    if (!user.rows[0]) throw new AppError("Employee not found", 404);

    const projectDept = await pool.query(
      `SELECT 1 FROM project_departments WHERE project_id = $1 AND department_id = $2`,
      [data.projectId, user.rows[0].department_id]
    );
    if (!projectDept.rows[0]) {
      throw new AppError("Employee's department is not assigned to this project", 400);
    }

    const { rows } = await pool.query<ProjectEmployeeRow>(
      `INSERT INTO project_employees (project_id, employee_id, role) VALUES ($1, $2, $3) RETURNING ${projectEmployeeColumns}`,
      [data.projectId, data.employeeId, data.role || "member"]
    );
    return rows[0];
  }

  async update(id: string, role: string) {
    const { rows } = await pool.query<ProjectEmployeeRow>(
      `UPDATE project_employees SET role = $1 WHERE id = $2 RETURNING ${projectEmployeeColumns}`,
      [role, id]
    );
    return rows[0] || null;
  }

  async delete(id: string) {
    const assignment = await pool.query<ProjectEmployeeRow>(
      `SELECT ${projectEmployeeColumns} FROM project_employees WHERE id = $1`,
      [id]
    );
    if (!assignment.rows[0]) return null;

    const user = await pool.query(
      `SELECT department_id FROM users WHERE id = $1`,
      [assignment.rows[0].employeeId]
    );
    if (!user.rows[0]) throw new AppError("Employee not found", 404);

    const projectDept = await pool.query(
      `SELECT 1 FROM project_departments WHERE project_id = $1 AND department_id = $2`,
      [assignment.rows[0].projectId, user.rows[0].department_id]
    );
    if (!projectDept.rows[0]) {
      throw new AppError("Employee's department is not assigned to this project", 400);
    }

    const { rows } = await pool.query<ProjectEmployeeRow>(
      `DELETE FROM project_employees WHERE id = $1 RETURNING ${projectEmployeeColumns}`,
      [id]
    );
    return rows[0] || null;
  }

  async deleteByProjectAndEmployee(projectId: string, employeeId: string) {
    const { rows } = await pool.query<ProjectEmployeeRow>(
      `DELETE FROM project_employees WHERE project_id = $1 AND employee_id = $2 RETURNING ${projectEmployeeColumns}`,
      [projectId, employeeId]
    );
    return rows[0] || null;
  }
}

export default new ProjectEmployeeService();

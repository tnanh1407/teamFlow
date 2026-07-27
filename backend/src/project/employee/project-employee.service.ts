import pool from "../../config/database.js";
import { ProjectEmployeeSchema } from "../../schemas/index.js";

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

  async findByProject(projectId: string) {
    const { rows } = await pool.query<ProjectEmployeeRow>(
      `SELECT ${projectEmployeeColumns} FROM project_employees WHERE project_id = $1 ORDER BY assigned_at DESC`,
      [projectId]
    );
    return rows;
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
    const { rows } = await pool.query<ProjectEmployeeRow>(
      `INSERT INTO project_employees (project_id, employee_id, role) VALUES ($1, $2, $3) RETURNING ${projectEmployeeColumns}`,
      [data.projectId, data.employeeId, data.role || "member"]
    );
    return rows[0];
  }

  async update(id: string, data: Partial<{
    projectId: string;
    employeeId: string;
    role: string;
  }>) {
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.projectId !== undefined) { setClauses.push(`project_id = $${idx++}`); values.push(data.projectId); }
    if (data.employeeId !== undefined) { setClauses.push(`employee_id = $${idx++}`); values.push(data.employeeId); }
    if (data.role !== undefined) { setClauses.push(`role = $${idx++}`); values.push(data.role); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query<ProjectEmployeeRow>(
      `UPDATE project_employees SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${projectEmployeeColumns}`,
      values
    );
    return rows[0] || null;
  }

  async delete(id: string) {
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

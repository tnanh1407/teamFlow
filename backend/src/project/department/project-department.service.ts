import pool from "../../config/database.js";
import { ProjectDepartmentSchema } from "../../schemas/index.js";

interface ProjectDepartmentRow {
  projectId: string;
  departmentId: string;
  assignedAt: Date;
}

const projectDepartmentColumns = ProjectDepartmentSchema.columns;

class ProjectDepartmentService {
  async findAll() {
    const { rows } = await pool.query<ProjectDepartmentRow>(
      `SELECT ${projectDepartmentColumns} FROM project_departments ORDER BY assigned_at DESC`
    );
    return rows;
  }

  async findByProject(projectId: string) {
    const { rows } = await pool.query<ProjectDepartmentRow>(
      `SELECT ${projectDepartmentColumns} FROM project_departments WHERE project_id = $1 ORDER BY assigned_at DESC`,
      [projectId]
    );
    return rows;
  }

  async findByDepartment(departmentId: string) {
    const { rows } = await pool.query<ProjectDepartmentRow>(
      `SELECT ${projectDepartmentColumns} FROM project_departments WHERE department_id = $1 ORDER BY assigned_at DESC`,
      [departmentId]
    );
    return rows;
  }

  async create(data: {
    projectId: string;
    departmentId: string;
  }) {
    const { rows } = await pool.query<ProjectDepartmentRow>(
      `INSERT INTO project_departments (project_id, department_id) VALUES ($1, $2) RETURNING ${projectDepartmentColumns}`,
      [data.projectId, data.departmentId]
    );
    return rows[0];
  }

  async delete(projectId: string, departmentId: string) {
    const { rows } = await pool.query<ProjectDepartmentRow>(
      `DELETE FROM project_departments WHERE project_id = $1 AND department_id = $2 RETURNING ${projectDepartmentColumns}`,
      [projectId, departmentId]
    );
    return rows[0] || null;
  }
}

export default new ProjectDepartmentService();

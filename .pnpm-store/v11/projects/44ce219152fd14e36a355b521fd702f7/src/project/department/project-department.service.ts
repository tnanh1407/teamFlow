import pool from "../../config/database.js";
import { ProjectDepartmentSchema } from "../../schemas/index.js";
import { AppError } from "../../utils/errors/app-error.js";

// dữ liệu database
interface ProjectDepartmentRow {
  projectId: string;
  departmentId: string;
  assignedAt: Date;
}

// dữ liệu đầu vào
export interface CreateProjectDepartmentDataInput {
  projectId: string;
  departmentId: string;
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

  async create(data: CreateProjectDepartmentDataInput) {
    const { rows } = await pool.query<ProjectDepartmentRow>(
      `INSERT INTO project_departments (project_id, department_id) VALUES ($1, $2) RETURNING ${projectDepartmentColumns}`,
      [data.projectId, data.departmentId]
    );
    return rows[0];
  }

  async delete(projectId: string, departmentId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query<ProjectDepartmentRow>(
        `DELETE FROM project_departments WHERE project_id = $1 AND department_id = $2 RETURNING ${projectDepartmentColumns}`,
        [projectId, departmentId]
      );
      if (!rows[0]) {
        await client.query("ROLLBACK");
        throw new AppError("Assignment not found", 404);
      }

      await client.query(
        `DELETE FROM project_employees
         WHERE project_id = $1
           AND employee_id IN (SELECT id FROM users WHERE department_id = $2)`,
        [projectId, departmentId]
      );

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

export default new ProjectDepartmentService();

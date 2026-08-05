import pool from "../../config/database.js";
import { ProjectEmployeeSchema } from "../../schemas/index.js";
import { AppError } from "../../utils/errors/app-error.js";

// dữ liệu database
interface ProjectEmployeeRow {
  id: string;
  projectId: string;
  employeeId: string;
  role: string;
  assignedAt: Date;
}

// dữ liệu đầu vào
export interface CreateProjectEmployeeDataInput {
  projectId: string;
  employeeId: string;
  role?: string;
}
export type UpdateProjectEmployeeDataInput = Partial<
  Omit<CreateProjectEmployeeDataInput, "projectId" | "employeeId">
>;

const projectEmployeeColumns = ProjectEmployeeSchema.columns;

const normalizeRequiredText = (value: string) => value.trim();
const isAdminUser = async (userId: string) => {
  const { rows } = await pool.query<{ role: string }>(
    `SELECT role FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0]?.role === "admin";
};

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

  async findByProject(projectId: string) {
    const { rows } = await pool.query<ProjectEmployeeRow>(
      `SELECT ${projectEmployeeColumns} FROM project_employees WHERE project_id = $1 ORDER BY assigned_at DESC`,
      [projectId]
    );
    return rows;
  }

  private async checkAssignable(projectId: string, employeeId: string) {
    const user = await pool.query(
      `SELECT department_id, role FROM users WHERE id = $1`,
      [employeeId]
    );
    if (!user.rows[0]) throw new AppError("Employee not found", 404);
    if (user.rows[0].role === "admin") throw new AppError("Admin cannot be assigned to projects", 400);

    const projectDept = await pool.query(
      `SELECT 1 FROM project_departments WHERE project_id = $1 AND department_id = $2`,
      [projectId, user.rows[0].department_id]
    );
    if (!projectDept.rows[0]) {
      throw new AppError("Employee's department is not assigned to this project", 400);
    }
  }

  async create(data: CreateProjectEmployeeDataInput) {
    // chuẩn hóa lại dữ liệu trước khi đẩy vào db
    const payload = {
      projectId: data.projectId,
      employeeId: data.employeeId,
      role: data.role || "member",
    };

    if (await isAdminUser(payload.employeeId)) {
      throw new AppError("Admin cannot be assigned to projects", 400);
    }

    await this.checkAssignable(payload.projectId, payload.employeeId);

    const { rows } = await pool.query<ProjectEmployeeRow>(
      `INSERT INTO project_employees (project_id, employee_id, role) VALUES ($1, $2, $3) RETURNING ${projectEmployeeColumns}`,
      [payload.projectId, payload.employeeId, payload.role]
    );
    return rows[0];
  }

  async update(id: string, role: string) {
    const { rows } = await pool.query<ProjectEmployeeRow>(
      `UPDATE project_employees SET role = $1 WHERE id = $2 RETURNING ${projectEmployeeColumns}`,
      [normalizeRequiredText(role), id]
    );
    if (!rows[0]) throw new AppError("Assignment not found", 404);
    return rows[0];
  }

  async delete(id: string): Promise<void> {
    const assignment = await pool.query<ProjectEmployeeRow>(
      `SELECT ${projectEmployeeColumns} FROM project_employees WHERE id = $1`,
      [id]
    );
    if (!assignment.rows[0]) throw new AppError("Assignment not found", 404);

    await this.checkAssignable(assignment.rows[0].projectId, assignment.rows[0].employeeId);

    await pool.query<ProjectEmployeeRow>(
      `DELETE FROM project_employees WHERE id = $1`,
      [id]
    );
  }

  async deleteByProjectAndEmployee(projectId: string, employeeId: string): Promise<void> {
    const { rows } = await pool.query<ProjectEmployeeRow>(
      `DELETE FROM project_employees WHERE project_id = $1 AND employee_id = $2 RETURNING ${projectEmployeeColumns}`,
      [projectId, employeeId]
    );
    if (!rows[0]) throw new AppError("Assignment not found", 404);
  }
}

export default new ProjectEmployeeService();

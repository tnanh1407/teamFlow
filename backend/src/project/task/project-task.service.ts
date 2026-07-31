import pool from "../../config/database.js";
import { ProjectTaskSchema } from "../../schemas/index.js";
import { AppError } from "../../utils/errors/app-error.js";
import { EProjectTaskStatus } from "../../enums/project-task-status.enum.js";

// dữ liệu database
interface ProjectTaskRow {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignedTo: string | null;
  assignedBy: string | null;
  assignedAt: Date | null;
  dueDate: string | null;
  createdBy: string;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// dữ liệu đầu vào
export interface CreateProjectTaskDataInput {
  projectId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueDate?: string;
  assignedBy: string;
  createdBy: string;
}
export type UpdateProjectTaskDataInput = Partial<
  Omit<CreateProjectTaskDataInput, "projectId" | "assignedBy" | "createdBy">
>;

const projectTaskColumns = ProjectTaskSchema.columns;

const normalizeRequiredText = (value: string) => value.trim();
const normalizeOptionalText = (value: string | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

class ProjectTaskService {
  async findAll() {
    const { rows } = await pool.query<ProjectTaskRow>(
      `SELECT ${projectTaskColumns} FROM project_tasks ORDER BY created_at DESC`
    );
    return rows;
  }

  async findAllByProject(projectId: string, filters: { status?: string; assignedTo?: string }) {
    const conditions: string[] = ["project_id = $1"];
    const values: any[] = [projectId];
    let idx = 2;

    if (filters.status) {
      conditions.push(`status = $${idx++}`);
      values.push(filters.status);
    }
    if (filters.assignedTo) {
      conditions.push(`assigned_to = $${idx++}`);
      values.push(filters.assignedTo);
    }

    const { rows } = await pool.query<ProjectTaskRow>(
      `SELECT ${projectTaskColumns} FROM project_tasks
       WHERE ${conditions.join(" AND ")}
       ORDER BY created_at DESC`,
      values
    );
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query<ProjectTaskRow>(
      `SELECT ${projectTaskColumns} FROM project_tasks WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByEmployee(employeeId: string) {
    const { rows } = await pool.query<ProjectTaskRow>(
      `SELECT ${projectTaskColumns} FROM project_tasks WHERE assigned_to = $1 ORDER BY created_at DESC`,
      [employeeId]
    );
    return rows;
  }

  private async checkAssignable(projectId: string, assignedTo: string) {
    const user = await pool.query(
      `SELECT department_id FROM users WHERE id = $1`,
      [assignedTo]
    );
    if (!user.rows[0]) throw new AppError("Employee not found", 404);

    const projectDept = await pool.query(
      `SELECT 1 FROM project_departments WHERE project_id = $1 AND department_id = $2`,
      [projectId, user.rows[0].department_id]
    );
    if (!projectDept.rows[0]) {
      throw new AppError("Employee's department is not assigned to this project", 400);
    }
  }

  async create(data: CreateProjectTaskDataInput) {
    const project = await pool.query(`SELECT id FROM projects WHERE id = $1`, [data.projectId]);
    if (!project.rows[0]) throw new AppError("Project not found", 404);

    const assignedTo = normalizeOptionalText(data.assignedTo);
    if (assignedTo) {
      await this.checkAssignable(data.projectId, assignedTo);
    }

    // chuẩn hóa lại dữ liệu trước khi đẩy vào db
    const payload = {
      projectId: data.projectId,
      title: normalizeRequiredText(data.title),
      description: normalizeOptionalText(data.description),
      status: data.status || EProjectTaskStatus.TODO,
      priority: data.priority || "medium",
      assignedTo,
      assignedBy: data.assignedBy,
      assignedAt: assignedTo ? new Date() : null,
      dueDate: normalizeOptionalText(data.dueDate),
      createdBy: data.createdBy,
    };

    const { rows } = await pool.query<ProjectTaskRow>(
      `INSERT INTO project_tasks
         (project_id, title, description, status, priority, assigned_to, assigned_by, assigned_at, due_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${projectTaskColumns}`,
      [
        payload.projectId,
        payload.title,
        payload.description,
        payload.status,
        payload.priority,
        payload.assignedTo,
        payload.assignedBy,
        payload.assignedAt,
        payload.dueDate,
        payload.createdBy,
      ]
    );
    return rows[0];
  }

  async update(id: string, data: UpdateProjectTaskDataInput) {
    const task = await this.findById(id);
    if (!task) throw new AppError("Task not found", 404);

    // chuẩn hóa lại dữ liệu trước khi đẩy vào db
    const payload: UpdateProjectTaskDataInput = {};

    if (data.title !== undefined) payload.title = normalizeRequiredText(data.title);
    if (data.description !== undefined) payload.description = normalizeOptionalText(data.description) ?? undefined;
    if (data.status !== undefined) payload.status = data.status;
    if (data.priority !== undefined) payload.priority = data.priority;
    if (data.assignedTo !== undefined) payload.assignedTo = normalizeOptionalText(data.assignedTo) ?? undefined;
    if (data.dueDate !== undefined) payload.dueDate = normalizeOptionalText(data.dueDate) ?? undefined;

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (payload.title !== undefined) { setClauses.push(`title = $${idx++}`); values.push(payload.title); }
    if (payload.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(payload.description); }
    if (payload.priority !== undefined) { setClauses.push(`priority = $${idx++}`); values.push(payload.priority); }
    if (payload.dueDate !== undefined) { setClauses.push(`due_date = $${idx++}`); values.push(payload.dueDate); }

    if (payload.assignedTo !== undefined) {
      if (payload.assignedTo) {
        await this.checkAssignable(task.projectId, payload.assignedTo);
        setClauses.push(`assigned_to = $${idx++}, assigned_by = $${idx++}, assigned_at = $${idx++}`);
        values.push(payload.assignedTo, task.assignedBy ?? null, new Date());
      } else {
        setClauses.push(`assigned_to = $${idx++}, assigned_at = $${idx++}`);
        values.push(null, null);
      }
    }

    if (payload.status !== undefined) {
      setClauses.push(`status = $${idx++}`);
      values.push(payload.status);
      if (payload.status === EProjectTaskStatus.COMPLETED || payload.status === EProjectTaskStatus.CANCELLED) {
        setClauses.push(`completed_at = $${idx++}`);
        values.push(new Date());
      } else {
        setClauses.push(`completed_at = $${idx++}`);
        values.push(null);
      }
    }

    if (setClauses.length === 0) return task;

    values.push(id);
    const { rows } = await pool.query<ProjectTaskRow>(
      `UPDATE project_tasks SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING ${projectTaskColumns}`,
      values
    );
    return rows[0];
  }

  async delete(id: string): Promise<void> {
    const { rows } = await pool.query<ProjectTaskRow>(
      `DELETE FROM project_tasks WHERE id = $1 RETURNING ${projectTaskColumns}`,
      [id]
    );
    if (!rows[0]) throw new AppError("Task not found", 404);
  }
}

export default new ProjectTaskService();

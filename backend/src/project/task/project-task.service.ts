import pool from "../../config/database.js";
import { ProjectTaskSchema } from "../../schemas/index.js";
import { AppError } from "../../utils/errors/app-error.js";
import { EProjectTaskStatus } from "../../enums/project-task-status.enum.js";

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

const projectTaskColumns = ProjectTaskSchema.columns;

class ProjectTaskService {
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

  async create(data: {
    projectId: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    dueDate?: string;
    assignedBy: string;
    createdBy: string;
  }) {
    const project = await pool.query(`SELECT id FROM projects WHERE id = $1`, [data.projectId]);
    if (!project.rows[0]) throw new AppError("Project not found", 404);

    const assignedTo = data.assignedTo || null;
    if (assignedTo) {
      await this.checkAssignable(data.projectId, assignedTo);
    }

    const { rows } = await pool.query<ProjectTaskRow>(
      `INSERT INTO project_tasks
         (project_id, title, description, status, priority, assigned_to, assigned_by, assigned_at, due_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${projectTaskColumns}`,
      [
        data.projectId,
        data.title.trim(),
        data.description?.trim() || null,
        data.status || EProjectTaskStatus.TODO,
        data.priority || "medium",
        assignedTo,
        data.assignedBy,
        assignedTo ? new Date() : null,
        data.dueDate || null,
        data.createdBy,
      ]
    );
    return rows[0];
  }

  async update(id: string, data: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    assignedTo: string;
    dueDate: string;
  }>) {
    const task = await this.findById(id);
    if (!task) return null;

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.title !== undefined) {
      setClauses.push(`title = $${idx++}`);
      values.push(data.title.trim());
    }
    if (data.description !== undefined) {
      setClauses.push(`description = $${idx++}`);
      values.push(data.description.trim() || null);
    }
    if (data.priority !== undefined) {
      setClauses.push(`priority = $${idx++}`);
      values.push(data.priority);
    }
    if (data.dueDate !== undefined) {
      setClauses.push(`due_date = $${idx++}`);
      values.push(data.dueDate || null);
    }
    if (data.assignedTo !== undefined) {
      if (data.assignedTo) {
        await this.checkAssignable(task.projectId, data.assignedTo);
        setClauses.push(`assigned_to = $${idx++}, assigned_by = $${idx++}, assigned_at = $${idx++}`);
        values.push(data.assignedTo, task.assignedBy ?? null, new Date());
      } else {
        setClauses.push(`assigned_to = $${idx++}, assigned_at = $${idx++}`);
        values.push(null, null);
      }
    }
    if (data.status !== undefined) {
      setClauses.push(`status = $${idx++}`);
      values.push(data.status);
      if (data.status === EProjectTaskStatus.COMPLETED || data.status === EProjectTaskStatus.CANCELLED) {
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

  async delete(id: string) {
    const { rows } = await pool.query<ProjectTaskRow>(
      `DELETE FROM project_tasks WHERE id = $1 RETURNING ${projectTaskColumns}`,
      [id]
    );
    return rows[0] || null;
  }
}

export default new ProjectTaskService();

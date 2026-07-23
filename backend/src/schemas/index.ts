export const DepartmentSchema = {
  table: "departments",
  columns: `id, name, code, description, manager_id AS "managerId", is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"`,
} as const;

export const EmployeeSchema = {
  table: "employees",
  columns: `id, department_id AS "departmentId", position_id AS "positionId", employee_code AS "employeeCode", name, email, phone, birth_date AS "birthDate", hire_date AS "hireDate", gender, status, avatar_url AS "avatarURL", created_at AS "createdAt", updated_at AS "updatedAt"`,
} as const;

export const PositionSchema = {
  table: "positions",
  columns: `id, name, description, level, created_at AS "createdAt", updated_at AS "updatedAt"`,
} as const;

export const TaskSchema = {
  table: "tasks",
  columns: `id, title, description, priority, status, progress, start_date AS "startDate", due_date AS "dueDate", assigned_by AS "assignedBy", created_by AS "createdBy", updated_by AS "updatedBy", completed_by AS "completedBy", estimated_hours AS "estimatedHours", actual_hours AS "actualHours", completed_at AS "completedAt", created_at AS "createdAt", updated_at AS "updatedAt"`,
} as const;

export const UserSchema = {
  table: "users",
  columns: `id, employee_id AS "employeeId", username, password, role, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
} as const;

export const TaskCommentSchema = {
  table: "task_comments",
  columns: `id, task_id AS "taskId", employee_id AS "employeeId", content, attachments, created_at AS "createdAt", updated_at AS "updatedAt"`,
} as const;

export const TaskDepartmentSchema = {
  table: "task_departments",
  columns: `task_id AS "taskId", department_id AS "departmentId", assigned_at AS "assignedAt"`,
} as const;

export const TaskEmployeeSchema = {
  table: "task_employees",
  columns: `id, task_id AS "taskId", employee_id AS "employeeId", role, assigned_at AS "assignedAt"`,
} as const;

export const TaskLogSchema = {
  table: "task_logs",
  columns: `id, task_id AS "taskId", employee_id AS "employeeId", action, description, created_at AS "createdAt"`,
} as const;

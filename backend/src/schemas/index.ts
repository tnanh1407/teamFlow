export const DepartmentSchema = {
  table: "departments",
  columns:
  `id,
  name,
  code,
  description,
  manager_id,
  is_active,
  created_at,
  updated_at`,
} as const;

export const PositionSchema = {
  table: "positions",
  columns: `
  id,
  name,
  description,
  level,
  is_active,
  created_at, updated_at`,
} as const;

export const UserSchema = {
  table: "users",
  columns: `id,
  department_id,
  position_id,
  employee_code,
  name,
  email,
  phone,
  birth_date,
  hire_date,
  gender,
  username,
  password,
  role,
  position,
  status,
  avatar_url,
  last_login,
  created_at,
  updated_at`,
} as const;

export const TaskSchema = {
  table: "tasks",
  columns: `id, title, description, priority, status, progress, start_date, due_date, assigned_by, created_by, completed_by, estimated_hours, actual_hours, completed_at, created_at, updated_at`,
} as const;

export const TaskCommentSchema = {
  table: "task_comments",
  columns: `id, task_id, employee_id, content, attachments, created_at, updated_at`,
} as const;

export const TaskDepartmentSchema = {
  table: "task_departments",
  columns: `task_id, department_id, assigned_at`,
} as const;

export const TaskEmployeeSchema = {
  table: "task_employees",
  columns: `id, task_id, employee_id, role, assigned_at`,
} as const;

export const TaskLogSchema = {
  table: "task_logs",
  columns: `id, task_id, employee_id, action, description, created_at`,
} as const;

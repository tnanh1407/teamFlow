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
  leave_date,
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

export const ProjectSchema = {
  table: "projects",
  columns: `id, title, description, avatar_url, priority, status, progress, start_date, due_date, assigned_by, created_by, estimated_hours, actual_hours, completed_at, created_at, updated_at`,
} as const;

export const ProjectCommentSchema = {
  table: "project_comments",
  columns: `id, project_id, employee_id, content, attachments, created_at, updated_at`,
} as const;

export const ProjectDepartmentSchema = {
  table: "project_departments",
  columns: `project_id, department_id, assigned_at`,
} as const;

export const ProjectEmployeeSchema = {
  table: "project_employees",
  columns: `id, project_id, employee_id, role, assigned_at`,
} as const;

export const ProjectLogSchema = {
  table: "project_logs",
  columns: `id, project_id, employee_id, action, description, created_at`,
} as const;

export const ProjectTaskSchema = {
  table: "project_tasks",
  columns: `id, project_id, title, description, status, priority, assigned_to, assigned_by, assigned_at, due_date, created_by, completed_at, created_at, updated_at`,
} as const;

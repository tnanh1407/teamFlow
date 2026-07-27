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

export const EmployeeSchema = {
  table: "employees",
  columns:
    `id,
  department_id,
  position_id,
  employee_code,
  name,
  email,
  phone,
  birth_date,
  hire_date,
  gender,
  status,
  avatar_url,
  username,
  password,
  role,
  position,
  account_status,
  created_at,
  updated_at,
  deleted_at`,
} as const;

export const PositionSchema = {
  table: "positions",
  columns: `
  id,
  name,
  description,
  level,
  created_at, updated_at`,
} as const;

export const ProjectSchema = {
  table: "projects",
  columns: `id, title, description, priority, status, progress, start_date, due_date, assigned_by, created_by, updated_by, completed_by, estimated_hours, actual_hours, attachments, completed_at, created_at, updated_at`,
} as const;

export const UserSchema = {
  table: "employees",
  columns:
    `id,
  id AS employee_id,
  username,
  password,
  role,
  position,
  account_status AS status,
  avatar_url,
  created_at,
  updated_at`,
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

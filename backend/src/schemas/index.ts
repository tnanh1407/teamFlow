export const DepartmentSchema = {
  table: "departments",
  columns: 
  `id,
  name,
  code,
  description,
  managerId,
  isActive,
  createdAt, 
  updatedAt`,
} as const;

export const EmployeeSchema = {
  table: "employees",
  columns: 
  `id, 
  departmentId,
  positionId,
  employeeCode,
  name,
  email,
  phone,
  birthDate,
  hireDate,
  gender, 
  status, 
  avatarURL,
  createdAt,
  updatedAt,
  deletedAt`,
} as const;

export const PositionSchema = {
  table: "positions",
  columns: `
  id,
  name,
  description, 
  level, 
  createdAt, updatedAt`,
} as const;

export const ProjectSchema = {
  table: "projects",
  columns: `id, title, description, priority, status, progress, startDate, dueDate, assignedBy, createdBy, updatedBy, completedBy, estimatedHours, actualHours, completedAt, createdAt, updatedAt`,
} as const;

export const UserSchema = {
  table: "users",
  columns: 
  `id, 
  employeeId,
  username, 
  password,
  role,
  status,
  createdAt,
  updatedAt`,
} as const;

export const ProjectCommentSchema = {
  table: "project_comments",
  columns: `id, projectId, employeeId, content, attachments, createdAt, updatedAt`,
} as const;

export const ProjectDepartmentSchema = {
  table: "project_departments",
  columns: `projectId, departmentId, assignedAt`,
} as const;

export const ProjectEmployeeSchema = {
  table: "project_employees",
  columns: `id, projectId, employeeId, role, assignedAt`,
} as const;

export const ProjectLogSchema = {
  table: "project_logs",
  columns: `id, projectId, employeeId, action, description, createdAt`,
} as const;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL,
  position_id UUID NOT NULL,
  employee_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT UNIQUE,
  birth_date DATE,
  hire_date DATE,
  gender TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  position TEXT NOT NULL DEFAULT 'member',
  account_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'todo',
  progress INT NOT NULL DEFAULT 0,
  start_date DATE,
  due_date DATE,
  assigned_by UUID,
  created_by UUID NOT NULL,
  updated_by UUID,
  completed_by UUID,
  estimated_hours INT,
  actual_hours INT,
  attachments TEXT DEFAULT '[]',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  content TEXT,
  attachments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_departments (
  project_id UUID NOT NULL,
  department_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, department_id)
);

CREATE TABLE IF NOT EXISTS project_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  action TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Foreign keys
ALTER TABLE employees ADD CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE employees ADD CONSTRAINT fk_employees_position FOREIGN KEY (position_id) REFERENCES positions(id);

ALTER TABLE departments ADD CONSTRAINT fk_departments_manager FOREIGN KEY (manager_id) REFERENCES employees(id);

ALTER TABLE projects ADD CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by) REFERENCES employees(id);
ALTER TABLE projects ADD CONSTRAINT fk_projects_updated_by FOREIGN KEY (updated_by) REFERENCES employees(id);
ALTER TABLE projects ADD CONSTRAINT fk_projects_assigned_by FOREIGN KEY (assigned_by) REFERENCES employees(id);
ALTER TABLE projects ADD CONSTRAINT fk_projects_completed_by FOREIGN KEY (completed_by) REFERENCES employees(id);

ALTER TABLE project_employees ADD CONSTRAINT fk_project_employees_project FOREIGN KEY (project_id) REFERENCES projects(id);
ALTER TABLE project_employees ADD CONSTRAINT fk_project_employees_employee FOREIGN KEY (employee_id) REFERENCES employees(id);

ALTER TABLE project_comments ADD CONSTRAINT fk_project_comments_project FOREIGN KEY (project_id) REFERENCES projects(id);
ALTER TABLE project_comments ADD CONSTRAINT fk_project_comments_employee FOREIGN KEY (employee_id) REFERENCES employees(id);

ALTER TABLE project_departments ADD CONSTRAINT fk_project_departments_project FOREIGN KEY (project_id) REFERENCES projects(id);
ALTER TABLE project_departments ADD CONSTRAINT fk_project_departments_department FOREIGN KEY (department_id) REFERENCES departments(id);

ALTER TABLE project_logs ADD CONSTRAINT fk_project_logs_project FOREIGN KEY (project_id) REFERENCES projects(id);
ALTER TABLE project_logs ADD CONSTRAINT fk_project_logs_employee FOREIGN KEY (employee_id) REFERENCES employees(id);

-- Add attachments column for existing databases
ALTER TABLE projects ADD COLUMN IF NOT EXISTS attachments TEXT DEFAULT '[]';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_username ON employees(username);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_project_employees_project ON project_employees(project_id);
CREATE INDEX IF NOT EXISTS idx_project_employees_employee ON project_employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_logs_project ON project_logs(project_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_project_comments_updated_at
  BEFORE UPDATE ON project_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

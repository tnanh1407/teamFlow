CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ══════════════════════════════════════════════════════════
-- ENUMS
-- ══════════════════════════════════════════════════════════

CREATE TYPE EUserRole AS ENUM ('user', 'admin');
CREATE TYPE Eposition AS ENUM ('member', 'manager');
CREATE TYPE ETaskStatus AS ENUM ('todo', 'in_progress', 'review', 'completed', 'cancelled');
CREATE TYPE ENotificationType AS ENUM ('task', 'comment', 'system');
CREATE TYPE EPriority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE EGender AS ENUM ('male', 'female', 'other');
CREATE TYPE ETaskRole AS ENUM ('leader', 'member', 'reviewer');
CREATE TYPE ELevel AS ENUM ('Intern', 'Junior', 'Middle', 'Senior', 'Leader', 'Manager');
CREATE TYPE ETaskAction AS ENUM ('created', 'updated', 'assigned', 'commented', 'completed', 'cancelled');

-- ══════════════════════════════════════════════════════════
-- TABLES
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  manager_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR UNIQUE NOT NULL,
  description TEXT,
  level ELevel DEFAULT 'Intern',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL,
  position_id UUID NOT NULL,
  employee_code VARCHAR UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR UNIQUE,
  birth_date DATE,
  hire_date DATE,
  gender EGender DEFAULT 'other',
  username VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role EUserRole DEFAULT 'user' NOT NULL,
  position Eposition DEFAULT 'member',
  status BOOLEAN NOT NULL DEFAULT true,
  avatar_url VARCHAR,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ck_users_position CHECK (
    (role = 'admin' AND position IS NULL) OR
    (role = 'user' AND position IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  priority EPriority DEFAULT 'medium',
  status ETaskStatus DEFAULT 'todo',
  progress INT DEFAULT 0,
  start_date DATE,
  due_date DATE,
  assigned_by UUID,
  created_by UUID NOT NULL,
  completed_by UUID,
  estimated_hours INT,
  actual_hours INT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  role ETaskRole DEFAULT 'member',
  assigned_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  content TEXT,
  attachments TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_departments (
  task_id UUID NOT NULL,
  department_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (task_id, department_id)
);

CREATE TABLE IF NOT EXISTS task_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  action ETaskAction,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_position ON users(position_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_task_employees_task ON task_employees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_employees_employee ON task_employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_task ON task_logs(task_id);

-- ══════════════════════════════════════════════════════════
-- FOREIGN KEYS
-- ══════════════════════════════════════════════════════════

ALTER TABLE users ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE users ADD CONSTRAINT fk_users_position FOREIGN KEY (position_id) REFERENCES positions(id);
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager FOREIGN KEY (manager_id) REFERENCES users(id);
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id);
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_completed_by FOREIGN KEY (completed_by) REFERENCES users(id);
ALTER TABLE task_employees ADD CONSTRAINT fk_task_employees_task FOREIGN KEY (task_id) REFERENCES tasks(id);
ALTER TABLE task_employees ADD CONSTRAINT fk_task_employees_employee FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE task_comments ADD CONSTRAINT fk_task_comments_task FOREIGN KEY (task_id) REFERENCES tasks(id);
ALTER TABLE task_comments ADD CONSTRAINT fk_task_comments_employee FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE task_departments ADD CONSTRAINT fk_task_departments_task FOREIGN KEY (task_id) REFERENCES tasks(id);
ALTER TABLE task_departments ADD CONSTRAINT fk_task_departments_department FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE task_logs ADD CONSTRAINT fk_task_logs_task FOREIGN KEY (task_id) REFERENCES tasks(id);
ALTER TABLE task_logs ADD CONSTRAINT fk_task_logs_employee FOREIGN KEY (employee_id) REFERENCES users(id);

-- ══════════════════════════════════════════════════════════
-- TRIGGERS (auto-update updated_at)
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_departments_updated_at
  BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_positions_updated_at
  BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_task_comments_updated_at
  BEFORE UPDATE ON task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

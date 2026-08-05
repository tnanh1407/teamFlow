CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ══════════════════════════════════════════════════════════
-- ENUMS
-- ══════════════════════════════════════════════════════════

CREATE TYPE EUserRole AS ENUM ('user', 'admin');
CREATE TYPE Eposition AS ENUM ('member', 'manager', 'staff', 'intern');
CREATE TYPE EProjectStatus AS ENUM ('todo', 'in_progress', 'review', 'completed', 'cancelled');
CREATE TYPE ENotificationType AS ENUM ('announcement', 'reminder', 'update');
CREATE TYPE ESystemNotificationSource AS ENUM ('admin', 'system');
CREATE TYPE ESystemNotificationAudience AS ENUM ('all', 'user', 'manager', 'staff', 'intern', 'admin');
CREATE TYPE EPriority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE EGender AS ENUM ('male', 'female', 'other');
CREATE TYPE EProjectRole AS ENUM ('leader', 'member', 'reviewer');
CREATE TYPE ELevel AS ENUM ('Intern', 'Junior', 'Middle', 'Senior', 'Leader', 'Manager');
CREATE TYPE EProjectAction AS ENUM ('created', 'updated', 'assigned', 'commented', 'completed', 'cancelled');
CREATE TYPE EProjectTaskStatus AS ENUM ('todo', 'in_progress', 'review', 'completed', 'cancelled');

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
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID,
  position_id UUID,
  employee_code VARCHAR UNIQUE,
  name TEXT NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR UNIQUE,
  birth_date DATE,
  hire_date DATE,
  leave_date DATE,
  gender EGender DEFAULT 'other',
  username VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role EUserRole DEFAULT 'user' NOT NULL,
  status BOOLEAN NOT NULL DEFAULT true,
  avatar_url VARCHAR,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users
  ADD CONSTRAINT ck_users_admin_assignment
  CHECK (
    (role = 'admin' AND department_id IS NULL AND position_id IS NULL)
    OR
    (role <> 'admin' AND department_id IS NOT NULL AND position_id IS NOT NULL)
  );

ALTER TABLE users
  ADD CONSTRAINT ck_users_employee_code_role
  CHECK (
    (role = 'admin' AND employee_code IS NULL)
    OR
    (role <> 'admin' AND employee_code IS NOT NULL AND length(trim(employee_code)) > 0)
  );

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  avatar_url VARCHAR,
  priority EPriority DEFAULT 'medium',
  status EProjectStatus DEFAULT 'todo',
  progress INT DEFAULT 0,
  start_date DATE,
  due_date DATE,
  assigned_by UUID,
  created_by UUID NOT NULL,
  estimated_hours INT,
  actual_hours INT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  role EProjectRole DEFAULT 'member',
  assigned_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  content TEXT,
  attachments TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_departments (
  project_id UUID NOT NULL,
  department_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (project_id, department_id)
);

CREATE TABLE IF NOT EXISTS project_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  action EProjectAction,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  status EProjectTaskStatus DEFAULT 'todo',
  priority EPriority DEFAULT 'medium',
  assigned_to UUID,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ,
  due_date DATE,
  created_by UUID NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  created_by UUID NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  type ENotificationType DEFAULT 'announcement',
  priority EPriority DEFAULT 'medium',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID,
  source ESystemNotificationSource DEFAULT 'admin',
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  type ENotificationType DEFAULT 'announcement',
  priority EPriority DEFAULT 'medium',
  target_audience ESystemNotificationAudience DEFAULT 'all',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  jti VARCHAR UNIQUE NOT NULL,
  user_agent TEXT,
  ip VARCHAR,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email VARCHAR NOT NULL,
  code VARCHAR NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_jti ON sessions(jti);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_position ON users(position_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_project_employees_project ON project_employees(project_id);
CREATE INDEX IF NOT EXISTS idx_project_employees_employee ON project_employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_logs_project ON project_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_notifications_project ON project_notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notifications_created_by ON project_notifications(created_by);
CREATE INDEX IF NOT EXISTS idx_project_notifications_created_at ON project_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_system_notifications_target_audience ON system_notifications(target_audience);
CREATE INDEX IF NOT EXISTS idx_system_notifications_source ON system_notifications(source);
CREATE INDEX IF NOT EXISTS idx_system_notifications_created_by ON system_notifications(created_by);
CREATE INDEX IF NOT EXISTS idx_system_notifications_created_at ON system_notifications(created_at);

-- ══════════════════════════════════════════════════════════
-- FOREIGN KEYS
-- ══════════════════════════════════════════════════════════

ALTER TABLE users ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE users ADD CONSTRAINT fk_users_position FOREIGN KEY (position_id) REFERENCES positions(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS leave_date DATE;
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager FOREIGN KEY (manager_id) REFERENCES users(id);
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE password_resets ADD CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE projects ADD CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE projects ADD CONSTRAINT fk_projects_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id);
ALTER TABLE project_employees ADD CONSTRAINT fk_project_employees_project FOREIGN KEY (project_id) REFERENCES projects(id);
ALTER TABLE project_employees ADD CONSTRAINT fk_project_employees_employee FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE project_comments ADD CONSTRAINT fk_project_comments_project FOREIGN KEY (project_id) REFERENCES projects(id);
ALTER TABLE project_comments ADD CONSTRAINT fk_project_comments_employee FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE project_departments ADD CONSTRAINT fk_project_departments_project FOREIGN KEY (project_id) REFERENCES projects(id);
ALTER TABLE project_departments ADD CONSTRAINT fk_project_departments_department FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE project_logs ADD CONSTRAINT fk_project_logs_project FOREIGN KEY (project_id) REFERENCES projects(id);
ALTER TABLE project_logs ADD CONSTRAINT fk_project_logs_employee FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE project_tasks ADD CONSTRAINT fk_project_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE project_tasks ADD CONSTRAINT fk_project_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id);
ALTER TABLE project_tasks ADD CONSTRAINT fk_project_tasks_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id);
ALTER TABLE project_tasks ADD CONSTRAINT fk_project_tasks_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE project_notifications ADD CONSTRAINT fk_project_notifications_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE project_notifications ADD CONSTRAINT fk_project_notifications_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE system_notifications ADD CONSTRAINT fk_system_notifications_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ══════════════════════════════════════════════════════════
-- TRIGGERS (auto-update updated_at)
-- ══════════════════════════════════════════════════════════

-- Project tables cannot reference admin users
CREATE OR REPLACE FUNCTION ensure_user_is_not_admin(p_user_id UUID, p_error_message TEXT)
RETURNS VOID AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM users
    WHERE id = p_user_id
      AND role = 'admin'
  ) THEN
    RAISE EXCEPTION '%', p_error_message USING ERRCODE = '23514';
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_projects_reject_admin_refs()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ensure_user_is_not_admin(NEW.created_by, 'Projects cannot reference admin users');
  PERFORM ensure_user_is_not_admin(NEW.assigned_by, 'Projects cannot reference admin users');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_project_employees_reject_admin_refs()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ensure_user_is_not_admin(NEW.employee_id, 'Project employees cannot reference admin users');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_project_comments_reject_admin_refs()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ensure_user_is_not_admin(NEW.employee_id, 'Project comments cannot reference admin users');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_project_logs_reject_admin_refs()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ensure_user_is_not_admin(NEW.employee_id, 'Project logs cannot reference admin users');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_project_tasks_reject_admin_refs()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ensure_user_is_not_admin(NEW.assigned_to, 'Project tasks cannot reference admin users');
  PERFORM ensure_user_is_not_admin(NEW.assigned_by, 'Project tasks cannot reference admin users');
  PERFORM ensure_user_is_not_admin(NEW.created_by, 'Project tasks cannot reference admin users');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_project_notifications_reject_admin_refs()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ensure_user_is_not_admin(NEW.created_by, 'Project notifications cannot reference admin users');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
CREATE OR REPLACE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_project_comments_updated_at
  BEFORE UPDATE ON project_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_project_tasks_updated_at
  BEFORE UPDATE ON project_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_project_notifications_updated_at
  BEFORE UPDATE ON project_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_projects_reject_admin_refs
  BEFORE INSERT OR UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION trg_projects_reject_admin_refs();
CREATE OR REPLACE TRIGGER trg_project_employees_reject_admin_refs
  BEFORE INSERT OR UPDATE ON project_employees FOR EACH ROW EXECUTE FUNCTION trg_project_employees_reject_admin_refs();
CREATE OR REPLACE TRIGGER trg_project_comments_reject_admin_refs
  BEFORE INSERT OR UPDATE ON project_comments FOR EACH ROW EXECUTE FUNCTION trg_project_comments_reject_admin_refs();
CREATE OR REPLACE TRIGGER trg_project_logs_reject_admin_refs
  BEFORE INSERT OR UPDATE ON project_logs FOR EACH ROW EXECUTE FUNCTION trg_project_logs_reject_admin_refs();
CREATE OR REPLACE TRIGGER trg_project_tasks_reject_admin_refs
  BEFORE INSERT OR UPDATE ON project_tasks FOR EACH ROW EXECUTE FUNCTION trg_project_tasks_reject_admin_refs();
CREATE OR REPLACE TRIGGER trg_project_notifications_reject_admin_refs
  BEFORE INSERT OR UPDATE ON project_notifications FOR EACH ROW EXECUTE FUNCTION trg_project_notifications_reject_admin_refs();

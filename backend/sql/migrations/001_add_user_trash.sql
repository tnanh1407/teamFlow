ALTER TABLE users
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID,
  ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at);

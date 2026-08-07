import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pool from "./config/database.js";
import env from "./config/env.js";
import userRouter from "./user/user.router.js";
import departmentRouter from "./department/department.router.js";
import positionRouter from "./position/position.router.js";
import projectRouter from "./project/core/project.router.js";
import projectEmployeeRouter from "./project/employee/project-employee.router.js";
import projectCommentRouter from "./project/comment/project-comment.router.js";
import projectDepartmentRouter from "./project/department/project-department.router.js";
import projectLogRouter from "./project/log/project-log.router.js";
import projectNotificationRouter from "./project/notification/project-notification.router.js";
import projectTaskRouter from "./project/task/project-task.router.js";
import systemNotificationRouter from "./notification/system-notification.router.js";
import sessionRouter from "./session/session.router.js";
import searchRouter from "./search/search.router.js";
import userService from "./user/user.service.js";
import { apiReference } from "@scalar/express-api-reference";
import { apiSpec } from "./docs-api/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
const PORT = env.PORT;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ message: "Hệ thống Quản Lý Phòng Ban & Dự Án API is running" });
});

app.use("/api/users", userRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/positions", positionRouter);
app.use("/api/projects", projectRouter);
app.use("/api/project", projectRouter);
app.use("/api/project-employees", projectEmployeeRouter);
app.use("/api/project-comments", projectCommentRouter);
app.use("/api/project-departments", projectDepartmentRouter);
app.use("/api/project-logs", projectLogRouter);
app.use("/api/project-notifications", projectNotificationRouter);
app.use("/api/project-tasks", projectTaskRouter);
app.use("/api/system-notifications", systemNotificationRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/search", searchRouter);

app.use("/api-docs", apiReference({
  spec: { content: apiSpec },
  theme: "purple",
}));

app.use(errorHandler);

const start = async () => {
  try {
    if (env.DATABASE_URL) {
      await pool.query(`
        ALTER TABLE users
          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
          ADD COLUMN IF NOT EXISTS deleted_by UUID,
          ADD COLUMN IF NOT EXISTS deletion_reason TEXT;
        CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at);
        CREATE TABLE IF NOT EXISTS password_reset_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          requested_at TIMESTAMPTZ DEFAULT now(),
          processed_at TIMESTAMPTZ,
          processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
          CONSTRAINT ck_password_reset_requests_status CHECK (status IN ('pending', 'approved', 'rejected'))
        );
        CREATE INDEX IF NOT EXISTS idx_password_reset_requests_status ON password_reset_requests(status, requested_at DESC);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_password_reset_requests_pending_user
          ON password_reset_requests(user_id) WHERE status = 'pending';
      `);
    }
    await pool.query("SELECT 1");
    console.log("Database connected");
    void userService.purgeExpiredTrash().catch((error: unknown) => {
      console.error("Trash cleanup failed:", error);
    });
    setInterval(() => {
      void userService.purgeExpiredTrash().catch((error: unknown) => {
        console.error("Trash cleanup failed:", error);
      });
    }, 24 * 60 * 60 * 1000);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

start();

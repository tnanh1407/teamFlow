import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
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
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = env.PORT;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (_req, res) => {
  res.json({ message: "TeamFlow API is running" });
});

app.use("/api/users", userRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/positions", positionRouter);
app.use("/api/tasks", projectRouter);
app.use("/api/task-employees", projectEmployeeRouter);
app.use("/api/task-comments", projectCommentRouter);
app.use("/api/task-departments", projectDepartmentRouter);
app.use("/api/task-logs", projectLogRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: "TeamFlow API Docs",
}));

app.use(errorHandler);

const start = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

start();

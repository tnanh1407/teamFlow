import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import pool from "./config/database.js";
import env from "./config/env.js";
import userRouter from "./routers/user.router.js";
import departmentRouter from "./routers/department.router.js";
import employeeRouter from "./routers/employee.router.js";
import positionRouter from "./routers/position.router.js";
import projectRouter from "./routers/project.router.js";
import projectEmployeeRouter from "./routers/project-employee.router.js";
import projectCommentRouter from "./routers/project-comment.router.js";
import projectDepartmentRouter from "./routers/project-department.router.js";
import projectLogRouter from "./routers/project-log.router.js";
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
app.use("/api/employees", employeeRouter);
app.use("/api/positions", positionRouter);
app.use("/api/projects", projectRouter);
app.use("/api/project-employees", projectEmployeeRouter);
app.use("/api/project-comments", projectCommentRouter);
app.use("/api/project-departments", projectDepartmentRouter);
app.use("/api/project-logs", projectLogRouter);
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

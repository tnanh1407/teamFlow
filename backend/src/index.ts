import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pool from "./config/database.js";
import env from "./config/env.js";
import userRouter from "./routers/user.router.js";
import departmentRouter from "./routers/department.router.js";
import employeeRouter from "./routers/employee.router.js";
import positionRouter from "./routers/position.router.js";
import taskRouter from "./routers/task.router.js";
import taskEmployeeRouter from "./routers/task-employee.router.js";
import taskCommentRouter from "./routers/task-comment.router.js";
import taskDepartmentRouter from "./routers/task-department.router.js";
import taskLogRouter from "./routers/task-log.router.js";
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
  res.json({ message: "TeamFlow API is running" });
});

app.use("/api/users", userRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/positions", positionRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/task-employees", taskEmployeeRouter);
app.use("/api/task-comments", taskCommentRouter);
app.use("/api/task-departments", taskDepartmentRouter);
app.use("/api/task-logs", taskLogRouter);
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

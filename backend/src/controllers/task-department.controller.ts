import { Request, Response } from "express";
import taskDepartmentService from "../services/task-department.service.js";
import { AppError } from "../utils/errors/app-error.js";

class TaskDepartmentController {
  async getAll(_req: Request, res: Response) {
    const assignments = await taskDepartmentService.findAll();
    res.json({ data: assignments });
  }

  async getByTask(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    const assignments = await taskDepartmentService.findByTask(taskId);
    res.json({ data: assignments });
  }

  async getByDepartment(req: Request, res: Response) {
    const departmentId = req.params.departmentId as string;
    const assignments = await taskDepartmentService.findByDepartment(departmentId);
    res.json({ data: assignments });
  }

  async create(req: Request, res: Response) {
    const assignment = await taskDepartmentService.create(req.body);
    res.status(201).json({ data: assignment });
  }

  async delete(req: Request, res: Response) {
    const { taskId, departmentId } = req.params;
    const assignment = await taskDepartmentService.delete(taskId, departmentId);
    if (!assignment) throw new AppError("Assignment not found", 404);
    res.json({ message: "Assignment deleted successfully" });
  }
}

export default new TaskDepartmentController();

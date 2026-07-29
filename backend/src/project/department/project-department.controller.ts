import { Request, Response } from "express";
import projectDepartmentService from "./project-department.service.js";
import { AppError } from "../../utils/errors/app-error.js";

class ProjectDepartmentController {
  async getAll(_req: Request, res: Response) {
    const assignments = await projectDepartmentService.findAll();
    res.json({ data: assignments });
  }

  async getByTask(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    const assignments = await projectDepartmentService.findByTask(taskId);
    res.json({ data: assignments });
  }

  async getByDepartment(req: Request, res: Response) {
    const departmentId = req.params.departmentId as string;
    const assignments = await projectDepartmentService.findByDepartment(departmentId);
    res.json({ data: assignments });
  }

  async create(req: Request, res: Response) {
    const assignment = await projectDepartmentService.create(req.body);
    res.status(201).json({ data: assignment });
  }

  async delete(req: Request, res: Response) {
    const { taskId, departmentId } = req.params as { taskId: string; departmentId: string };

    const assignment = await projectDepartmentService.delete(taskId, departmentId);
    if (!assignment) throw new AppError("Assignment not found", 404);
    res.json({ message: "Assignment deleted successfully" });
  }
}

export default new ProjectDepartmentController();

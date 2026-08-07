import { Request, Response } from "express";
import projectTaskService from "./project-task.service.js";
import { AppError } from "../../utils/errors/app-error.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { EAccountPosition, EAccountRole } from "../../enums/account-role.enum.js";

class ProjectTaskController {
  async getAll(_req: Request, res: Response) {
    const tasks = await projectTaskService.findAll();
    res.json({ data: tasks });
  }

  async getByProject(req: Request, res: Response) {
    const projectId = req.params.projectId as string;
    const tasks = await projectTaskService.findAllByProject(projectId, {
      status: req.query.status as string | undefined,
      assignedTo: req.query.assignedTo as string | undefined,
      q: req.query.q as string | undefined,
    });
    res.json({ data: tasks });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const task = await projectTaskService.findById(id);
    if (!task) throw new AppError("Task not found", 404);
    res.json({ data: task });
  }

  async getByEmployee(req: Request, res: Response) {
    const employeeId = req.params.id as string;
    const tasks = await projectTaskService.findByEmployee(employeeId);
    res.json({ data: tasks });
  }

  async create(req: AuthRequest, res: Response) {
    const task = await projectTaskService.create({
      ...req.body,
      assignedBy: req.user!.id,
      createdBy: req.user!.id,
    });
    res.status(201).json({ data: task });
  }

  async update(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const existing = await projectTaskService.findById(id);
    if (!existing) throw new AppError("Task not found", 404);

    const user = req.user!;
    const isManager = user.role !== EAccountRole.ADMIN && user.position === EAccountPosition.MANAGER;
    if (!isManager && existing.assignedTo !== user.id) {
      throw new AppError("Insufficient permissions", 403);
    }

    const task = await projectTaskService.update(id, req.body);
    res.json({ message: "Task updated successfully", data: task });
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    await projectTaskService.delete(id);
    res.json({ message: "Task deleted successfully" });
  }
}

export default new ProjectTaskController();

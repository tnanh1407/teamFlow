import { Request, Response } from "express";
import taskService from "../services/task.service.js";
import { AppError } from "../utils/errors/app-error.js";

class TaskController {
  async getAll(_req: Request, res: Response) {
    const tasks = await taskService.findAll();
    res.json({ data: tasks });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const task = await taskService.findById(id);
    if (!task) throw new AppError("Task not found", 404);
    res.json({ data: task });
  }

  async getByStatus(req: Request, res: Response) {
    const status = req.params.status as string;
    const tasks = await taskService.findByStatus(status);
    res.json({ data: tasks });
  }

  async getByPriority(req: Request, res: Response) {
    const priority = req.params.priority as string;
    const tasks = await taskService.findByPriority(priority);
    res.json({ data: tasks });
  }

  async getByCreatedBy(req: Request, res: Response) {
    const employeeId = req.params.employeeId as string;
    const tasks = await taskService.findByCreatedBy(employeeId);
    res.json({ data: tasks });
  }

  async create(req: Request, res: Response) {
    const task = await taskService.create(req.body);
    res.status(201).json({ data: task });
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const task = await taskService.update(id, req.body);
    if (!task) throw new AppError("Task not found", 404);
    res.json({ data: task });
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const task = await taskService.delete(id);
    if (!task) throw new AppError("Task not found", 404);
    res.json({ message: "Task deleted successfully" });
  }
}

export default new TaskController();

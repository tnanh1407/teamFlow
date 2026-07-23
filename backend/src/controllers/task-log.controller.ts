import { Request, Response } from "express";
import taskLogService from "../services/task-log.service.js";
import { AppError } from "../utils/errors/app-error.js";

class TaskLogController {
  async getAll(_req: Request, res: Response) {
    const logs = await taskLogService.findAll();
    res.json({ data: logs });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const log = await taskLogService.findById(id);
    if (!log) throw new AppError("Log not found", 404);
    res.json({ data: log });
  }

  async getByTask(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    const logs = await taskLogService.findByTask(taskId);
    res.json({ data: logs });
  }

  async getByEmployee(req: Request, res: Response) {
    const employeeId = req.params.employeeId as string;
    const logs = await taskLogService.findByEmployee(employeeId);
    res.json({ data: logs });
  }

  async create(req: Request, res: Response) {
    const log = await taskLogService.create(req.body);
    res.status(201).json({ data: log });
  }
}

export default new TaskLogController();

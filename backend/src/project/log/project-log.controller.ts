import { Request, Response } from "express";
import projectLogService from "./project-log.service.js";
import { AppError } from "../../utils/errors/app-error.js";

class ProjectLogController {
  async getAll(_req: Request, res: Response) {
    const logs = await projectLogService.findAll();
    res.json({ data: logs });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const log = await projectLogService.findById(id);
    if (!log) throw new AppError("Log not found", 404);
    res.json({ data: log });
  }

  async getByTask(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    const logs = await projectLogService.findByTask(taskId);
    res.json({ data: logs });
  }

  async getByEmployee(req: Request, res: Response) {
    const employeeId = req.params.employeeId as string;
    const logs = await projectLogService.findByEmployee(employeeId);
    res.json({ data: logs });
  }

  async create(req: Request, res: Response) {
    const log = await projectLogService.create(req.body);
    res.status(201).json({ data: log });
  }
}

export default new ProjectLogController();

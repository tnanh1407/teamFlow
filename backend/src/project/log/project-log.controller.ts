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

  async getByProject(req: Request, res: Response) {
    const projectId = req.params.projectId as string;
    const logs = await projectLogService.findByProject(projectId);
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

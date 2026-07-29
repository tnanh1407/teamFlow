import { Request, Response } from "express";
import projectService from "./project.service.js";
import accountService from "../../account/account.service.js";
import { AppError } from "../../utils/errors/app-error.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

class ProjectController {
  async getAll(_req: Request, res: Response) {
    const projects = await projectService.findAll();
    res.json({ data: projects });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const project = await projectService.findById(id);
    if (!project) throw new AppError("Project not found", 404);
    res.json({ data: project });
  }

  async getByStatus(req: Request, res: Response) {
    const status = req.params.status as string;
    const projects = await projectService.findByStatus(status);
    res.json({ data: projects });
  }

  async getByPriority(req: Request, res: Response) {
    const priority = req.params.priority as string;
    const projects = await projectService.findByPriority(priority);
    res.json({ data: projects });
  }

  async getByCreatedBy(req: Request, res: Response) {
    const employeeId = req.params.employeeId as string;
    const projects = await projectService.findByCreatedBy(employeeId);
    res.json({ data: projects });
  }

  async getMyProjects(req: AuthRequest, res: Response) {
    const user = await accountService.findById(req.user!.id);
    if (!user) throw new AppError("Account not found", 404);
    if (!user.employeeId) throw new AppError("Account has no linked employee", 400);
    const projects = await projectService.findByEmployeeId(user.employeeId);
    res.json({ data: projects });
  }

  async create(req: Request, res: Response) {
    const project = await projectService.create(req.body);
    res.status(201).json({ data: project });
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const project = await projectService.update(id, req.body);
    if (!project) throw new AppError("Project not found", 404);
    res.json({ data: project });
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const project = await projectService.delete(id);
    if (!project) throw new AppError("Project not found", 404);
    res.json({ message: "Project deleted successfully" });
  }
}

export default new ProjectController();

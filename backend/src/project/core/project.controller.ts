import { Request, Response } from "express";
import projectService from "./project.service.js";
import userService from "../../user/user.service.js";
import { AppError } from "../../utils/errors/app-error.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { EAccountRole } from "@/enums/account-role.enum.js";
import { uploadToCloudinary, deleteCloudinaryFile } from "../../utils/upload/cloudinary.js";

class ProjectController {
  async getAll(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const result = await projectService.findAll(page, limit);
    res.json(result);
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      throw new AppError("Invalid project id", 400);
    }
    const project = await projectService.findById(id);
    if (!project) throw new AppError("Project not found", 404);
    res.json({ data: project });
  }

  async getEmployeesByProject(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      throw new AppError("Invalid project id", 400);
    }
    const project = await projectService.findById(id);
    if (!project) throw new AppError("Project not found", 404);
    const employees = await projectService.findEmployeesByProject(id);
    res.json({ data: employees });
  }

  async getByStatus(req: AuthRequest, res: Response) {
    const user = req.user!;
    const status = req.params.status as string;
    if (user.role === EAccountRole.ADMIN) {
      const projects = await projectService.findByStatus(status);
      return res.json({ data: projects })
    }
    const projects = await projectService.findByStatusForUser(status, user.id);
    res.json({ data: projects });
  }

  async getByPriority(req: AuthRequest, res: Response) {
    const user = req.user!;
    const priority = req.params.priority as string;
    if (user.role === EAccountRole.ADMIN) {
      const projects = await projectService.findByPriority(priority);
      return res.json({ data: projects });
    }
    const projects = await projectService.findByPriorityForUser(priority, user.id);
    res.json({ data: projects });
  }

  async getByCreatedBy(req: Request, res: Response) {
    const employeeId = req.params.employeeId as string;
    const projects = await projectService.findByCreatedBy(employeeId);
    res.json({ data: projects });
  }

  async getMyProjects(req: AuthRequest, res: Response) {
    const user = await userService.findById(req.user!.id);
    if (!user) throw new AppError("User not found", 404);
    const projects = await projectService.findByEmployeeId(user.id);
    res.json({ data: projects });
  }

  async create(req: AuthRequest, res: Response) {
    const payload = { ...req.body, createdBy: req.user!.id };
    const project = await projectService.create(payload);
    res.status(201).json({ data: project });
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const project = await projectService.update(id, req.body);
    res.json({ message: "Project updated successfully", data: project });
  }

  async updateAvatar(req: Request, res: Response) {
    const id = req.params.id as string;
    const project = await projectService.findById(id);
    if (!project) throw new AppError("Project not found", 404);

    if (!req.file) throw new AppError("No file uploaded", 400);

    if (project.avatarURL) {
      await deleteCloudinaryFile(project.avatarURL);
    }

    const avatarURL = await uploadToCloudinary(req.file, "project-avatars");
    await projectService.updateAvatar(id, avatarURL!);
    res.json({ message: "Project avatar updated successfully" });
  }

  async removeAvatar(req: Request, res: Response) {
    const id = req.params.id as string;
    const project = await projectService.findById(id);
    if (!project) throw new AppError("Project not found", 404);

    if (project.avatarURL) {
      await deleteCloudinaryFile(project.avatarURL);
    }

    await projectService.removeAvatar(id);
    res.json({ message: "Project avatar removed successfully" });
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    await projectService.delete(id);
    res.json({ message: "Project deleted successfully" });
  }
}

export default new ProjectController();

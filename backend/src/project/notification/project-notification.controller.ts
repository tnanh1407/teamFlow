import { Request, Response } from "express";
import { AppError } from "../../utils/errors/app-error.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import projectNotificationService from "./project-notification.service.js";

class ProjectNotificationController {
  async getByProject(req: Request, res: Response) {
    const projectId = req.params.projectId as string;
    const notifications = await projectNotificationService.findAllByProject(projectId);
    res.json({ data: notifications });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const notification = await projectNotificationService.findById(id);
    if (!notification) throw new AppError("Notification not found", 404);
    res.json({ data: notification });
  }

  async create(req: AuthRequest, res: Response) {
    const notification = await projectNotificationService.create(req.body, req.user!.id);
    res.status(201).json({ data: notification });
  }

  async update(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const notification = await projectNotificationService.update(id, req.body, req.user!.id);
    res.json({ message: "Notification updated successfully", data: notification });
  }

  async delete(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    await projectNotificationService.delete(id, req.user!.id);
    res.json({ message: "Notification deleted successfully" });
  }
}

export default new ProjectNotificationController();


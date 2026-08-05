import { Request, Response } from "express";
import { AppError } from "../utils/errors/app-error.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import systemNotificationService from "./system-notification.service.js";

class SystemNotificationController {
  async getVisible(req: AuthRequest, res: Response) {
    const notifications = await systemNotificationService.findVisibleForUser(req.user!.id);
    res.json({ data: notifications });
  }

  async getAll(req: AuthRequest, res: Response) {
    const notifications = await systemNotificationService.findAllForUser(req.user!.id);
    res.json({ data: notifications });
  }

  async getById(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const notification = await systemNotificationService.findByIdForUser(id, req.user!.id);
    if (!notification) throw new AppError("Notification not found", 404);
    res.json({ data: notification });
  }

  async create(req: AuthRequest, res: Response) {
    const notification = await systemNotificationService.create(req.body, req.user!.id);
    res.status(201).json({ data: notification });
  }

  async update(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const notification = await systemNotificationService.update(id, req.body, req.user!.id);
    res.json({ message: "Notification updated successfully", data: notification });
  }

  async delete(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    await systemNotificationService.delete(id, req.user!.id);
    res.json({ message: "Notification deleted successfully" });
  }

  async markRead(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    await systemNotificationService.markAsRead(id, req.user!.id);
    res.json({ message: "Notification marked as read" });
  }

  async markUnread(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    await systemNotificationService.markAsUnread(id, req.user!.id);
    res.json({ message: "Notification marked as unread" });
  }
}

export default new SystemNotificationController();

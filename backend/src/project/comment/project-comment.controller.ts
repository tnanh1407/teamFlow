import { Request, Response } from "express";
import projectCommentService from "./project-comment.service.js";
import { AppError } from "../../utils/errors/app-error.js";

class ProjectCommentController {
  async getAll(_req: Request, res: Response) {
    const comments = await projectCommentService.findAll();
    res.json({ data: comments });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const comment = await projectCommentService.findById(id);
    if (!comment) throw new AppError("Comment not found", 404);
    res.json({ data: comment });
  }

  async getByProject(req: Request, res: Response) {
    const projectId = req.params.projectId as string;
    const comments = await projectCommentService.findByProject(projectId);
    res.json({ data: comments });
  }

  async getByEmployee(req: Request, res: Response) {
    const employeeId = req.params.employeeId as string;
    const comments = await projectCommentService.findByEmployee(employeeId);
    res.json({ data: comments });
  }

  async create(req: Request, res: Response) {
    const comment = await projectCommentService.create(req.body);
    res.status(201).json({ data: comment });
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const comment = await projectCommentService.update(id, req.body);
    if (!comment) throw new AppError("Comment not found", 404);
    res.json({ data: comment });
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const comment = await projectCommentService.delete(id);
    if (!comment) throw new AppError("Comment not found", 404);
    res.json({ message: "Comment deleted successfully" });
  }
}

export default new ProjectCommentController();

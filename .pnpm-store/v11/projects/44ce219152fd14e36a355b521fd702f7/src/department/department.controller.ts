import { Request, Response } from "express";
import departmentService from "./department.service.js";
import { AppError } from "../utils/errors/app-error.js";

class DepartmentController {
  async getAll(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const result = await departmentService.findAll(page, limit);
    res.json(result);
  }

  async getActiveOptions(_req: Request, res: Response) {
    res.json({ data: await departmentService.findActiveOptions() });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const department = await departmentService.findById(id);
    if (!department) throw new AppError("Department not found", 404);
    res.json({ data: department });
  }

  async getProjectsByDepartment(req: Request, res: Response) {
    const id = req.params.id as string;
    const department = await departmentService.findById(id);
    if (!department) throw new AppError("Department not found", 404);
    const projects = await departmentService.findProjectsByDepartment(id);
    res.json({ data: projects });
  }

  async create(req: Request, res: Response) {
    const department = await departmentService.create(req.body);
    res.status(201).json({ data: department });
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const department = await departmentService.update(id, req.body);
    res.json({ message: "Department updated successfully", data: department });
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    await departmentService.delete(id);
    res.json({ message: "Department deleted successfully" });
  }
}

export default new DepartmentController();

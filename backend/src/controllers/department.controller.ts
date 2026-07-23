import { Request, Response } from "express";
import departmentService from "../services/department.service.js";
import { AppError } from "../utils/errors/app-error.js";

class DepartmentController {
  async getAll(_req: Request, res: Response) {
    const departments = await departmentService.findAll();
    res.json({ data: departments });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const department = await departmentService.findById(id);
    if (!department) throw new AppError("Department not found", 404);
    res.json({ data: department });
  }

  async create(req: Request, res: Response) {
    const department = await departmentService.create(req.body);
    res.status(201).json({ data: department });
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const department = await departmentService.update(id, req.body);
    if (!department) throw new AppError("Department not found", 404);
    res.json({ data: department });
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const department = await departmentService.delete(id);
    if (!department) throw new AppError("Department not found", 404);
    res.json({ message: "Department deleted successfully" });
  }
}

export default new DepartmentController();

import { Request, Response } from "express";
import projectEmployeeService from "./project-employee.service.js";
import { AppError } from "../../utils/errors/app-error.js";

class ProjectEmployeeController {
  async getAll(_req: Request, res: Response) {
    const assignments = await projectEmployeeService.findAll();
    res.json({ data: assignments });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const assignment = await projectEmployeeService.findById(id);
    if (!assignment) throw new AppError("Assignment not found", 404);
    res.json({ data: assignment });
  }

  async getByEmployee(req: Request, res: Response) {
    const employeeId = req.params.employeeId as string;
    const assignments = await projectEmployeeService.findByEmployee(employeeId);
    res.json({ data: assignments });
  }

  async getByProject(req: Request, res: Response) {
    const projectId = req.params.projectId as string;
    const assignments = await projectEmployeeService.findByProject(projectId);
    res.json({ data: assignments });
  }

  async create(req: Request, res: Response) {
    const assignment = await projectEmployeeService.create(req.body);
    res.status(201).json({ data: assignment });
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const assignment = await projectEmployeeService.update(id, req.body.role);
    res.json({ message: "Assignment updated successfully", data: assignment });
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    await projectEmployeeService.delete(id);
    res.json({ message: "Assignment deleted successfully" });
  }
}

export default new ProjectEmployeeController();

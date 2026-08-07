import { Request, Response } from "express";
import projectDepartmentService from "./project-department.service.js";

class ProjectDepartmentController {
  async getAll(_req: Request, res: Response) {
    const assignments = await projectDepartmentService.findAll();
    res.json({ data: assignments });
  }

  async getByProject(req: Request, res: Response) {
   const projectId = req.params.projectId as string;
    const assignments = await projectDepartmentService.findByProject(projectId);
    res.json({ data: assignments });
  }

  async create(req: Request, res: Response) {
    const assignment = await projectDepartmentService.create(req.body);
    res.status(201).json({ data: assignment });
  }

  async delete(req: Request, res: Response) {
    const { projectId, departmentId } = req.body as { projectId: string; departmentId: string };

    await projectDepartmentService.delete(projectId, departmentId);
    res.json({ message: "Assignment deleted successfully" });
  }
}

export default new ProjectDepartmentController();

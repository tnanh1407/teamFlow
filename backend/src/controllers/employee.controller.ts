import { Request, Response } from "express";
import employeeService from "../services/employee.service.js";
import { AppError } from "../utils/errors/app-error.js";

class EmployeeController {
  async getAll(_req: Request, res: Response) {
    const employees = await employeeService.findAll();
    res.json({ data: employees });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const employee = await employeeService.findById(id);
    if (!employee) throw new AppError("Employee not found", 404);
    res.json({ data: employee });
  }

  async getByDepartment(req: Request, res: Response) {
    const departmentId = req.params.departmentId as string;
    const employees = await employeeService.findByDepartment(departmentId);
    res.json({ data: employees });
  }

  async getByPosition(req: Request, res: Response) {
    const positionId = req.params.positionId as string;
    const employees = await employeeService.findByPosition(positionId);
    res.json({ data: employees });
  }

  async create(req: Request, res: Response) {
    const employee = await employeeService.create(req.body);
    res.status(201).json({ data: employee });
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const employee = await employeeService.update(id, req.body);
    if (!employee) throw new AppError("Employee not found", 404);
    res.json({ data: employee });
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const employee = await employeeService.delete(id);
    if (!employee) throw new AppError("Employee not found", 404);
    res.json({ message: "Employee deleted successfully" });
  }
}

export default new EmployeeController();

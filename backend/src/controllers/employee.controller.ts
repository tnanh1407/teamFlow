import { Request, Response } from "express";
import employeeService from "../services/employee.service.js";
import { AppError } from "../utils/errors/app-error.js";
import { handleFileUpload, deleteFile } from "../utils/upload.js";

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
    const data = { ...req.body };
    data.avatarURL = handleFileUpload(req.file, "avatars");
    const employee = await employeeService.create(data);
    res.status(201).json({ data: employee });
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const data = { ...req.body };

    if (req.file) {
      const old = await employeeService.findById(id);
      if (old?.avatarURL) {
        await deleteFile(old.avatarURL);
      }
      data.avatarURL = handleFileUpload(req.file, "avatars");
    }

    const employee = await employeeService.update(id, data);
    if (!employee) throw new AppError("Employee not found", 404);
    res.json({ data: employee });
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const employee = await employeeService.deleteSoft(id);
    if (!employee) throw new AppError("Employee not found", 404);
    res.json({ message: "Employee deleted successfully" });
  }

  async deleteHard(req: Request, res: Response) {
    const id = req.params.id as string;
    const employee = await employeeService.deleteHard(id);
    if (!employee) throw new AppError("Employee not found", 404);
    res.json({ message: "Employee permanently deleted" });
  }

  async restore(req: Request, res: Response) {
    const id = req.params.id as string;
    const employee = await employeeService.restore(id);
    if (!employee) throw new AppError("Employee not found or not deleted", 404);
    res.json({ data: employee });
  }
}

export default new EmployeeController();

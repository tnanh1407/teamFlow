import { Request, Response } from "express";
import positionService from "./position.service.js";
import { AppError } from "../utils/errors/app-error.js";

class PositionController {
  async getAll(_req: Request, res: Response) {
    const positions = await positionService.findAll();
    res.json({ data: positions });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const position = await positionService.findById(id);
    if (!position) throw new AppError("Position not found", 404);
    res.json({ data: position });
  }

  async create(req: Request, res: Response) {
    const position = await positionService.create(req.body);
    res.status(201).json({ data: position });
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const position = await positionService.update(id, req.body);
    if (!position) throw new AppError("Position not found", 404);
    res.json({ data: position });
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const position = await positionService.delete(id);
    if (!position) throw new AppError("Position not found", 404);
    res.json({ message: "Position deleted successfully" });
  }
}

export default new PositionController();

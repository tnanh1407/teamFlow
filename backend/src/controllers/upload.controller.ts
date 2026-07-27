import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";

class UploadController {
  async uploadFiles(req: AuthRequest, res: Response) {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const urls = files.map((file) => ({
      originalName: file.originalname,
      url: `/uploads/attachments/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.json({ data: urls });
  }
}

export default new UploadController();

import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { AppError } from "../utils/errors/app-error.js";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof multer.MulterError) {
    const statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(statusCode).json({ message: err.message });
  }

  if (
    err.message === "Only images, documents, PDFs, and archives are allowed" ||
    err.message === "Only jpg, png, gif, webp are allowed"
  ) {
    return res.status(400).json({ message: err.message });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
};

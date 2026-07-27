import { Router } from "express";
import uploadController from "../controllers/upload.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { uploadAttachment } from "../middlewares/upload.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  uploadAttachment.array("files", 10),
  asyncHandler(uploadController.uploadFiles)
);

export default router;

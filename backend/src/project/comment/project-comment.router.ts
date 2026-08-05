import { Router } from "express";
import projectCommentController from "./project-comment.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../middlewares/async.middleware.js";
import { uploadAttachment } from "../../middlewares/upload.middleware.js";
import { denyAdmin } from "../../middlewares/deny-admin.middleware.js";
import {
  createProjectCommentSchema,
  updateProjectCommentSchema,
} from "./project-comment.validation.js";

const router = Router();

router.get("/", authenticate, asyncHandler(projectCommentController.getAll));
router.get("/project/:projectId", authenticate, asyncHandler(projectCommentController.getByProject));
router.get("/employee/:employeeId", authenticate, asyncHandler(projectCommentController.getByEmployee));
router.get("/:id", authenticate, asyncHandler(projectCommentController.getById));
router.post(
  "/upload",
  authenticate,
  denyAdmin,
  uploadAttachment.array("files", 10),
  asyncHandler(projectCommentController.uploadFiles)
);
router.post(
  "/",
  authenticate,
  denyAdmin,
  validate(createProjectCommentSchema),
  asyncHandler(projectCommentController.create)
);
router.patch(
  "/:id",
  authenticate,
  denyAdmin,
  validate(updateProjectCommentSchema),
  asyncHandler(projectCommentController.update)
);
router.delete(
  "/:id",
  authenticate,
  denyAdmin,
  asyncHandler(projectCommentController.delete)
);

export default router;

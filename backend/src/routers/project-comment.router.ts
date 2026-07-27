import { Router } from "express";
import projectCommentController from "../controllers/project-comment.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createProjectCommentSchema,
  updateProjectCommentSchema,
} from "../validations/project-comment.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(projectCommentController.getAll));
router.get("/project/:projectId", authenticate, asyncHandler(projectCommentController.getByProject));
router.get("/employee/:employeeId", authenticate, asyncHandler(projectCommentController.getByEmployee));
router.get("/:id", authenticate, asyncHandler(projectCommentController.getById));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
  validate(createProjectCommentSchema),
  asyncHandler(projectCommentController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
  validate(updateProjectCommentSchema),
  asyncHandler(projectCommentController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
  asyncHandler(projectCommentController.delete)
);

export default router;

import { Router } from "express";
import projectCommentController from "./project-comment.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../middlewares/async.middleware.js";
import {
  createProjectCommentSchema,
  updateProjectCommentSchema,
} from "./project-comment.validation.js";
import { EAccountRole } from "../../enums/account-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(projectCommentController.getAll));
router.get("/project/:projectId", authenticate, asyncHandler(projectCommentController.getByProject));
router.get("/employee/:employeeId", authenticate, asyncHandler(projectCommentController.getByEmployee));
router.get("/:id", authenticate, asyncHandler(projectCommentController.getById));
router.post(
  "/",
  authenticate,
  authorize(EAccountRole.ADMIN, EAccountRole.USER),
  validate(createProjectCommentSchema),
  asyncHandler(projectCommentController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN, EAccountRole.USER),
  validate(updateProjectCommentSchema),
  asyncHandler(projectCommentController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN, EAccountRole.USER),
  asyncHandler(projectCommentController.delete)
);

export default router;

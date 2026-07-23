import { Router } from "express";
import taskCommentController from "../controllers/task-comment.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createTaskCommentSchema,
  updateTaskCommentSchema,
} from "../validations/task-comment.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(taskCommentController.getAll));
router.get("/task/:taskId", authenticate, asyncHandler(taskCommentController.getByTask));
router.get("/employee/:employeeId", authenticate, asyncHandler(taskCommentController.getByEmployee));
router.get("/:id", authenticate, asyncHandler(taskCommentController.getById));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(createTaskCommentSchema),
  asyncHandler(taskCommentController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(updateTaskCommentSchema),
  asyncHandler(taskCommentController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  asyncHandler(taskCommentController.delete)
);

export default router;

import { Router } from "express";
import projectTaskController from "./project-task.controller.js";
import { authenticate, authorizeManager } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../middlewares/async.middleware.js";
import {
  createProjectTaskSchema,
  updateProjectTaskSchema,
} from "./project-task.validation.js";

const router = Router();

router.get("/", authenticate, asyncHandler(projectTaskController.getAll));
router.get("/project/:projectId", authenticate, asyncHandler(projectTaskController.getByProject));

// lấy các task được giao cho một nhân viên — phải đặt trước /:id
router.get("/employee/:id", authenticate, asyncHandler(projectTaskController.getByEmployee));
router.get("/:id", authenticate, asyncHandler(projectTaskController.getById));

// chỉ manager mới được tạo/giao task, admin chỉ thống kê
router.post(
  "/",
  authenticate,
  authorizeManager,
  validate(createProjectTaskSchema),
  asyncHandler(projectTaskController.create)
);

// manager hoặc assignee được sửa task
router.patch(
  "/:id",
  authenticate,
  validate(updateProjectTaskSchema),
  asyncHandler(projectTaskController.update)
);

router.delete(
  "/:id",
  authenticate,
  authorizeManager,
  asyncHandler(projectTaskController.delete)
);

export default router;

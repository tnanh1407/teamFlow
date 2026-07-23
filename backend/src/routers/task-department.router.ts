import { Router } from "express";
import taskDepartmentController from "../controllers/task-department.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createTaskDepartmentSchema,
} from "../validations/task-department.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(taskDepartmentController.getAll));
router.get("/task/:taskId", authenticate, asyncHandler(taskDepartmentController.getByTask));
router.get("/department/:departmentId", authenticate, asyncHandler(taskDepartmentController.getByDepartment));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(createTaskDepartmentSchema),
  asyncHandler(taskDepartmentController.create)
);
router.delete(
  "/:taskId/:departmentId",
  authenticate,
  authorize(EUserRole.ADMIN),
  asyncHandler(taskDepartmentController.delete)
);

export default router;

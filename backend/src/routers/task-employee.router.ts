import { Router } from "express";
import taskEmployeeController from "../controllers/task-employee.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createTaskEmployeeSchema,
  updateTaskEmployeeSchema,
} from "../validations/task-employee.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(taskEmployeeController.getAll));
router.get("/task/:taskId", authenticate, asyncHandler(taskEmployeeController.getByTask));
router.get("/employee/:employeeId", authenticate, asyncHandler(taskEmployeeController.getByEmployee));
router.get("/:id", authenticate, asyncHandler(taskEmployeeController.getById));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(createTaskEmployeeSchema),
  asyncHandler(taskEmployeeController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(updateTaskEmployeeSchema),
  asyncHandler(taskEmployeeController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  asyncHandler(taskEmployeeController.delete)
);

export default router;

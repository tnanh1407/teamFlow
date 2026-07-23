import { Router } from "express";
import taskLogController from "../controllers/task-log.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createTaskLogSchema,
} from "../validations/task-log.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(taskLogController.getAll));
router.get("/task/:taskId", authenticate, asyncHandler(taskLogController.getByTask));
router.get("/employee/:employeeId", authenticate, asyncHandler(taskLogController.getByEmployee));
router.get("/:id", authenticate, asyncHandler(taskLogController.getById));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(createTaskLogSchema),
  asyncHandler(taskLogController.create)
);

export default router;

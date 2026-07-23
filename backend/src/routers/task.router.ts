import { Router } from "express";
import taskController from "../controllers/task.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../validations/task.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(taskController.getAll));
router.get("/status/:status", authenticate, asyncHandler(taskController.getByStatus));
router.get("/priority/:priority", authenticate, asyncHandler(taskController.getByPriority));
router.get("/created-by/:employeeId", authenticate, asyncHandler(taskController.getByCreatedBy));
router.get("/:id", authenticate, asyncHandler(taskController.getById));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(createTaskSchema),
  asyncHandler(taskController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(updateTaskSchema),
  asyncHandler(taskController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  asyncHandler(taskController.delete)
);

export default router;

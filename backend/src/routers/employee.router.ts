import { Router } from "express";
import employeeController from "../controllers/employee.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "../validations/employee.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(employeeController.getAll));
router.get("/department/:departmentId", authenticate, asyncHandler(employeeController.getByDepartment));
router.get("/position/:positionId", authenticate, asyncHandler(employeeController.getByPosition));
router.get("/:id", authenticate, asyncHandler(employeeController.getById));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN),
  uploadAvatar.single("avatar"),
  validate(createEmployeeSchema),
  asyncHandler(employeeController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  uploadAvatar.single("avatar"),
  validate(updateEmployeeSchema),
  asyncHandler(employeeController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  asyncHandler(employeeController.delete)
);
router.delete(
  "/:id/hard",
  authenticate,
  authorize(EUserRole.ADMIN),
  asyncHandler(employeeController.deleteHard)
);
router.post(
  "/:id/restore",
  authenticate,
  authorize(EUserRole.ADMIN),
  asyncHandler(employeeController.restore)
);

export default router;

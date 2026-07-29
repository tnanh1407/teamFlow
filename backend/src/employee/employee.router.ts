import { Router } from "express";
import employeeController from "./employee.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "./employee.validation.js";
import { EAccountRole } from "../enums/account-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(employeeController.getAll));
router.get("/department/:departmentId", authenticate, asyncHandler(employeeController.getByDepartment));
router.get("/position/:positionId", authenticate, asyncHandler(employeeController.getByPosition));
router.get("/:id", authenticate, asyncHandler(employeeController.getById));
router.post(
  "/",
  authenticate,
  authorize(EAccountRole.ADMIN),
  uploadAvatar.single("avatar"),
  validate(createEmployeeSchema),
  asyncHandler(employeeController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN),
  uploadAvatar.single("avatar"),
  validate(updateEmployeeSchema),
  asyncHandler(employeeController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN),
  asyncHandler(employeeController.delete)
);
export default router;

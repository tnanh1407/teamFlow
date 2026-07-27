import { Router } from "express";
import departmentController from "../controllers/department.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "../validations/department.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(departmentController.getAll));
router.get("/:id", authenticate, asyncHandler(departmentController.getById));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
  validate(createDepartmentSchema),
  asyncHandler(departmentController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
  validate(updateDepartmentSchema),
  asyncHandler(departmentController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
  asyncHandler(departmentController.delete)
);

export default router;

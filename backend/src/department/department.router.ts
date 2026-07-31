import { Router } from "express";
import departmentController from "./department.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "./department.validation.js";
import { EAccountRole } from "../enums/account-role.enum.js";

const router = Router();

router.get("/", authenticate, authorize(EAccountRole.ADMIN), asyncHandler(departmentController.getAll));
router.get("/:id/projects", authenticate, asyncHandler(departmentController.getProjectsByDepartment));
router.get("/:id", authenticate, asyncHandler(departmentController.getById));
router.post(
  "/",
  authenticate,
  authorize(EAccountRole.ADMIN),
  validate(createDepartmentSchema),
  asyncHandler(departmentController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN),
  validate(updateDepartmentSchema),
  asyncHandler(departmentController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN),
  asyncHandler(departmentController.delete)
);

export default router;

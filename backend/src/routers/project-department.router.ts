import { Router } from "express";
import projectDepartmentController from "../controllers/project-department.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createProjectDepartmentSchema,
} from "../validations/project-department.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(projectDepartmentController.getAll));
router.get("/project/:projectId", authenticate, asyncHandler(projectDepartmentController.getByProject));
router.get("/department/:departmentId", authenticate, asyncHandler(projectDepartmentController.getByDepartment));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
  validate(createProjectDepartmentSchema),
  asyncHandler(projectDepartmentController.create)
);
router.delete(
  "/:projectId/:departmentId",
  authenticate,
  authorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN),
  asyncHandler(projectDepartmentController.delete)
);

export default router;

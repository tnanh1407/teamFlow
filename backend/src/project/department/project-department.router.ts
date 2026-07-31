import { Router } from "express";
import projectDepartmentController from "./project-department.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../middlewares/async.middleware.js";
import {
  createProjectDepartmentSchema,
} from "./project-department.validation.js";
import { EAccountRole } from "../../enums/account-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(projectDepartmentController.getAll));
router.get("/project/:projectId", authenticate, asyncHandler(projectDepartmentController.getByProject));
router.get("/department/:departmentId", authenticate, asyncHandler(projectDepartmentController.getByDepartment));
router.post(
  "/",
  authenticate,
  authorize(EAccountRole.ADMIN, EAccountRole.USER),
  validate(createProjectDepartmentSchema),
  asyncHandler(projectDepartmentController.create)
);
router.delete(
  "/:projectId/:departmentId",
  authenticate,
  authorize(EAccountRole.ADMIN, EAccountRole.USER),
  asyncHandler(projectDepartmentController.delete)
);

export default router;

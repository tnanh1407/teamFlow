import { Router } from "express";
import projectEmployeeController from "./project-employee.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createProjectEmployeeSchema,
  updateProjectEmployeeSchema,
} from "./project-employee.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(projectEmployeeController.getAll));
router.get("/project/:projectId", authenticate, asyncHandler(projectEmployeeController.getByProject));
router.get("/employee/:employeeId", authenticate, asyncHandler(projectEmployeeController.getByEmployee));
router.get("/:id", authenticate, asyncHandler(projectEmployeeController.getById));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(createProjectEmployeeSchema),
  asyncHandler(projectEmployeeController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(updateProjectEmployeeSchema),
  asyncHandler(projectEmployeeController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  asyncHandler(projectEmployeeController.delete)
);

export default router;

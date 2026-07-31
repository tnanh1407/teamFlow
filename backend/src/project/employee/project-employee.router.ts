import { Router } from "express";
import projectEmployeeController from "./project-employee.controller.js";
import { authenticate, authorize, authorizePosition } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../middlewares/async.middleware.js";
import {
  createProjectEmployeeSchema,
  updateProjectEmployeeSchema,
} from "./project-employee.validation.js";
import { EAccountPosition, EAccountRole } from "../../enums/account-role.enum.js";

const router = Router();

router.get("/", authenticate, authorize(EAccountRole.ADMIN), authorizePosition(EAccountPosition.MANAGER), asyncHandler(projectEmployeeController.getAll));

// Chưa dùng làm gì cả
  router.get("/employee/:employeeId", authenticate, asyncHandler(projectEmployeeController.getByEmployee));
  router.get("/project/:projectId", authenticate, asyncHandler(projectEmployeeController.getByProject));

// lấy ra chi tiết 1 cái
router.get("/:id", authenticate, asyncHandler(projectEmployeeController.getById));

// thêm người dùng vào project 
router.post(
  "/",
  authenticate,
  authorize(EAccountRole.ADMIN),
  authorizePosition(EAccountPosition.MANAGER),
  validate(createProjectEmployeeSchema),
  asyncHandler(projectEmployeeController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN),
  authorizePosition(EAccountPosition.MANAGER),
  validate(updateProjectEmployeeSchema),
  asyncHandler(projectEmployeeController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN, EAccountRole.USER),
  asyncHandler(projectEmployeeController.delete)
);

export default router;

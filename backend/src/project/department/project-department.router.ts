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

// lấy ra tất cả bộ phận phòng ban
router.get("/", authenticate,authorize(EAccountRole.ADMIN),  asyncHandler(projectDepartmentController.getAll));

// Lấy ra danh sách phòng ban được gắn cho project cụ thể
router.get("/project/:projectId", authenticate, asyncHandler(projectDepartmentController.getByProject));

router.post(
  "/",
  authenticate,
  authorize(EAccountRole.ADMIN),
  validate(createProjectDepartmentSchema),
  asyncHandler(projectDepartmentController.create)
);

// xóa phòng ban khỏi dự án (đồng bộ với POST: nhận body + validate)
router.delete(
  "/",
  authenticate,
  authorize(EAccountRole.ADMIN),
  validate(createProjectDepartmentSchema),
  asyncHandler(projectDepartmentController.delete)
);

export default router;

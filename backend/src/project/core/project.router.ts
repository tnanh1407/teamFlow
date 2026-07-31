import { Router } from "express";
import projectController from "./project.controller.js";
import { authenticate, authorize, authorizePosition } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../middlewares/async.middleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "./project.validation.js";
import { EAccountPosition, EAccountRole } from "../../enums/account-role.enum.js";

const router = Router();

// lấy all project 
router.get("/", authenticate, authorize(EAccountRole.ADMIN), asyncHandler(projectController.getAll));

// lấy project của tôi 
router.get("/me", authenticate, asyncHandler(projectController.getMyProjects));

// láy ra trạng thái project
router.get("/status/:status", authenticate, asyncHandler(projectController.getByStatus));

// lấy mức độ ưu tiên
router.get("/priority/:priority", authenticate, asyncHandler(projectController.getByPriority));

// 
router.get("/created-by/:employeeId", authenticate, asyncHandler(projectController.getByCreatedBy));

// lấy chi tiết 1 project
router.get("/:id", authenticate, asyncHandler(projectController.getById));

// lấy danh sách nhân viên được gán cho project
router.get("/:id/employees", authenticate, asyncHandler(projectController.getEmployeesByProject));

// Tạo dự án 
router.post(
  "/",
  authenticate,
  authorize(EAccountRole.ADMIN),
  validate(createProjectSchema),
  asyncHandler(projectController.create)
);

//  sửa dự án
router.patch(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN),
  authorizePosition(EAccountPosition.MANAGER),
  validate(updateProjectSchema),
  asyncHandler(projectController.update)
);


router.delete(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN),
  asyncHandler(projectController.delete)
);

export default router;

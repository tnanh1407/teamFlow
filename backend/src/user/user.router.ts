import { Router } from "express";
import userController from "./user.controller.js";
import { authenticate, authorize, authorizePosition } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  loginSchema,
  updatePassword,
} from "./user.validation.js";
import { EAccountPosition, EAccountRole } from "../enums/account-role.enum.js";

const router = Router();

router.post("/login", validate(loginSchema), asyncHandler(userController.login));
router.post("/logout", authenticate, asyncHandler(userController.logout));

router.get("/", authenticate, authorize(EAccountRole.ADMIN), asyncHandler(userController.getAll));
router.get("/all", authenticate, asyncHandler(userController.getAllEmployees));
router.get("/department/:departmentId", authenticate,  authorizePosition(EAccountPosition.MANAGER) , asyncHandler(userController.getByDepartment));
router.get("/position/:positionId", authenticate , authorize(EAccountRole.ADMIN),asyncHandler(userController.getByPosition));
router.get("/:id", authenticate, asyncHandler(userController.getById));
router.post(
  "/",
  authenticate,
  authorize(EAccountRole.ADMIN),
  uploadAvatar.single("avatar"),
  validate(createUserSchema),
  asyncHandler(userController.create)
);

// cập nhật mật khẩu cho user và admin
router.patch(
  "/updatePs",
  authenticate,
  validate(updatePassword),
  asyncHandler(userController.changePassword)
);

// tự cập nhật avatar
router.post(
  "/me/avatar",
  authenticate,
  uploadAvatar.single("avatar"),
  asyncHandler(userController.updateAvatar)
);

// cập nhật toàn bộ thông tin trừ passowrd
router.patch(
  "/:id",
  authenticate,
  uploadAvatar.single("avatar"),
  validate(updateUserSchema),
  asyncHandler(userController.update)
);

// xóa người dùng
router.delete(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN),
  asyncHandler(userController.delete)
);

export default router;

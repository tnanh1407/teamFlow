import { Router } from "express";
import userController from "./user.controller.js";
import { authenticate, authorize, authorizePosition } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  updateMeSchema,
  loginSchema,
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
router.patch(
  "/me",
  authenticate,
  validate(updateMeSchema),
  asyncHandler(userController.updateMe)
);
router.post(
  "/me/avatar",
  authenticate,
  uploadAvatar.single("avatar"),
  asyncHandler(userController.updateAvatar)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN, EAccountRole.USER),
  uploadAvatar.single("avatar"),
  validate(updateUserSchema),
  asyncHandler(userController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN, EAccountRole.USER),
  asyncHandler(userController.delete)
);

export default router;

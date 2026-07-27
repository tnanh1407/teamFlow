import { Router } from "express";
import userController from "./user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  updateMeSchema,
  loginSchema,
} from "./user.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.post("/login", validate(loginSchema), asyncHandler(userController.login));
router.post("/logout", authenticate, asyncHandler(userController.logout));

router.get("/", authenticate, asyncHandler(userController.getAll));
router.get("/:id", authenticate, asyncHandler(userController.getById));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN, EUserRole.USER),
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
  authorize(EUserRole.ADMIN, EUserRole.USER),
  validate(updateUserSchema),
  asyncHandler(userController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN, EUserRole.USER),
  asyncHandler(userController.delete)
);

export default router;

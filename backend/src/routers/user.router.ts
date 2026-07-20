import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  loginSchema,
} from "../validations/user.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.post("/login", validate(loginSchema), asyncHandler(userController.login));
router.post("/logout", authenticate, asyncHandler(userController.logout));

router.get("/", authenticate, asyncHandler(userController.getAll));
router.get("/:id", authenticate, asyncHandler(userController.getById));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(createUserSchema),
  asyncHandler(userController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(updateUserSchema),
  asyncHandler(userController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  asyncHandler(userController.delete)
);

export default router;

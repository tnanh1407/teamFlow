import { Router } from "express";
import accountController from "./account.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import {
  createAccountSchema,
  updateAccountSchema,
  updateMeSchema,
  loginSchema,
} from "./account.validation.js";
import { EAccountRole } from "../enums/account-role.enum.js";

const router = Router();

router.post("/login", validate(loginSchema), asyncHandler(accountController.login));
router.post("/logout", authenticate, asyncHandler(accountController.logout));

router.get("/", authenticate, asyncHandler(accountController.getAll));
router.get("/:id", authenticate, asyncHandler(accountController.getById));
router.post(
  "/",
  authenticate,
  authorize(EAccountRole.ADMIN, EAccountRole.USER),
  validate(createAccountSchema),
  asyncHandler(accountController.create)
);
router.patch(
  "/me",
  authenticate,
  validate(updateMeSchema),
  asyncHandler(accountController.updateMe)
);
router.post(
  "/me/avatar",
  authenticate,
  uploadAvatar.single("avatar"),
  asyncHandler(accountController.updateAvatar)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN, EAccountRole.USER),
  validate(updateAccountSchema),
  asyncHandler(accountController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN, EAccountRole.USER),
  asyncHandler(accountController.delete)
);

export default router;

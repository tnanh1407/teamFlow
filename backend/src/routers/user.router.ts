import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  loginSchema,
} from "../validations/user.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.post("/login", validate(loginSchema), userController.login);
router.post("/logout", authenticate, userController.logout);

router.get("/", authenticate, userController.getAll);
router.get("/:id", authenticate, userController.getById);
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(createUserSchema),
  userController.create
);
router.patch(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(updateUserSchema),
  userController.update
);
router.delete(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  userController.delete
);

export default router;

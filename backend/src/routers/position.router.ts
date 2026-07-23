import { Router } from "express";
import positionController from "../controllers/position.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createPositionSchema,
  updatePositionSchema,
} from "../validations/position.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(positionController.getAll));
router.get("/:id", authenticate, asyncHandler(positionController.getById));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(createPositionSchema),
  asyncHandler(positionController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(updatePositionSchema),
  asyncHandler(positionController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  asyncHandler(positionController.delete)
);

export default router;

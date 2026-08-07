import { Router } from "express";
import positionController from "./position.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createPositionSchema,
  updatePositionSchema,
} from "./position.validation.js";
import { EAccountRole } from "../enums/account-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(positionController.getAll));
router.get("/:id", authenticate, asyncHandler(positionController.getById));
router.post(
  "/",
  authenticate,
  authorize(EAccountRole.ADMIN),
  validate(createPositionSchema),
  asyncHandler(positionController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN),
  validate(updatePositionSchema),
  asyncHandler(positionController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN),
  asyncHandler(positionController.delete)
);

export default router;

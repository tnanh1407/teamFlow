import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../middlewares/async.middleware.js";
import projectNotificationController from "./project-notification.controller.js";
import {
  createProjectNotificationSchema,
  updateProjectNotificationSchema,
} from "./project-notification.validation.js";

const router = Router();

router.get("/project/:projectId", authenticate, asyncHandler(projectNotificationController.getByProject));
router.get("/:id", authenticate, asyncHandler(projectNotificationController.getById));
router.post(
  "/",
  authenticate,
  validate(createProjectNotificationSchema),
  asyncHandler(projectNotificationController.create)
);
router.patch(
  "/:id",
  authenticate,
  validate(updateProjectNotificationSchema),
  asyncHandler(projectNotificationController.update)
);
router.delete(
  "/:id",
  authenticate,
  asyncHandler(projectNotificationController.delete)
);

export default router;

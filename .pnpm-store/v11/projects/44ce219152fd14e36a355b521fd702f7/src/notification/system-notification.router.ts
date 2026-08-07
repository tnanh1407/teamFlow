import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { EAccountRole } from "../enums/account-role.enum.js";
import systemNotificationController from "./system-notification.controller.js";
import { createSystemNotificationSchema, updateSystemNotificationSchema } from "./system-notification.validation.js";

const router = Router();

router.get("/", authenticate, asyncHandler(systemNotificationController.getVisible));
router.get("/manage", authenticate, authorize(EAccountRole.ADMIN), asyncHandler(systemNotificationController.getAll));
router.get("/:id", authenticate, asyncHandler(systemNotificationController.getById));
router.post("/:id/read", authenticate, asyncHandler(systemNotificationController.markRead));
router.delete("/:id/read", authenticate, asyncHandler(systemNotificationController.markUnread));
router.post("/", authenticate, authorize(EAccountRole.ADMIN), validate(createSystemNotificationSchema), asyncHandler(systemNotificationController.create));
router.patch("/:id", authenticate, authorize(EAccountRole.ADMIN), validate(updateSystemNotificationSchema), asyncHandler(systemNotificationController.update));
router.delete("/:id", authenticate, authorize(EAccountRole.ADMIN), asyncHandler(systemNotificationController.delete));

export default router;

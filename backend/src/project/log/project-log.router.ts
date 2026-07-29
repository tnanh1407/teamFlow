import { Router } from "express";
import projectLogController from "./project-log.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../middlewares/async.middleware.js";
import {
  createProjectLogSchema,
} from "./project-log.validation.js";
import { EAccountRole } from "../../enums/account-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(projectLogController.getAll));
router.get("/task/:taskId", authenticate, asyncHandler(projectLogController.getByTask));
router.get("/employee/:employeeId", authenticate, asyncHandler(projectLogController.getByEmployee));
router.get("/:id", authenticate, asyncHandler(projectLogController.getById));
router.post(
  "/",
  authenticate,
  authorize(EAccountRole.ADMIN),
  validate(createProjectLogSchema),
  asyncHandler(projectLogController.create)
);

export default router;

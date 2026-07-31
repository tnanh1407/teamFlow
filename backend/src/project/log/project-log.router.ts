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


router.get("/", authenticate, authorize(EAccountRole.ADMIN), asyncHandler(projectLogController.getAll));
router.get("/project/:projectId/", authenticate,authorize(EAccountRole.ADMIN), asyncHandler(projectLogController.getByProject));
router.get("/employee/:employeeId", authenticate, authorize(EAccountRole.ADMIN), asyncHandler(projectLogController.getByEmployee));
router.get("/:id", authenticate,authorize(EAccountRole.ADMIN), asyncHandler(projectLogController.getById));
router.post(
  "/",
  authenticate,
  validate(createProjectLogSchema),
  asyncHandler(projectLogController.create)
);

export default router;

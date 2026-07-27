import { Router } from "express";
import projectController from "./project.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "./project.validation.js";
import { EUserRole } from "../enums/user-role.enum.js";

const router = Router();

router.get("/", authenticate, asyncHandler(projectController.getAll));
router.get("/status/:status", authenticate, asyncHandler(projectController.getByStatus));
router.get("/priority/:priority", authenticate, asyncHandler(projectController.getByPriority));
router.get("/created-by/:employeeId", authenticate, asyncHandler(projectController.getByCreatedBy));
router.get("/:id", authenticate, asyncHandler(projectController.getById));
router.post(
  "/",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(createProjectSchema),
  asyncHandler(projectController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  validate(updateProjectSchema),
  asyncHandler(projectController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EUserRole.ADMIN),
  asyncHandler(projectController.delete)
);

export default router;

import { Router } from "express";
import projectController from "./project.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../middlewares/async.middleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "./project.validation.js";
import { EAccountRole } from "../../enums/account-role.enum.js";

const router = Router();

// lấy all project 
router.get("/", authenticate, authorize(EAccountRole.ADMIN), asyncHandler(projectController.getAll));

// lấy project của tôi 
router.get("/me", authenticate, asyncHandler(projectController.getMyProjects));

// get
router.get("/status/:status", authenticate, asyncHandler(projectController.getByStatus));
router.get("/priority/:priority", authenticate, asyncHandler(projectController.getByPriority));
router.get("/created-by/:employeeId", authenticate, asyncHandler(projectController.getByCreatedBy));
router.get("/:id", authenticate, asyncHandler(projectController.getById));
router.post(
  "/",
  authenticate,
  authorize(EAccountRole.ADMIN),
  validate(createProjectSchema),
  asyncHandler(projectController.create)
);
router.patch(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN, EAccountRole.USER),
  validate(updateProjectSchema),
  asyncHandler(projectController.update)
);
router.delete(
  "/:id",
  authenticate,
  authorize(EAccountRole.ADMIN),
  asyncHandler(projectController.delete)
);

export default router;

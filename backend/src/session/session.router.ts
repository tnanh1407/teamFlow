import { Router } from "express";
import sessionController from "./session.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/me", asyncHandler(sessionController.getMySessions));
router.delete("/me", asyncHandler(sessionController.logoutAll));
router.delete("/:id", asyncHandler(sessionController.revokeById));

export default router;

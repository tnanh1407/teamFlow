import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import searchController from "./search.controller.js";

const router = Router();

// tìm kiếm nhanh toàn hệ thống (Ctrl+K): users, projects, tasks, departments, positions
router.get("/", authenticate, asyncHandler(searchController.searchAll));

export default router;

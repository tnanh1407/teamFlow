import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import searchController from "./search.controller.js";
import { authorizePosition } from "../middlewares/auth.middleware.js";
import { EAccountPosition } from "../enums/account-role.enum.js";

const router = Router();

// tìm kiếm nhanh toàn hệ thống (Ctrl+K): chỉ admin hoặc leader
router.get("/", authenticate, authorizePosition(EAccountPosition.LEADER), asyncHandler(searchController.searchAll));

export default router;

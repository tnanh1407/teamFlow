import type { Response } from "express";
import searchService from "./search.service.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

class SearchController {
  async searchAll(req: AuthRequest, res: Response) {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!q) {
      res.json({ users: [], projects: [], tasks: [], departments: [], positions: [] });
      return;
    }
    const limit = Math.min(10, Math.max(1, parseInt(req.query.limit as string, 10) || 5));
    const user = req.user!;
    const result = await searchService.searchAll(q, user.id, user.role, limit);
    res.json(result);
  }
}

export default new SearchController();

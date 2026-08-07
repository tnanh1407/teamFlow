import { Response } from "express";
import sessionService from "./session.service.js";
import { AppError } from "../utils/errors/app-error.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

class SessionController {
  async getMySessions(req: AuthRequest, res: Response) {
    const sessions = await sessionService.findByUserId(req.user!.id);
    const currentJti = req.user!.jti;
    res.json({
      data: sessions.map((s) => ({ ...s, isCurrent: s.jti === currentJti })),
    });
  }

  async logoutAll(req: AuthRequest, res: Response) {
    await sessionService.revokeAllByUserId(req.user!.id, req.user!.jti);
    res.json({ message: "Logged out from all other sessions" });
  }

  async revokeById(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const session = await sessionService.findById(id);
    if (!session || session.userId !== req.user!.id) {
      throw new AppError("Session not found", 404);
    }
    await sessionService.revokeSession(session.jti);
    res.json({ message: "Session revoked successfully" });
  }
}

export default new SessionController();

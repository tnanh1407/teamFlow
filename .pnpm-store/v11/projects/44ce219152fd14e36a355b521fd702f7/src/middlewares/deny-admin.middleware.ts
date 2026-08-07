import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";
import { EAccountRole } from "../enums/account-role.enum.js";

export const denyAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Access denied" });
  }

  if (req.user.role === EAccountRole.ADMIN) {
    return res.status(403).json({ message: "Admin can only view project data" });
  }

  next();
};

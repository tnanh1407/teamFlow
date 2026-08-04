import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { EAccountRole, EAccountPosition } from "../enums/account-role.enum.js";
import env from "../config/env.js"
import sessionService from "../session/session.service.js";
import userService from "../user/user.service.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: EAccountRole;
    position: EAccountPosition;
    jti: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    ) as { id: string; role: EAccountRole; position: EAccountPosition; jti: string };

    const session = await sessionService.validateAndTouch(decoded.jti);
    if (!session) {
      return res.status(401).json({ message: "Session expired or revoked" });
    }

    const user = await userService.findById(decoded.id);
    if (!user || !user.status || user.leaveDate) {
      await sessionService.revokeAllByUserId(decoded.id);
      res.clearCookie("token");
      return res.status(403).json({ message: "Account is disabled" });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

//  xác thực admin
export const authorize = (...roles: EAccountRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Access denied" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};


// xác thực manager

export const authorizePosition = (...positions: EAccountPosition[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Access denied" });
    }
    if (req.user.role === EAccountRole.ADMIN) {
      return next();
    }
    if (!req.user.position || !positions.includes(req.user.position)) {
      return res.status(403).json({ message: "Insufficient position permissions" });
    }
    next();
  };
};

// chỉ manager mới qua, admin bị chặn
export const authorizeManager = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Access denied" });
  }
  if (req.user.role === EAccountRole.ADMIN || req.user.position !== EAccountPosition.MANAGER) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};

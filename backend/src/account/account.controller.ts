import { Response } from "express";
import jwt from "jsonwebtoken";
import accountService from "./account.service.js";
import env from "../config/env.js";
import { comparePassword } from "../utils/auth/auth.comparePassword.js";
import { AppError } from "../utils/errors/app-error.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { EAccountRole, EAccountPosition } from "../enums/account-role.enum.js";
import bcrypt from "bcryptjs";
import { handleFileUpload, deleteFile } from "../utils/upload.js";

class AccountController {
  async getAll(_req: AuthRequest, res: Response) {
    const users = await accountService.findAll();
    res.json({ data: users });
  }

  async getById(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const user = await accountService.findById(id);
    if (!user) throw new AppError("Account not found", 404);
    res.json({ data: user });
  }

  async create(req: AuthRequest, res: Response) {
    const body = { ...req.body };
    const currentPos = req.user!.position;

    const posMap: Record<string, { role: EAccountRole; position: EAccountPosition }> = {
      admin: { role: EAccountRole.ADMIN, position: EAccountPosition.ADMIN },
      manager: { role: EAccountRole.USER, position: EAccountPosition.MANAGER },
      member: { role: EAccountRole.USER, position: EAccountPosition.MEMBER },
    };

    const target = posMap[body.position];
    if (!target) throw new AppError("Invalid position", 400);

    if (currentPos === EAccountPosition.MANAGER) {
      if (target.position !== EAccountPosition.MEMBER) {
        throw new AppError("Managers can only create members", 403);
      }
    }

    const user = await accountService.create({ ...body, role: target.role, position: target.position });
    res.status(201).json({ data: user });
  }

  async update(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const currentUser = req.user!;
    const target = await accountService.findById(id);
    if (!target) throw new AppError("Account not found", 404);

    if (currentUser.role === EAccountRole.ADMIN) {
      if (id === currentUser.id) {
        throw new AppError("Admins cannot edit themselves here. Use personal settings.", 403);
      }
    }

    if (currentUser.position === EAccountPosition.MANAGER) {
      if (id === currentUser.id) {
        throw new AppError("Managers cannot edit themselves here. Use personal settings.", 403);
      }
      if (target.position !== EAccountPosition.MEMBER) {
        throw new AppError("Managers can only edit members", 403);
      }
    }

    const user = await accountService.update(id, req.body);
    res.json({ data: user });
  }

  async delete(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const currentUser = req.user!;
    const target = await accountService.findById(id);
    if (!target) throw new AppError("Account not found", 404);

    if (currentUser.role === EAccountRole.ADMIN) {
      if (id === currentUser.id) {
        throw new AppError("Admins cannot delete themselves", 403);
      }
    }

    if (currentUser.position === EAccountPosition.MANAGER) {
      if (id === currentUser.id) {
        throw new AppError("Managers cannot delete themselves", 403);
      }
      if (target.position !== EAccountPosition.MEMBER) {
        throw new AppError("Managers can only delete members", 403);
      }
    }

    await accountService.delete(id);
    res.json({ message: "Account deleted successfully" });
  }

  async updateMe(req: AuthRequest, res: Response) {
    const id = req.user!.id;
    const { currentPassword, newPassword } = req.body;
    const user = await accountService.findById(id);
    if (!user) throw new AppError("Account not found", 404);

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) throw new AppError("Current password is incorrect", 400);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updated = await accountService.update(id, { password: hashedPassword });
    res.json({ data: updated });
  }

  async login(req: AuthRequest, res: Response) {
    const { username, password } = req.body;
    const user = await accountService.findByUsername(username);

    if (!user) throw new AppError("Invalid credentials", 401);
    if (!user.status) throw new AppError("Account is disabled", 403);

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new AppError("Invalid credentials", 401);

    await accountService.updateLastLogin(user.id);

    const token = jwt.sign(
      { id: user.id, role: user.role, position: user.position },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  }

  async updateAvatar(req: AuthRequest, res: Response) {
    const id = req.user!.id;
    const user = await accountService.findById(id);
    if (!user) throw new AppError("Account not found", 404);

    if (!req.file) throw new AppError("No file uploaded", 400);

    if (user.avatarURL) {
      await deleteFile(user.avatarURL);
    }

    const avatarURL = handleFileUpload(req.file, "avatars");
    const updated = await accountService.updateAvatar(id, avatarURL!);
    const { password: _, ...userWithoutPassword } = updated!;
    res.json({ data: userWithoutPassword });
  }

  async logout(_req: AuthRequest, res: Response) {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  }
}

export default new AccountController();

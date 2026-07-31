import { Response } from "express";
import userService from "./user.service.js";
import env from "../config/env.js";
import { AppError } from "../utils/errors/app-error.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { EAccountRole, EAccountPosition } from "../enums/account-role.enum.js";
import { handleFileUpload, deleteFile } from "../utils/upload/upload.js";
import sessionService, { SESSION_TTL_MS } from "../session/session.service.js";

class UserController {
  async getAll(req: AuthRequest, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const result = await userService.findAll(page, limit);
    res.json(result);
  }

  async getAllEmployees(_req: AuthRequest, res: Response) {
    const employees = await userService.findAllRaw();
    res.json({ data: employees });
  }

  async search(req: AuthRequest, res: Response) {
    const keyword = (req.query.q as string) || "";
    const users = await userService.search(keyword);
    res.json({ data: users });
  }

  async getById(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const user = await userService.findById(id);
    if (!user) throw new AppError("User not found", 404);
    res.json({ data: user });
  }

  // lấy tất cả nhân viên phòng it
  async getByDepartment(req: AuthRequest, res: Response) {
    const currentUser = req.user!;
    let departmentId = req.params.departmentId as string;

    if (currentUser.position === EAccountPosition.MANAGER && currentUser.role !== EAccountRole.ADMIN) {
      const user = await userService.findById(currentUser.id)
      if (departmentId !== user!.departmentId) {
        throw new AppError("You can only view your own department", 403);
      }
    }
    const employees = await userService.findByDepartment(departmentId);
    res.json({ data: employees });
  }

  // lấy cùng chức vụ
  async getByPosition(req: AuthRequest, res: Response) {
    const positionId = req.params.positionId as string;
    const employees = await userService.findByPosition(positionId);
    res.json({ data: employees });
  }

  // tạo thành viên mới chỉ có admin đươic tạo
  async create(req: AuthRequest, res: Response) {
    const body = { ...req.body };

    if (req.file) {
      body.avatarURL = handleFileUpload(req.file, "avatars");
    }

    const user = await userService.create({ ...body });
    res.status(201).json({ data: user });
  }

  async update(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const currentUser = req.user!;
    const target = await userService.findById(id);
    if (!target) throw new AppError("User not found", 404);

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

    const data = { ...req.body };
    if (req.file) {
      if (target.avatarURL) {
        await deleteFile(target.avatarURL);
      }
      data.avatarURL = handleFileUpload(req.file, "avatars");
    }

    const user = await userService.update(id, data);
    res.json({ message: "User updated successfully", data: user });
  }

  async delete(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const currentUser = req.user!;
    const target = await userService.findById(id);
    if (!target) throw new AppError("User not found", 404);

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

    await userService.delete(id);
    res.json({ message: "User deleted successfully" });
  }

  // cập nhật password
  async changePassword(req: AuthRequest, res: Response) {
    const id = req.user!.id;
    await userService.changePassword(id, req.body);
    res.status(200).json({
      message: "Password updated successfully",
    });
  }

  async login(req: AuthRequest, res: Response) {
    const { username, password } = req.body;
    const result = await userService.login(
      username,
      password,
      req.headers["user-agent"],
      req.ip
    );

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL_MS,
    });

    res.json({ data: result });
  }

  async updateAvatar(req: AuthRequest, res: Response) {
    const id = req.user!.id;
    const user = await userService.findById(id);
    if (!user) throw new AppError("User not found", 404);

    if (!req.file) throw new AppError("No file uploaded", 400);

    if (user.avatarURL) {
      await deleteFile(user.avatarURL);
    }

    const avatarURL = handleFileUpload(req.file, "avatars");
    await userService.updateAvatar(id, avatarURL!);
    res.json({
      message: "Avatar updated successfully",
    })
  }

  async removeAvatar(req: AuthRequest, res: Response) {
    const id = req.user!.id;
    const user = await userService.findById(id);
    if (!user) throw new AppError("User not found", 404);

    if (user.avatarURL) {
      await deleteFile(user.avatarURL);
    }

    await userService.removeAvatar(id);
    res.json({
      message: "Avatar removed successfully",
    })
  }

  async logout(req: AuthRequest, res: Response) {
    if (req.user?.jti) {
      await sessionService.revokeSession(req.user.jti);
    }
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  }
}

export default new UserController();

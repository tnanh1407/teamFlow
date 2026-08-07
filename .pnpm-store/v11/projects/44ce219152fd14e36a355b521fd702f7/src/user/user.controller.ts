import { Response } from "express";
import userService from "./user.service.js";
import env from "../config/env.js";
import { AppError } from "../utils/errors/app-error.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { EAccountRole, EAccountPosition } from "../enums/account-role.enum.js";
import { uploadToCloudinary, deleteCloudinaryFile } from "../utils/upload/cloudinary.js";
import sessionService, { SESSION_TTL_MS } from "../session/session.service.js";
import { sendPasswordResetRequestReceivedEmail } from "../utils/mail/mailer.js";

const MANAGER_POSITION_ID = "20000000-0000-4000-a000-000000000001";

class UserController {
  async me(req: AuthRequest, res: Response) {
    const user = await userService.findById(req.user!.id);
    if (!user) throw new AppError("User not found", 404);

    const { password: _password, ...safeUser } = user as typeof user & { password?: string };
    res.json({ data: safeUser });
  }

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
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const departmentId = (req.query.departmentId as string) || undefined;
    const role = (req.query.role as EAccountRole | undefined) || undefined;
    const positionId = (req.query.positionId as string) || undefined;
    const status = (req.query.status as "active" | "inactive" | "all" | undefined) || undefined;
    const sortBy =
      (req.query.sortBy as "name-asc" | "name-desc" | "hire-newest" | "hire-oldest" | "role" | undefined) || undefined;

    const result = await userService.search({
      keyword,
      page,
      limit,
      departmentId,
      role,
      positionId,
      status,
      sortBy,
    });
    res.json(result);
  }

  async trash(req: AuthRequest, res: Response) {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit ?? "10"), 10) || 10));
    res.json(await userService.findTrash(page, limit));
  }

  async restore(req: AuthRequest, res: Response) {
    const user = await userService.restore(req.params.id as string);
    res.json({ message: "User restored successfully", data: user });
  }

  async hardDelete(req: AuthRequest, res: Response) {
    await userService.hardDelete(req.params.id as string);
    res.json({ message: "User permanently deleted" });
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
      body.avatarURL = await uploadToCloudinary(req.file, "avatars");
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
      if (target.positionId === MANAGER_POSITION_ID) {
        throw new AppError("Managers cannot edit other managers", 403);
      }
    }

    const requestedEmployeeCode = typeof req.body.employeeCode === "string"
      ? req.body.employeeCode.trim().toUpperCase()
      : req.body.employeeCode;
    const currentEmployeeCode = target.employeeCode?.trim().toUpperCase() ?? null;
    const departmentChanged = req.body.departmentId !== undefined && req.body.departmentId !== target.departmentId;

    if (currentUser.role !== EAccountRole.ADMIN && !departmentChanged && requestedEmployeeCode !== currentEmployeeCode) {
      throw new AppError("Only admins can manually change employee codes", 403);
    }

    const data = { ...req.body };
    if (req.file) {
      if (target.avatarURL) {
        await deleteCloudinaryFile(target.avatarURL);
      }
      data.avatarURL = await uploadToCloudinary(req.file, "avatars");
    } else if (data.avatarAction === "remove") {
      if (target.avatarURL) {
        await deleteCloudinaryFile(target.avatarURL);
      }
      data.avatarURL = null;
    }

    const user = await userService.update(id, data);
    res.json({ message: "User updated successfully", data: user });
  }

  async delete(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const currentUser = req.user!;
    if (currentUser.role !== EAccountRole.ADMIN && currentUser.position !== EAccountPosition.MANAGER) {
      throw new AppError("Only admins and managers can delete users", 403);
    }

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
      if (target.positionId === MANAGER_POSITION_ID) {
        throw new AppError("Managers cannot delete other managers", 403);
      }
    }

    await userService.delete(id, currentUser.id);
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

  async forgotPassword(req: AuthRequest, res: Response) {
    const { departmentId, employeeCode } = req.body;
    const result = await userService.requestPasswordReset({ departmentId, employeeCode });

    await sendPasswordResetRequestReceivedEmail(result.email);

    res.json({
      message: "Password reset request received",
    });
  }

  async getPasswordResetRequests(req: AuthRequest, res: Response) {
    const status = (req.query.status as "pending" | "approved" | "rejected" | "all" | undefined) ?? "pending";
    res.json({ data: await userService.findPasswordResetRequests(status) });
  }

  async approvePasswordResetRequest(req: AuthRequest, res: Response) {
    await userService.approvePasswordResetRequest(req.params.id as string, req.user!.id);
    res.json({ message: "Password reset request approved" });
  }

  async rejectPasswordResetRequest(req: AuthRequest, res: Response) {
    await userService.rejectPasswordResetRequest(req.params.id as string, req.user!.id);
    res.json({ message: "Password reset request rejected" });
  }

  async resetPassword(req: AuthRequest, res: Response) {
    const { email, code, newPassword } = req.body;
    await userService.resetPassword(email, code, newPassword);
    res.json({ message: "Password reset successfully" });
  }

  async updateAvatar(req: AuthRequest, res: Response) {
    const id = req.user!.id;
    const user = await userService.findById(id);
    if (!user) throw new AppError("User not found", 404);

    if (!req.file) throw new AppError("No file uploaded", 400);

    if (user.avatarURL) {
      await deleteCloudinaryFile(user.avatarURL);
    }

    const avatarURL = await uploadToCloudinary(req.file, "avatars");
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
      await deleteCloudinaryFile(user.avatarURL);
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

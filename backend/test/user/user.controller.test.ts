import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import { EAccountRole, EAccountPosition } from "../../src/enums/account-role.enum.js";

const mockUserService = {
  findAll: vi.fn(),
  findAllRaw: vi.fn(),
  findById: vi.fn(),
  findByDepartment: vi.fn(),
  findByPosition: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  changePassword: vi.fn(),
  login: vi.fn(),
  updateAvatar: vi.fn(),
};

vi.mock("../../src/user/user.service.js", () => ({
  default: mockUserService,
}));

vi.mock("../../src/utils/upload/upload.js", () => ({
  handleFileUpload: vi.fn((file) => `uploads/avatars/${file.filename}`),
  deleteFile: vi.fn(),
}));

vi.mock("../../src/config/env.js", () => ({
  default: { NODE_ENV: "test", JWT_SECRET: "test-secret" },
}));

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  return res as Response;
}

const adminUser = { id: "admin-1", role: EAccountRole.ADMIN, position: EAccountPosition.MANAGER };
const managerUser = { id: "mgr-1", role: EAccountRole.USER, position: EAccountPosition.MANAGER };
const memberUser = { id: "member-1", role: EAccountRole.USER, position: EAccountPosition.MEMBER };

describe("UserController", () => {
  let controller: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    controller = (await import("../../src/user/user.controller.js")).default;
  });

  describe("getAll", () => {
    it("should return paginated users", async () => {
      const req = { query: { page: "1", limit: "10" }, user: adminUser } as any;
      const res = mockRes();
      mockUserService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });

      await controller.getAll(req, res);
      expect(mockUserService.findAll).toHaveBeenCalledWith(1, 10);
      expect(res.json).toHaveBeenCalled();
    });

    it("should use default pagination when query params missing", async () => {
      const req = { query: {}, user: adminUser } as any;
      const res = mockRes();
      mockUserService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });

      await controller.getAll(req, res);
      expect(mockUserService.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe("getAllEmployees", () => {
    it("should return all employees", async () => {
      const req = { user: adminUser } as any;
      const res = mockRes();
      mockUserService.findAllRaw.mockResolvedValue([]);

      await controller.getAllEmployees(req, res);
      expect(mockUserService.findAllRaw).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ data: [] });
    });
  });

  describe("getById", () => {
    it("should return user when found", async () => {
      const req = { params: { id: "user-1" }, user: adminUser } as any;
      const res = mockRes();
      mockUserService.findById.mockResolvedValue({ id: "user-1", name: "John" });

      await controller.getById(req, res);
      expect(res.json).toHaveBeenCalledWith({ data: { id: "user-1", name: "John" } });
    });

    it("should throw 404 if user not found", async () => {
      const req = { params: { id: "nonexistent" }, user: adminUser } as any;
      const res = mockRes();
      mockUserService.findById.mockResolvedValue(null);

      await expect(controller.getById(req, res)).rejects.toThrow("User not found");
    });
  });

  describe("getByDepartment", () => {
    it("should return users in department for admin", async () => {
      const req = { params: { departmentId: "dept-1" }, user: adminUser } as any;
      const res = mockRes();
      mockUserService.findByDepartment.mockResolvedValue([]);

      await controller.getByDepartment(req, res);
      expect(mockUserService.findByDepartment).toHaveBeenCalledWith("dept-1");
    });

    it("should restrict manager to own department", async () => {
      mockUserService.findById.mockResolvedValue({ id: "mgr-1", departmentId: "dept-1" });
      const req = { params: { departmentId: "dept-1" }, user: managerUser } as any;
      const res = mockRes();
      mockUserService.findByDepartment.mockResolvedValue([]);

      await controller.getByDepartment(req, res);
      expect(mockUserService.findByDepartment).toHaveBeenCalledWith("dept-1");
    });

    it("should throw 403 if manager tries to view other department", async () => {
      mockUserService.findById.mockResolvedValue({ id: "mgr-1", departmentId: "dept-1" });
      const req = { params: { departmentId: "dept-2" }, user: managerUser } as any;
      const res = mockRes();

      await expect(controller.getByDepartment(req, res)).rejects.toThrow(
        "You can only view your own department"
      );
    });
  });

  describe("getByPosition", () => {
    it("should return users by position", async () => {
      const req = { params: { positionId: "pos-1" }, user: adminUser } as any;
      const res = mockRes();
      mockUserService.findByPosition.mockResolvedValue([]);

      await controller.getByPosition(req, res);
      expect(mockUserService.findByPosition).toHaveBeenCalledWith("pos-1");
    });
  });

  describe("create", () => {
    it("should create user and return 201", async () => {
      const req = { body: { name: "John" }, user: adminUser } as any;
      const res = mockRes();
      mockUserService.create.mockResolvedValue({ id: "new-id", name: "John" });

      await controller.create(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: { id: "new-id", name: "John" } });
    });

    it("should handle avatar file upload", async () => {
      const { handleFileUpload } = await import("../../src/utils/upload/upload.js");
      const req = {
        body: { name: "John" },
        user: adminUser,
        file: { filename: "avatar-123.png" },
      } as any;
      const res = mockRes();
      mockUserService.create.mockResolvedValue({ id: "new-id" });

      await controller.create(req, res);
      expect(handleFileUpload).toHaveBeenCalledWith(req.file, "avatars");
      expect(mockUserService.create).toHaveBeenCalledWith(
        expect.objectContaining({ avatarURL: "uploads/avatars/avatar-123.png" })
      );
    });
  });

  describe("update", () => {
    it("should update user successfully", async () => {
      mockUserService.findById.mockResolvedValue({ id: "user-1", name: "Old", position: EAccountPosition.MEMBER });
      mockUserService.update.mockResolvedValue({ id: "user-1", name: "Updated" });
      const req = { params: { id: "user-1" }, body: { name: "Updated" }, user: adminUser } as any;
      const res = mockRes();

      await controller.update(req, res);
      expect(res.json).toHaveBeenCalledWith({ data: { id: "user-1", name: "Updated" } });
    });

    it("should throw 404 if target not found", async () => {
      mockUserService.findById.mockResolvedValue(null);
      const req = { params: { id: "nonexistent" }, body: {}, user: adminUser } as any;
      const res = mockRes();

      await expect(controller.update(req, res)).rejects.toThrow("User not found");
    });

    it("should throw 403 if admin tries to edit self", async () => {
      mockUserService.findById.mockResolvedValue({ id: "admin-1", name: "Admin" });
      const req = { params: { id: "admin-1" }, body: { name: "New" }, user: adminUser } as any;
      const res = mockRes();

      await expect(controller.update(req, res)).rejects.toThrow(
        "Admins cannot edit themselves here"
      );
    });

    it("should throw 403 if manager tries to edit self", async () => {
      mockUserService.findById.mockResolvedValue({ id: "mgr-1", position: EAccountPosition.MANAGER });
      const req = { params: { id: "mgr-1" }, body: {}, user: managerUser } as any;
      const res = mockRes();

      await expect(controller.update(req, res)).rejects.toThrow(
        "Managers cannot edit themselves here"
      );
    });

    it("should throw 403 if manager tries to edit manager", async () => {
      mockUserService.findById.mockResolvedValue({
        id: "other-mgr",
        position: EAccountPosition.MANAGER,
      });
      const req = { params: { id: "other-mgr" }, body: {}, user: managerUser } as any;
      const res = mockRes();

      await expect(controller.update(req, res)).rejects.toThrow(
        "Managers can only edit members"
      );
    });

    it("should handle avatar update during user update", async () => {
      const { deleteFile } = await import("../../src/utils/upload/upload.js");
      mockUserService.findById.mockResolvedValue({
        id: "user-1",
        avatarURL: "uploads/avatars/old.png",
        position: EAccountPosition.MEMBER,
      });
      mockUserService.update.mockResolvedValue({ id: "user-1" });
      const req = {
        params: { id: "user-1" },
        body: {},
        user: adminUser,
        file: { filename: "new-avatar.png" },
      } as any;
      const res = mockRes();

      await controller.update(req, res);
      expect(deleteFile).toHaveBeenCalledWith("uploads/avatars/old.png");
    });
  });

  describe("delete", () => {
    it("should soft delete user", async () => {
      mockUserService.findById.mockResolvedValue({ id: "user-1", position: EAccountPosition.MEMBER });
      const req = { params: { id: "user-1" }, user: adminUser } as any;
      const res = mockRes();

      await controller.delete(req, res);
      expect(mockUserService.delete).toHaveBeenCalledWith("user-1");
      expect(res.json).toHaveBeenCalledWith({ message: "User deleted successfully" });
    });

    it("should throw 404 if target not found", async () => {
      mockUserService.findById.mockResolvedValue(null);
      const req = { params: { id: "nonexistent" }, user: adminUser } as any;
      const res = mockRes();

      await expect(controller.delete(req, res)).rejects.toThrow("User not found");
    });

    it("should throw 403 if admin tries to delete self", async () => {
      mockUserService.findById.mockResolvedValue({ id: "admin-1" });
      const req = { params: { id: "admin-1" }, user: adminUser } as any;
      const res = mockRes();

      await expect(controller.delete(req, res)).rejects.toThrow("Admins cannot delete themselves");
    });

    it("should throw 403 if manager tries to delete self", async () => {
      mockUserService.findById.mockResolvedValue({ id: "mgr-1", position: EAccountPosition.MANAGER });
      const req = { params: { id: "mgr-1" }, user: managerUser } as any;
      const res = mockRes();

      await expect(controller.delete(req, res)).rejects.toThrow("Managers cannot delete themselves");
    });

    it("should throw 403 if manager tries to delete non-member", async () => {
      mockUserService.findById.mockResolvedValue({
        id: "other",
        position: EAccountPosition.MANAGER,
      });
      const req = { params: { id: "other" }, user: managerUser } as any;
      const res = mockRes();

      await expect(controller.delete(req, res)).rejects.toThrow(
        "Managers can only delete members"
      );
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const req = { user: { id: "user-1" }, body: { currentPassword: "old", newPassword: "new123" } } as any;
      const res = mockRes();
      mockUserService.changePassword.mockResolvedValue(undefined);

      await controller.changePassword(req, res);
      expect(mockUserService.changePassword).toHaveBeenCalledWith("user-1", req.body);
      expect(res.json).toHaveBeenCalledWith({ message: "Password updated successfully" });
    });
  });

  describe("login", () => {
    it("should set cookie and return result", async () => {
      const req = { body: { username: "johndoe", password: "pass123" } } as any;
      const res = mockRes();
      mockUserService.login.mockResolvedValue({
        user: { id: "user-1", name: "John" },
        token: "jwt-token",
      });

      await controller.login(req, res);
      expect(res.cookie).toHaveBeenCalledWith("token", "jwt-token", expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({ data: { user: { id: "user-1", name: "John" }, token: "jwt-token" } });
    });
  });

  describe("updateAvatar", () => {
    it("should update avatar successfully", async () => {
      mockUserService.findById.mockResolvedValue({ id: "user-1", avatarURL: null });
      const req = { user: { id: "user-1" }, file: { filename: "new-avatar.png" } } as any;
      const res = mockRes();

      await controller.updateAvatar(req, res);
      expect(mockUserService.updateAvatar).toHaveBeenCalledWith("user-1", "uploads/avatars/new-avatar.png");
      expect(res.json).toHaveBeenCalledWith({ message: "Avatar updated successfully" });
    });

    it("should throw 404 if user not found", async () => {
      mockUserService.findById.mockResolvedValue(null);
      const req = { user: { id: "nonexistent" }, file: { filename: "a.png" } } as any;
      const res = mockRes();

      await expect(controller.updateAvatar(req, res)).rejects.toThrow("User not found");
    });

    it("should throw 400 if no file uploaded", async () => {
      mockUserService.findById.mockResolvedValue({ id: "user-1" });
      const req = { user: { id: "user-1" } } as any;
      const res = mockRes();

      await expect(controller.updateAvatar(req, res)).rejects.toThrow("No file uploaded");
    });

    it("should delete old avatar when updating", async () => {
      const { deleteFile } = await import("../../src/utils/upload/upload.js");
      mockUserService.findById.mockResolvedValue({
        id: "user-1",
        avatarURL: "uploads/avatars/old.png",
      });
      const req = { user: { id: "user-1" }, file: { filename: "new.png" } } as any;
      const res = mockRes();

      await controller.updateAvatar(req, res);
      expect(deleteFile).toHaveBeenCalledWith("uploads/avatars/old.png");
    });
  });

  describe("logout", () => {
    it("should clear cookie and return message", async () => {
      const req = {} as any;
      const res = mockRes();

      await controller.logout(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith("token");
      expect(res.json).toHaveBeenCalledWith({ message: "Logged out successfully" });
    });
  });
});

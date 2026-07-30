import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EAccountRole, EAccountPosition } from "../../src/enums/account-role.enum.js";

const mockQuery = vi.fn();
vi.mock("../../src/config/database.js", () => ({
  default: { query: mockQuery },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

const mockUser = {
  id: "user-1",
  departmentId: "dept-1",
  positionId: "pos-1",
  employeeCode: "EMP001",
  name: "John Doe",
  email: "john@example.com",
  phone: null,
  birthDate: null,
  hireDate: null,
  gender: "other",
  username: "johndoe",
  password: "$2a$10$hashedpassword",
  role: EAccountRole.USER,
  position: EAccountPosition.MEMBER,
  status: true,
  avatarURL: null,
  lastLogin: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("UserService", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    vi.mocked(bcrypt.hash).mockReset();
    vi.mocked(bcrypt.compare).mockReset();
    vi.mocked(jwt.sign).mockReset();
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      mockQuery.mockResolvedValue({ rows: [mockUser], rowCount: 1 });
      const { default: userService } = await import("../../src/user/user.service.js");
      const user = await userService.findById("user-1");
      expect(user).toEqual(mockUser);
    });

    it("should return null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
      const { default: userService } = await import("../../src/user/user.service.js");
      const user = await userService.findById("nonexistent");
      expect(user).toBeNull();
    });
  });

  describe("findByUsername", () => {
    it("should return user when found", async () => {
      mockQuery.mockResolvedValue({ rows: [mockUser], rowCount: 1 });
      const { default: userService } = await import("../../src/user/user.service.js");
      const user = await userService.findByUsername("johndoe");
      expect(user).toEqual(mockUser);
    });

    it("should return null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
      const { default: userService } = await import("../../src/user/user.service.js");
      const user = await userService.findByUsername("unknown");
      expect(user).toBeNull();
    });
  });

  describe("findByEmployeeCode", () => {
    it("should return user when found", async () => {
      mockQuery.mockResolvedValue({ rows: [mockUser], rowCount: 1 });
      const { default: userService } = await import("../../src/user/user.service.js");
      const user = await userService.findByEmployeeCode("EMP001");
      expect(user).toEqual(mockUser);
    });
  });

  describe("findByEmail", () => {
    it("should return user when found", async () => {
      mockQuery.mockResolvedValue({ rows: [mockUser], rowCount: 1 });
      const { default: userService } = await import("../../src/user/user.service.js");
      const user = await userService.findByEmail("john@example.com");
      expect(user).toEqual(mockUser);
    });
  });

  describe("findAll", () => {
    it("should return paginated results", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: "1" }], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });
      const { default: userService } = await import("../../src/user/user.service.js");
      const result = await userService.findAll(1, 10);
      expect(result.data).toEqual([mockUser]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });
  });

  describe("findAllRaw", () => {
    it("should return all users", async () => {
      mockQuery.mockResolvedValue({ rows: [mockUser], rowCount: 1 });
      const { default: userService } = await import("../../src/user/user.service.js");
      const users = await userService.findAllRaw();
      expect(users).toEqual([mockUser]);
    });
  });

  describe("findByDepartment", () => {
    it("should return users in department", async () => {
      mockQuery.mockResolvedValue({ rows: [mockUser], rowCount: 1 });
      const { default: userService } = await import("../../src/user/user.service.js");
      const users = await userService.findByDepartment("dept-1");
      expect(users).toEqual([mockUser]);
    });
  });

  describe("findByPosition", () => {
    it("should return users with position", async () => {
      mockQuery.mockResolvedValue({ rows: [mockUser], rowCount: 1 });
      const { default: userService } = await import("../../src/user/user.service.js");
      const users = await userService.findByPosition("pos-1");
      expect(users).toEqual([mockUser]);
    });
  });

  describe("login", () => {
    it("should return user and token on success", async () => {
      mockQuery.mockResolvedValue({ rows: [mockUser], rowCount: 1 });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue("mock-token" as never);

      const { default: userService } = await import("../../src/user/user.service.js");
      const result = await userService.login("johndoe", "password123");

      expect(result.user).toBeDefined();
      expect(result.token).toBe("mock-token");
      expect(result.user).not.toHaveProperty("password");
    });

    it("should throw 401 if user not found", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
      const { default: userService } = await import("../../src/user/user.service.js");
      await expect(userService.login("unknown", "pass")).rejects.toThrow("Invalid credentials");
    });

    it("should throw 403 if account is disabled", async () => {
      mockQuery.mockResolvedValue({ rows: [{ ...mockUser, status: false }], rowCount: 1 });
      const { default: userService } = await import("../../src/user/user.service.js");
      await expect(userService.login("johndoe", "pass")).rejects.toThrow("Account is disabled");
    });

    it("should throw 401 if password is wrong", async () => {
      mockQuery.mockResolvedValue({ rows: [mockUser], rowCount: 1 });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
      const { default: userService } = await import("../../src/user/user.service.js");
      await expect(userService.login("johndoe", "wrongpass")).rejects.toThrow("Invalid credentials");
    });
  });

  describe("create", () => {
    const createData = {
      departmentId: "dept-1",
      positionId: "pos-1",
      employeeCode: "EMP001",
      name: "John Doe",
      email: "john@example.com",
      username: "johndoe",
      password: "password123",
      role: EAccountRole.USER as const,
      position: EAccountPosition.MEMBER as const,
    };

    beforeEach(() => {
      vi.mocked(bcrypt.hash).mockResolvedValue("$2a$10$hashedpassword" as never);
    });

    it("should create user successfully", async () => {
      let callCount = 0;
      mockQuery.mockImplementation(() => {
        callCount++;
        if (callCount <= 3) return Promise.resolve({ rows: [], rowCount: 0 });
        if (callCount === 4) return Promise.resolve({ rows: [{ id: "new-id" }], rowCount: 1 });
        return Promise.resolve({ rows: [{ ...mockUser, id: "new-id" }], rowCount: 1 });
      });

      const { default: userService } = await import("../../src/user/user.service.js");
      const user = await userService.create(createData);
      expect(user).toBeDefined();
    });

    it("should throw 409 if username exists", async () => {
      mockQuery.mockResolvedValue({ rows: [mockUser], rowCount: 1 });
      const { default: userService } = await import("../../src/user/user.service.js");
      await expect(userService.create(createData)).rejects.toThrow("Username already exists");
    });

    it("should throw 409 if employee code exists", async () => {
      let callCount = 0;
      mockQuery.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve({ rows: [], rowCount: 0 });
        return Promise.resolve({ rows: [mockUser], rowCount: 1 });
      });

      const { default: userService } = await import("../../src/user/user.service.js");
      await expect(userService.create(createData)).rejects.toThrow("Employee code already exists");
    });

    it("should throw 409 if email exists", async () => {
      let callCount = 0;
      mockQuery.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) return Promise.resolve({ rows: [], rowCount: 0 });
        return Promise.resolve({ rows: [mockUser], rowCount: 1 });
      });

      const { default: userService } = await import("../../src/user/user.service.js");
      await expect(userService.create(createData)).rejects.toThrow("Email already exists");
    });

    it("should throw 409 if phone exists", async () => {
      let callCount = 0;
      mockQuery.mockImplementation(() => {
        callCount++;
        if (callCount <= 3) return Promise.resolve({ rows: [], rowCount: 0 });
        return Promise.resolve({ rows: [mockUser], rowCount: 1 });
      });

      const { default: userService } = await import("../../src/user/user.service.js");
      await expect(
        userService.create({ ...createData, phone: "+84123456789" })
      ).rejects.toThrow("Phone already exists");
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      let callCount = 0;
      mockQuery.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve({ rows: [mockUser], rowCount: 1 });
        return Promise.resolve({ rows: [], rowCount: 0 });
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(bcrypt.hash).mockResolvedValue("$2a$10$newhashed" as never);

      const { default: userService } = await import("../../src/user/user.service.js");
      await userService.changePassword("user-1", {
        currentPassword: "oldpass",
        newPassword: "newpass123",
      });
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it("should throw 404 if user not found", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
      const { default: userService } = await import("../../src/user/user.service.js");
      await expect(
        userService.changePassword("nonexistent", {
          currentPassword: "old",
          newPassword: "new123",
        })
      ).rejects.toThrow("User not found");
    });

    it("should throw 400 if current password is incorrect", async () => {
      mockQuery.mockResolvedValue({ rows: [mockUser], rowCount: 1 });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
      const { default: userService } = await import("../../src/user/user.service.js");
      await expect(
        userService.changePassword("user-1", {
          currentPassword: "wrong",
          newPassword: "new123",
        })
      ).rejects.toThrow("Current password is incorrect");
    });
  });

  describe("update", () => {
    it("should update user fields", async () => {
      let callCount = 0;
      mockQuery.mockImplementation(() => {
        callCount++;
        if (callCount <= 4) return Promise.resolve({ rows: [], rowCount: 0 });
        if (callCount === 5) return Promise.resolve({ rows: [{ ...mockUser, name: "Updated Name" }], rowCount: 1 });
        return Promise.resolve({ rows: [{ ...mockUser, name: "Updated Name" }], rowCount: 1 });
      });

      const { default: userService } = await import("../../src/user/user.service.js");
      const user = await userService.update("user-1", { name: "Updated Name" });
      expect(user).toBeDefined();
    });

    it("should return existing user if no fields to update", async () => {
      mockQuery.mockResolvedValue({ rows: [mockUser], rowCount: 1 });
      const { default: userService } = await import("../../src/user/user.service.js");
      const user = await userService.update("user-1", {});
      expect(user).toEqual(mockUser);
    });

    it("should throw 409 if updating to existing username", async () => {
      mockQuery.mockResolvedValue({ rows: [{ ...mockUser, id: "other-id" }], rowCount: 1 });
      const { default: userService } = await import("../../src/user/user.service.js");
      await expect(
        userService.update("user-1", { username: "taken" })
      ).rejects.toThrow("Username already exists");
    });
  });

  describe("updateAvatar", () => {
    it("should update avatar URL", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
      const { default: userService } = await import("../../src/user/user.service.js");
      await userService.updateAvatar("user-1", "uploads/avatars/new-avatar.png");
    });
  });

  describe("updateLastLogin", () => {
    it("should update last_login", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
      const { default: userService } = await import("../../src/user/user.service.js");
      await userService.updateLastLogin("user-1");
    });
  });

  describe("delete", () => {
    it("should soft delete user by setting status to false", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
      const { default: userService } = await import("../../src/user/user.service.js");
      await userService.delete("user-1");
    });
  });
});

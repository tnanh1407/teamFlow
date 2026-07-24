import pool from "../../src/config/database.js";
import userService from "../../src/services/user.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";
import bcrypt from "bcryptjs";
import { EUserRole } from "../../src/enums/user-role.enum.js";

const fakeUser = {
  id: "user-1",
  employeeId: "emp-1",
  username: "testuser",
  password: "$2a$10$hashedpassword",
  role: EUserRole.USER,
  status: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

describe("UserService", () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    (pool.query as jest.Mock) = mockQuery;
  });

  describe("findAll", () => {
    it("returns all users", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeUser] });
      const result = await userService.findAll();
      expect(result).toEqual([fakeUser]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SELECT")
      );
    });

    it("returns empty array when no users", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await userService.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("returns user when found", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeUser] });
      const result = await userService.findById("user-1");
      expect(result).toEqual(fakeUser);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = $1"),
        ["user-1"]
      );
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await userService.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByUsername", () => {
    it("returns user when found", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeUser] });
      const result = await userService.findByUsername("testuser");
      expect(result).toEqual(fakeUser);
    });
  });

  describe("create", () => {
    const createData = {
      employeeId: "emp-2",
      username: "newuser",
      password: "plainpassword",
      role: EUserRole.USER,
      status: true,
    };

    it("creates user successfully", async () => {
      jest.spyOn(bcrypt, "hash").mockResolvedValue("$2a$10$hashed" as never);
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...fakeUser, id: "user-2", username: "newuser" }] });

      const result = await userService.create(createData);
      expect(result).toBeDefined();
      expect(result.username).toBe("newuser");
    });

    it("throws 409 when username already exists", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [fakeUser] });
      await expect(userService.create(createData)).rejects.toThrow(
        new AppError("Username already exists", 409)
      );
    });

    it("throws 409 when employee ID already exists", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [fakeUser] });
      await expect(userService.create(createData)).rejects.toThrow(
        new AppError("Employee ID already exists", 409)
      );
    });
  });

  describe("update", () => {
    it("updates username successfully", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...fakeUser, username: "updated" }] });

      const result = await userService.update("user-1", { username: "updated" });
      expect(result).toBeDefined();
      expect(result!.username).toBe("updated");
    });

    it("returns null when user not found", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await userService.update("user-1", { username: "new" });
      expect(result).toBeNull();
    });

    it("throws 409 when username conflicts", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ ...fakeUser, id: "other-user", username: "existing" }],
      });

      await expect(
        userService.update("user-1", { username: "existing" })
      ).rejects.toThrow(new AppError("Username already exists", 409));
    });

    it("returns current user when no fields provided", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [fakeUser] });

      const result = await userService.update("user-1", {});
      expect(result).toEqual(fakeUser);
    });
  });

  describe("delete", () => {
    it("deletes user successfully", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeUser] });
      const result = await userService.delete("user-1");
      expect(result).toEqual(fakeUser);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE"),
        ["user-1"]
      );
    });

    it("returns null when user not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await userService.delete("nonexistent");
      expect(result).toBeNull();
    });
  });
});

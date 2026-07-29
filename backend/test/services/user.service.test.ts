import pool from "../../src/config/database.js";
import accountService from "../../src/account/account.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";
import bcrypt from "bcryptjs";
import { EAccountRole } from "../../src/enums/account-role.enum.js";

const fakeAccount = {
  id: "account-1",
  employeeId: "emp-1",
  username: "testuser",
  password: "$2a$10$hashedpassword",
  role: EAccountRole.USER,
  status: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

describe("AccountService", () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    (pool.query as jest.Mock) = mockQuery;
  });

  describe("findAll", () => {
    it("returns all accounts", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeAccount] });
      const result = await accountService.findAll();
      expect(result).toEqual([fakeAccount]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SELECT")
      );
    });

    it("returns empty array when no accounts", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await accountService.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("returns account when found", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeAccount] });
      const result = await accountService.findById("account-1");
      expect(result).toEqual(fakeAccount);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = $1"),
        ["account-1"]
      );
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await accountService.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByUsername", () => {
    it("returns account when found", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeAccount] });
      const result = await accountService.findByUsername("testuser");
      expect(result).toEqual(fakeAccount);
    });
  });

  describe("create", () => {
    const createData = {
      employeeId: "emp-2",
      username: "newuser",
      password: "plainpassword",
      role: EAccountRole.USER,
      status: true,
    };

    it("creates account successfully", async () => {
      jest.spyOn(bcrypt, "hash").mockResolvedValue("$2a$10$hashed" as never);
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...fakeAccount, id: "account-2", username: "newuser" }] });

      const result = await accountService.create(createData);
      expect(result).toBeDefined();
      expect(result.username).toBe("newuser");
    });

    it("throws 409 when username already exists", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [fakeAccount] });
      await expect(accountService.create(createData)).rejects.toThrow(
        new AppError("Username already exists", 409)
      );
    });

    it("throws 409 when employee ID already exists", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [fakeAccount] });
      await expect(accountService.create(createData)).rejects.toThrow(
        new AppError("Employee ID already exists", 409)
      );
    });
  });

  describe("update", () => {
    it("updates username successfully", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...fakeAccount, username: "updated" }] });

      const result = await accountService.update("account-1", { username: "updated" });
      expect(result).toBeDefined();
      expect(result!.username).toBe("updated");
    });

    it("returns null when account not found", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await accountService.update("account-1", { username: "new" });
      expect(result).toBeNull();
    });

    it("throws 409 when username conflicts", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ ...fakeAccount, id: "other-account", username: "existing" }],
      });

      await expect(
        accountService.update("account-1", { username: "existing" })
      ).rejects.toThrow(new AppError("Username already exists", 409));
    });

    it("returns current account when no fields provided", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [fakeAccount] });

      const result = await accountService.update("account-1", {});
      expect(result).toEqual(fakeAccount);
    });
  });

  describe("delete", () => {
    it("deletes account successfully", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeAccount] });
      const result = await accountService.delete("account-1");
      expect(result).toEqual(fakeAccount);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE"),
        ["account-1"]
      );
    });

    it("returns null when account not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await accountService.delete("nonexistent");
      expect(result).toBeNull();
    });
  });
});

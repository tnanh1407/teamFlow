import pool from "../../src/config/database.js";
import employeeService from "../../src/employee/employee.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";

const fakeEmployee = {
  id: "emp-1",
  departmentId: "dept-1",
  positionId: "pos-1",
  employeeCode: "EMP001",
  name: "John Doe",
  email: "john@example.com",
  phone: "0123456789",
  birthDate: "1990-01-01",
  hireDate: "2024-01-01",
  gender: "male",
  status: "active",
  avatarURL: "/uploads/avatars/avatar.jpg",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  deletedAt: null,
};

describe("EmployeeService", () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    (pool.query as jest.Mock) = mockQuery;
  });

  describe("findAll", () => {
    it("returns all non-deleted employees", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeEmployee] });
      const result = await employeeService.findAll();
      expect(result).toEqual([fakeEmployee]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("deleted_at IS NULL")
      );
    });

    it("returns empty when none exist", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await employeeService.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("returns employee when found", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeEmployee] });
      const result = await employeeService.findById("emp-1");
      expect(result).toEqual(fakeEmployee);
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await employeeService.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByDepartment", () => {
    it("returns employees in department", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeEmployee] });
      const result = await employeeService.findByDepartment("dept-1");
      expect(result).toEqual([fakeEmployee]);
    });
  });

  describe("findByPosition", () => {
    it("returns employees in position", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeEmployee] });
      const result = await employeeService.findByPosition("pos-1");
      expect(result).toEqual([fakeEmployee]);
    });
  });

  describe("create", () => {
    const createData = {
      departmentId: "dept-1",
      positionId: "pos-1",
      employeeCode: "EMP002",
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "0987654321",
    };

    it("creates employee successfully", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...fakeEmployee, id: "emp-2", employeeCode: "EMP002", email: "jane@example.com" }] });

      const result = await employeeService.create(createData);
      expect(result).toBeDefined();
      expect(result.email).toBe("jane@example.com");
    });

    it("throws 409 when employee code exists", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [fakeEmployee] });
      await expect(employeeService.create(createData)).rejects.toThrow(
        new AppError("Employee code already exists", 409)
      );
    });

    it("throws 409 when email exists", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [fakeEmployee] });
      await expect(employeeService.create(createData)).rejects.toThrow(
        new AppError("Email already exists", 409)
      );
    });
  });

  describe("update", () => {
    it("updates employee name successfully", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ ...fakeEmployee, name: "Updated Name" }] });

      const result = await employeeService.update("emp-1", { name: "Updated Name" });
      expect(result).toBeDefined();
      expect(result!.name).toBe("Updated Name");
    });

    it("updates with employeeCode, email, phone", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...fakeEmployee, employeeCode: "EMP003", email: "new@example.com", phone: "0999999999" }] });

      const result = await employeeService.update("emp-1", {
        employeeCode: "EMP003",
        email: "new@example.com",
        phone: "0999999999",
      });
      expect(result).toBeDefined();
    });

    it("throws 409 when email conflicts", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ ...fakeEmployee, id: "other-emp" }],
      });
      await expect(
        employeeService.update("emp-1", { email: "existing@example.com" })
      ).rejects.toThrow(new AppError("Email already exists", 409));
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      const result = await employeeService.update("emp-1", { name: "New" });
      expect(result).toBeNull();
    });
  });

  describe("deleteSoft", () => {
    it("soft deletes employee", async () => {
      mockQuery.mockResolvedValue({ rows: [{ ...fakeEmployee, deletedAt: new Date() }] });
      const result = await employeeService.deleteSoft("emp-1");
      expect(result).toBeDefined();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SET deleted_at = now()"),
        ["emp-1"]
      );
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await employeeService.deleteSoft("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("deleteHard", () => {
    it("hard deletes employee", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeEmployee] });
      const result = await employeeService.deleteHard("emp-1");
      expect(result).toEqual(fakeEmployee);
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await employeeService.deleteHard("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("restore", () => {
    it("restores deleted employee", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeEmployee] });
      const result = await employeeService.restore("emp-1");
      expect(result).toEqual(fakeEmployee);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SET deleted_at = NULL"),
        ["emp-1"]
      );
    });

    it("returns null when not deleted", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await employeeService.restore("emp-1");
      expect(result).toBeNull();
    });
  });

  describe("findAllDeleted", () => {
    it("returns all deleted employees", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeEmployee] });
      const result = await employeeService.findAllDeleted();
      expect(result).toEqual([fakeEmployee]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("deleted_at IS NOT NULL")
      );
    });
  });
});

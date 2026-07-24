import pool from "../../src/config/database.js";
import departmentService from "../../src/services/department.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";

const fakeDepartment = {
  id: "dept-1",
  name: "Engineering",
  code: "ENG",
  description: "Engineering department",
  managerId: "emp-1",
  isActive: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

describe("DepartmentService", () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    (pool.query as jest.Mock) = mockQuery;
  });

  describe("findAll", () => {
    it("returns all departments", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeDepartment] });
      const result = await departmentService.findAll();
      expect(result).toEqual([fakeDepartment]);
    });

    it("returns empty array when none exist", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await departmentService.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("returns department when found", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeDepartment] });
      const result = await departmentService.findById("dept-1");
      expect(result).toEqual(fakeDepartment);
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await departmentService.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByName", () => {
    it("returns department by name", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeDepartment] });
      const result = await departmentService.findByName("Engineering");
      expect(result).toEqual(fakeDepartment);
    });
  });

  describe("findByCode", () => {
    it("returns department by code", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeDepartment] });
      const result = await departmentService.findByCode("ENG");
      expect(result).toEqual(fakeDepartment);
    });
  });

  describe("create", () => {
    const createData = { name: "HR", code: "HR", description: "Human Resources" };

    it("creates department successfully", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...fakeDepartment, id: "dept-2", name: "HR", code: "HR" }] });

      const result = await departmentService.create(createData);
      expect(result).toBeDefined();
      expect(result.name).toBe("HR");
    });

    it("throws 409 when name already exists", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [fakeDepartment] });
      await expect(departmentService.create(createData)).rejects.toThrow(
        new AppError("Department name already exists", 409)
      );
    });

    it("throws 409 when code already exists", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [fakeDepartment] });
      await expect(departmentService.create(createData)).rejects.toThrow(
        new AppError("Department code already exists", 409)
      );
    });
  });

  describe("update", () => {
    it("updates name successfully", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...fakeDepartment, name: "Updated Dept" }] });

      const result = await departmentService.update("dept-1", { name: "Updated Dept" });
      expect(result).toBeDefined();
      expect(result!.name).toBe("Updated Dept");
    });

    it("throws 409 when name conflicts", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ ...fakeDepartment, id: "other-dept", name: "Existing" }],
      });
      await expect(
        departmentService.update("dept-1", { name: "Existing" })
      ).rejects.toThrow(new AppError("Department name already exists", 409));
    });

    it("returns null when not found", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await departmentService.update("nonexistent", { name: "New" });
      expect(result).toBeNull();
    });

    it("returns current department when no fields provided", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [fakeDepartment] });

      const result = await departmentService.update("dept-1", {});
      expect(result).toEqual(fakeDepartment);
    });
  });

  describe("delete", () => {
    it("deletes department successfully", async () => {
      mockQuery.mockResolvedValue({ rows: [fakeDepartment] });
      const result = await departmentService.delete("dept-1");
      expect(result).toEqual(fakeDepartment);
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await departmentService.delete("nonexistent");
      expect(result).toBeNull();
    });
  });
});

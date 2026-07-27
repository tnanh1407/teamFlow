import pool from "../../src/config/database.js";
import projectEmployeeService from "../../src/project/project-employee.service.js";

const mockQuery = jest.fn();
pool.query = mockQuery;

const baseRow = {
  id: "pe-1",
  projectId: "proj-1",
  employeeId: "emp-1",
  role: "member",
  assignedAt: new Date("2024-01-01"),
};

describe("ProjectEmployeeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns all assignments", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectEmployeeService.findAll();
      expect(result).toEqual([baseRow]);
    });
  });

  describe("findById", () => {
    it("returns assignment when found", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectEmployeeService.findById("pe-1");
      expect(result).toEqual(baseRow);
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await projectEmployeeService.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByProject", () => {
    it("returns employees for a project", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectEmployeeService.findByProject("proj-1");
      expect(result).toEqual([baseRow]);
    });
  });

  describe("findByEmployee", () => {
    it("returns projects for an employee", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectEmployeeService.findByEmployee("emp-1");
      expect(result).toEqual([baseRow]);
    });
  });

  describe("create", () => {
    it("inserts assignment with default role", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectEmployeeService.create({
        projectId: "proj-1",
        employeeId: "emp-1",
      });
      expect(result).toEqual(baseRow);
      expect(mockQuery.mock.calls[0][1][2]).toBe("member");
    });

    it("inserts assignment with specified role", async () => {
      mockQuery.mockResolvedValue({ rows: { ...baseRow, role: "leader" } });
      await projectEmployeeService.create({
        projectId: "proj-1",
        employeeId: "emp-1",
        role: "leader",
      });
      expect(mockQuery.mock.calls[0][1][2]).toBe("leader");
    });
  });

  describe("update", () => {
    it("updates assignment role", async () => {
      const updated = { ...baseRow, role: "reviewer" };
      mockQuery.mockResolvedValue({ rows: [updated] });
      const result = await projectEmployeeService.update("pe-1", { role: "reviewer" });
      expect(result?.role).toBe("reviewer");
    });
  });

  describe("delete", () => {
    it("deletes assignment by id", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectEmployeeService.delete("pe-1");
      expect(result).toEqual(baseRow);
    });
  });

  describe("deleteByProjectAndEmployee", () => {
    it("deletes assignment by project and employee", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectEmployeeService.deleteByProjectAndEmployee("proj-1", "emp-1");
      expect(result).toEqual(baseRow);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM project_employees"),
        ["proj-1", "emp-1"]
      );
    });
  });
});
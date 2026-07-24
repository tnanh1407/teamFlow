import pool from "../../src/config/database.js";
import projectDepartmentService from "../../src/services/project-department.service.js";

const mockQuery = jest.fn();
pool.query = mockQuery;

const baseRow = {
  projectId: "proj-1",
  departmentId: "dept-1",
  assignedAt: new Date("2024-01-01"),
};

describe("ProjectDepartmentService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns all assignments", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectDepartmentService.findAll();
      expect(result).toEqual([baseRow]);
    });
  });

  describe("findByProject", () => {
    it("returns departments for a project", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectDepartmentService.findByProject("proj-1");
      expect(result).toEqual([baseRow]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE project_id = $1"),
        ["proj-1"]
      );
    });
  });

  describe("findByDepartment", () => {
    it("returns projects for a department", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectDepartmentService.findByDepartment("dept-1");
      expect(result).toEqual([baseRow]);
    });
  });

  describe("create", () => {
    it("inserts assignment", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectDepartmentService.create({
        projectId: "proj-1",
        departmentId: "dept-1",
      });
      expect(result).toEqual(baseRow);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO project_departments"),
        ["proj-1", "dept-1"]
      );
    });
  });

  describe("delete", () => {
    it("deletes assignment", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectDepartmentService.delete("proj-1", "dept-1");
      expect(result).toEqual(baseRow);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM project_departments"),
        ["proj-1", "dept-1"]
      );
    });

    it("returns null if not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await projectDepartmentService.delete("x", "y");
      expect(result).toBeNull();
    });
  });
});
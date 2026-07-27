import pool from "../../src/config/database.js";
import projectLogService from "../../src/project/project-log.service.js";

const mockQuery = jest.fn();
pool.query = mockQuery;

const baseRow = {
  id: "pl-1",
  projectId: "proj-1",
  employeeId: "emp-1",
  action: "created",
  description: "Project created",
  createdAt: new Date("2024-01-01"),
};

describe("ProjectLogService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns all logs", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectLogService.findAll();
      expect(result).toEqual([baseRow]);
    });
  });

  describe("findById", () => {
    it("returns log when found", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectLogService.findById("pl-1");
      expect(result).toEqual(baseRow);
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await projectLogService.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByProject", () => {
    it("returns logs for a project", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectLogService.findByProject("proj-1");
      expect(result).toEqual([baseRow]);
    });
  });

  describe("findByEmployee", () => {
    it("returns logs by employee", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectLogService.findByEmployee("emp-1");
      expect(result).toEqual([baseRow]);
    });
  });

  describe("create", () => {
    it("inserts a log entry", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectLogService.create({
        projectId: "proj-1",
        employeeId: "emp-1",
        action: "created",
        description: "Project created",
      });
      expect(result).toEqual(baseRow);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO project_logs"),
        expect.arrayContaining(["proj-1", "emp-1", "created"])
      );
    });
  });
});
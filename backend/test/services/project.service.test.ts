import pool from "../../src/config/database.js";
import projectService from "../../src/services/project.service.js";

const mockQuery = jest.fn();
pool.query = mockQuery;

const baseRow = {
  id: "proj-1",
  title: "Test Project",
  description: "A test project",
  priority: "medium",
  status: "todo",
  progress: 0,
  startDate: null,
  dueDate: null,
  assignedBy: null,
  createdBy: "emp-1",
  updatedBy: null,
  completedBy: null,
  estimatedHours: null,
  actualHours: null,
  completedAt: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("ProjectService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns all projects", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectService.findAll();
      expect(result).toEqual([baseRow]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SELECT")
      );
    });

    it("returns empty array when no projects exist", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await projectService.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("returns project when found", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectService.findById("proj-1");
      expect(result).toEqual(baseRow);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = $1"),
        ["proj-1"]
      );
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await projectService.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByStatus", () => {
    it("returns projects filtered by status", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectService.findByStatus("todo");
      expect(result).toEqual([baseRow]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE status = $1"),
        ["todo"]
      );
    });
  });

  describe("findByPriority", () => {
    it("returns projects filtered by priority", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectService.findByPriority("high");
      expect(result).toEqual([baseRow]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE priority = $1"),
        ["high"]
      );
    });
  });

  describe("findByCreatedBy", () => {
    it("returns projects filtered by creator", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectService.findByCreatedBy("emp-1");
      expect(result).toEqual([baseRow]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE created_by = $1"),
        ["emp-1"]
      );
    });
  });

  describe("create", () => {
    it("inserts a new project and returns it", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const data = {
        title: "Test Project",
        description: "A test project",
        createdBy: "emp-1",
      };
      const result = await projectService.create(data);
      expect(result).toEqual(baseRow);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO projects"),
        expect.arrayContaining([data.title])
      );
    });

    it("applies default values for omitted fields", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      await projectService.create({ title: "Minimal", createdBy: "emp-1" });
      const callArgs = mockQuery.mock.calls[0][1];
      expect(callArgs[2]).toBe("medium");
      expect(callArgs[3]).toBe("todo");
      expect(callArgs[4]).toBe(0);
    });
  });

  describe("update", () => {
    it("updates project fields partially", async () => {
      const updatedRow = { ...baseRow, title: "Updated" };
      mockQuery.mockResolvedValue({ rows: [updatedRow] });
      const result = await projectService.update("proj-1", { title: "Updated" });
      expect(result?.title).toBe("Updated");
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE projects SET"),
        expect.arrayContaining(["Updated", "proj-1"])
      );
    });

    it("returns null when project not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await projectService.update("nonexistent", { title: "Nope" });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("deletes project and returns it", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectService.delete("proj-1");
      expect(result).toEqual(baseRow);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM projects"),
        ["proj-1"]
      );
    });

    it("returns null when project not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await projectService.delete("nonexistent");
      expect(result).toBeNull();
    });
  });
});
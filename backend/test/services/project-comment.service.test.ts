import pool from "../../src/config/database.js";
import projectCommentService from "../../src/project/project-comment.service.js";

const mockQuery = jest.fn();
pool.query = mockQuery;

const baseRow = {
  id: "pc-1",
  projectId: "proj-1",
  employeeId: "emp-1",
  content: "Great work",
  attachments: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("ProjectCommentService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns all comments", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectCommentService.findAll();
      expect(result).toEqual([baseRow]);
    });
  });

  describe("findById", () => {
    it("returns comment when found", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectCommentService.findById("pc-1");
      expect(result).toEqual(baseRow);
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const result = await projectCommentService.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findByProject", () => {
    it("returns comments for a project", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectCommentService.findByProject("proj-1");
      expect(result).toEqual([baseRow]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE project_id = $1"),
        ["proj-1"]
      );
    });
  });

  describe("findByEmployee", () => {
    it("returns comments by employee", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectCommentService.findByEmployee("emp-1");
      expect(result).toEqual([baseRow]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("employee_id = $1"),
        ["emp-1"]
      );
    });
  });

  describe("create", () => {
    it("inserts a comment", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectCommentService.create({
        projectId: "proj-1",
        employeeId: "emp-1",
        content: "Great work",
      });
      expect(result).toEqual(baseRow);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO project_comments"),
        expect.arrayContaining(["proj-1", "emp-1", "Great work"])
      );
    });
  });

  describe("update", () => {
    it("updates comment content", async () => {
      const updated = { ...baseRow, content: "Updated" };
      mockQuery.mockResolvedValue({ rows: [updated] });
      const result = await projectCommentService.update("pc-1", { content: "Updated" });
      expect(result?.content).toBe("Updated");
    });
  });

  describe("delete", () => {
    it("deletes comment", async () => {
      mockQuery.mockResolvedValue({ rows: [baseRow] });
      const result = await projectCommentService.delete("pc-1");
      expect(result).toEqual(baseRow);
    });
  });
});
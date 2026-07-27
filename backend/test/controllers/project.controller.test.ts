import { Request, Response } from "express";
import projectService from "../../src/project/project.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";

jest.mock("../../src/project/project.service.js");

import projectController from "../../src/project/project.controller.js";

const mockProjectService = jest.mocked(projectService);

function mockReq(overrides: Partial<Request> = {}): Request {
  return { params: {}, body: {}, ...overrides } as Request;
}
function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const fakeProject = {
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

describe("ProjectController", () => {
  let res: Response;

  beforeEach(() => {
    res = mockRes();
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("returns all projects", async () => {
      mockProjectService.findAll.mockResolvedValue([fakeProject]);
      await projectController.getAll(mockReq(), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeProject] });
    });

    it("handles empty list", async () => {
      mockProjectService.findAll.mockResolvedValue([]);
      await projectController.getAll(mockReq(), res);
      expect(res.json).toHaveBeenCalledWith({ data: [] });
    });
  });

  describe("getById", () => {
    it("returns project when found", async () => {
      mockProjectService.findById.mockResolvedValue(fakeProject);
      await projectController.getById(mockReq({ params: { id: "proj-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: fakeProject });
    });

    it("throws 404 when not found", async () => {
      mockProjectService.findById.mockResolvedValue(null);
      await expect(
        projectController.getById(mockReq({ params: { id: "nonexistent" } }), res)
      ).rejects.toThrow(new AppError("Project not found", 404));
    });
  });

  describe("getByStatus", () => {
    it("returns projects by status", async () => {
      mockProjectService.findByStatus.mockResolvedValue([fakeProject]);
      await projectController.getByStatus(mockReq({ params: { status: "todo" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeProject] });
    });
  });

  describe("getByPriority", () => {
    it("returns projects by priority", async () => {
      mockProjectService.findByPriority.mockResolvedValue([fakeProject]);
      await projectController.getByPriority(mockReq({ params: { priority: "high" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeProject] });
    });
  });

  describe("getByCreatedBy", () => {
    it("returns projects by creator", async () => {
      mockProjectService.findByCreatedBy.mockResolvedValue([fakeProject]);
      await projectController.getByCreatedBy(mockReq({ params: { employeeId: "emp-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeProject] });
    });
  });

  describe("create", () => {
    it("creates a project and returns 201", async () => {
      mockProjectService.create.mockResolvedValue(fakeProject);
      await projectController.create(mockReq({ body: { title: "Test", createdBy: "emp-1" } }), res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: fakeProject });
    });
  });

  describe("update", () => {
    it("updates project when found", async () => {
      const updated = { ...fakeProject, title: "Updated" };
      mockProjectService.update.mockResolvedValue(updated);
      await projectController.update(mockReq({ params: { id: "proj-1" }, body: { title: "Updated" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: updated });
    });

    it("throws 404 when not found", async () => {
      mockProjectService.update.mockResolvedValue(null);
      await expect(
        projectController.update(mockReq({ params: { id: "nonexistent" }, body: { title: "Nope" } }), res)
      ).rejects.toThrow(new AppError("Project not found", 404));
    });
  });

  describe("delete", () => {
    it("deletes project when found", async () => {
      mockProjectService.delete.mockResolvedValue(fakeProject);
      await projectController.delete(mockReq({ params: { id: "proj-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ message: "Project deleted successfully" });
    });

    it("throws 404 when not found", async () => {
      mockProjectService.delete.mockResolvedValue(null);
      await expect(
        projectController.delete(mockReq({ params: { id: "nonexistent" } }), res)
      ).rejects.toThrow(new AppError("Project not found", 404));
    });
  });
});

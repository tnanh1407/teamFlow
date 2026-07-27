import { Request, Response } from "express";
import projectCommentService from "../../src/project/project-comment.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";

jest.mock("../../src/project/project-comment.service.js");

import projectCommentController from "../../src/project/project-comment.controller.js";

const mockCommentService = jest.mocked(projectCommentService);

function mockReq(overrides: Partial<Request> = {}): Request {
  return { params: {}, body: {}, ...overrides } as Request;
}
function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const fakeComment = {
  id: "pc-1",
  projectId: "proj-1",
  employeeId: "emp-1",
  content: "Great work",
  attachments: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("ProjectCommentController", () => {
  let res: Response;

  beforeEach(() => {
    res = mockRes();
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("returns all comments", async () => {
      mockCommentService.findAll.mockResolvedValue([fakeComment]);
      await projectCommentController.getAll(mockReq(), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeComment] });
    });
  });

  describe("getById", () => {
    it("returns comment when found", async () => {
      mockCommentService.findById.mockResolvedValue(fakeComment);
      await projectCommentController.getById(mockReq({ params: { id: "pc-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: fakeComment });
    });

    it("throws 404 when not found", async () => {
      mockCommentService.findById.mockResolvedValue(null);
      await expect(
        projectCommentController.getById(mockReq({ params: { id: "x" } }), res)
      ).rejects.toThrow(new AppError("Comment not found", 404));
    });
  });

  describe("getByProject", () => {
    it("returns comments for project", async () => {
      mockCommentService.findByProject.mockResolvedValue([fakeComment]);
      await projectCommentController.getByProject(mockReq({ params: { projectId: "proj-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeComment] });
    });
  });

  describe("getByEmployee", () => {
    it("returns comments by employee", async () => {
      mockCommentService.findByEmployee.mockResolvedValue([fakeComment]);
      await projectCommentController.getByEmployee(mockReq({ params: { employeeId: "emp-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeComment] });
    });
  });

  describe("create", () => {
    it("creates comment and returns 201", async () => {
      mockCommentService.create.mockResolvedValue(fakeComment);
      await projectCommentController.create(mockReq({ body: { projectId: "proj-1", employeeId: "emp-1" } }), res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: fakeComment });
    });
  });

  describe("update", () => {
    it("updates comment when found", async () => {
      const updated = { ...fakeComment, content: "Updated" };
      mockCommentService.update.mockResolvedValue(updated);
      await projectCommentController.update(mockReq({ params: { id: "pc-1" }, body: { content: "Updated" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: updated });
    });

    it("throws 404 when not found", async () => {
      mockCommentService.update.mockResolvedValue(null);
      await expect(
        projectCommentController.update(mockReq({ params: { id: "x" }, body: { content: "Nope" } }), res)
      ).rejects.toThrow(new AppError("Comment not found", 404));
    });
  });

  describe("delete", () => {
    it("deletes comment when found", async () => {
      mockCommentService.delete.mockResolvedValue(fakeComment);
      await projectCommentController.delete(mockReq({ params: { id: "pc-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ message: "Comment deleted successfully" });
    });
  });
});

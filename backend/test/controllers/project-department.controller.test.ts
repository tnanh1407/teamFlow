import { Request, Response } from "express";
import projectDepartmentService from "../../src/project/project-department.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";

jest.mock("../../src/project/project-department.service.js");

import projectDepartmentController from "../../src/project/project-department.controller.js";

const mockDeptService = jest.mocked(projectDepartmentService);

function mockReq(overrides: Partial<Request> = {}): Request {
  return { params: {}, body: {}, ...overrides } as Request;
}
function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const fakeAssignment = {
  projectId: "proj-1",
  departmentId: "dept-1",
  assignedAt: new Date("2024-01-01"),
};

describe("ProjectDepartmentController", () => {
  let res: Response;

  beforeEach(() => {
    res = mockRes();
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("returns all assignments", async () => {
      mockDeptService.findAll.mockResolvedValue([fakeAssignment]);
      await projectDepartmentController.getAll(mockReq(), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeAssignment] });
    });
  });

  describe("getByProject", () => {
    it("returns departments for project", async () => {
      mockDeptService.findByProject.mockResolvedValue([fakeAssignment]);
      await projectDepartmentController.getByProject(mockReq({ params: { projectId: "proj-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeAssignment] });
    });
  });

  describe("getByDepartment", () => {
    it("returns projects for department", async () => {
      mockDeptService.findByDepartment.mockResolvedValue([fakeAssignment]);
      await projectDepartmentController.getByDepartment(mockReq({ params: { departmentId: "dept-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeAssignment] });
    });
  });

  describe("create", () => {
    it("creates assignment and returns 201", async () => {
      mockDeptService.create.mockResolvedValue(fakeAssignment);
      await projectDepartmentController.create(mockReq({ body: { projectId: "proj-1", departmentId: "dept-1" } }), res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: fakeAssignment });
    });
  });

  describe("delete", () => {
    it("deletes assignment when found", async () => {
      mockDeptService.delete.mockResolvedValue(fakeAssignment);
      await projectDepartmentController.delete(
        mockReq({ params: { projectId: "proj-1", departmentId: "dept-1" } }),
        res
      );
      expect(res.json).toHaveBeenCalledWith({ message: "Assignment deleted successfully" });
    });

    it("throws 404 when not found", async () => {
      mockDeptService.delete.mockResolvedValue(null);
      await expect(
        projectDepartmentController.delete(mockReq({ params: { projectId: "x", departmentId: "y" } }), res)
      ).rejects.toThrow(new AppError("Assignment not found", 404));
    });
  });
});

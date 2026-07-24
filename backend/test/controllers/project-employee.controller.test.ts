import { Request, Response } from "express";
import projectEmployeeService from "../../src/services/project-employee.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";

jest.mock("../../src/services/project-employee.service.js");

import projectEmployeeController from "../../src/controllers/project-employee.controller.js";

const mockEmpService = jest.mocked(projectEmployeeService);

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
  id: "pe-1",
  projectId: "proj-1",
  employeeId: "emp-1",
  role: "member",
  assignedAt: new Date("2024-01-01"),
};

describe("ProjectEmployeeController", () => {
  let res: Response;

  beforeEach(() => {
    res = mockRes();
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("returns all assignments", async () => {
      mockEmpService.findAll.mockResolvedValue([fakeAssignment]);
      await projectEmployeeController.getAll(mockReq(), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeAssignment] });
    });
  });

  describe("getById", () => {
    it("returns assignment when found", async () => {
      mockEmpService.findById.mockResolvedValue(fakeAssignment);
      await projectEmployeeController.getById(mockReq({ params: { id: "pe-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: fakeAssignment });
    });

    it("throws 404 when not found", async () => {
      mockEmpService.findById.mockResolvedValue(null);
      await expect(
        projectEmployeeController.getById(mockReq({ params: { id: "x" } }), res)
      ).rejects.toThrow(new AppError("Assignment not found", 404));
    });
  });

  describe("getByProject", () => {
    it("returns employees for project", async () => {
      mockEmpService.findByProject.mockResolvedValue([fakeAssignment]);
      await projectEmployeeController.getByProject(mockReq({ params: { projectId: "proj-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeAssignment] });
    });
  });

  describe("getByEmployee", () => {
    it("returns projects for employee", async () => {
      mockEmpService.findByEmployee.mockResolvedValue([fakeAssignment]);
      await projectEmployeeController.getByEmployee(mockReq({ params: { employeeId: "emp-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeAssignment] });
    });
  });

  describe("create", () => {
    it("creates assignment and returns 201", async () => {
      mockEmpService.create.mockResolvedValue(fakeAssignment);
      await projectEmployeeController.create(mockReq({ body: { projectId: "proj-1", employeeId: "emp-1" } }), res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: fakeAssignment });
    });
  });

  describe("update", () => {
    it("updates assignment when found", async () => {
      const updated = { ...fakeAssignment, role: "leader" };
      mockEmpService.update.mockResolvedValue(updated);
      await projectEmployeeController.update(mockReq({ params: { id: "pe-1" }, body: { role: "leader" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: updated });
    });

    it("throws 404 when not found", async () => {
      mockEmpService.update.mockResolvedValue(null);
      await expect(
        projectEmployeeController.update(mockReq({ params: { id: "x" }, body: { role: "leader" } }), res)
      ).rejects.toThrow(new AppError("Assignment not found", 404));
    });
  });

  describe("delete", () => {
    it("deletes assignment when found", async () => {
      mockEmpService.delete.mockResolvedValue(fakeAssignment);
      await projectEmployeeController.delete(mockReq({ params: { id: "pe-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ message: "Assignment deleted successfully" });
    });

    it("throws 404 when not found", async () => {
      mockEmpService.delete.mockResolvedValue(null);
      await expect(
        projectEmployeeController.delete(mockReq({ params: { id: "x" } }), res)
      ).rejects.toThrow(new AppError("Assignment not found", 404));
    });
  });
});

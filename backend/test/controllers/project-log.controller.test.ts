import { Request, Response } from "express";
import projectLogService from "../../src/services/project-log.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";

jest.mock("../../src/services/project-log.service.js");

import projectLogController from "../../src/controllers/project-log.controller.js";

const mockLogService = jest.mocked(projectLogService);

function mockReq(overrides: Partial<Request> = {}): Request {
  return { params: {}, body: {}, ...overrides } as Request;
}
function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const fakeLog = {
  id: "pl-1",
  projectId: "proj-1",
  employeeId: "emp-1",
  action: "created",
  description: "Project created",
  createdAt: new Date("2024-01-01"),
};

describe("ProjectLogController", () => {
  let res: Response;

  beforeEach(() => {
    res = mockRes();
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("returns all logs", async () => {
      mockLogService.findAll.mockResolvedValue([fakeLog]);
      await projectLogController.getAll(mockReq(), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeLog] });
    });
  });

  describe("getById", () => {
    it("returns log when found", async () => {
      mockLogService.findById.mockResolvedValue(fakeLog);
      await projectLogController.getById(mockReq({ params: { id: "pl-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: fakeLog });
    });

    it("throws 404 when not found", async () => {
      mockLogService.findById.mockResolvedValue(null);
      await expect(
        projectLogController.getById(mockReq({ params: { id: "x" } }), res)
      ).rejects.toThrow(new AppError("Log not found", 404));
    });
  });

  describe("getByProject", () => {
    it("returns logs for project", async () => {
      mockLogService.findByProject.mockResolvedValue([fakeLog]);
      await projectLogController.getByProject(mockReq({ params: { projectId: "proj-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeLog] });
    });
  });

  describe("getByEmployee", () => {
    it("returns logs by employee", async () => {
      mockLogService.findByEmployee.mockResolvedValue([fakeLog]);
      await projectLogController.getByEmployee(mockReq({ params: { employeeId: "emp-1" } }), res);
      expect(res.json).toHaveBeenCalledWith({ data: [fakeLog] });
    });
  });

  describe("create", () => {
    it("creates log and returns 201", async () => {
      mockLogService.create.mockResolvedValue(fakeLog);
      await projectLogController.create(mockReq({ body: { projectId: "proj-1", employeeId: "emp-1" } }), res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: fakeLog });
    });
  });
});

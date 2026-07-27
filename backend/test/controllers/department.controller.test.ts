import { Request, Response } from "express";
import departmentController from "../../src/department/department.controller.js";
import departmentService from "../../src/department/department.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";

jest.mock("../../src/department/department.service.js");

const mockDepartmentService = jest.mocked(departmentService);

const fakeDepartment = {
  id: "dept-1",
  name: "Engineering",
  code: "ENG",
  description: "Engineering department",
  managerId: "emp-1",
  isActive: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

describe("DepartmentController", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let statusSpy: jest.Mock;
  let jsonSpy: jest.Mock;

  beforeEach(() => {
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn();
    mockReq = { params: {}, body: {} };
    mockRes = { status: statusSpy, json: jsonSpy } as unknown as Response;
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("returns 200 with departments", async () => {
      mockDepartmentService.findAll.mockResolvedValue([fakeDepartment]);

      await departmentController.getAll(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ data: [fakeDepartment] });
    });
  });

  describe("getById", () => {
    it("returns 200 when found", async () => {
      mockReq.params = { id: "dept-1" };
      mockDepartmentService.findById.mockResolvedValue(fakeDepartment);

      await departmentController.getById(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ data: fakeDepartment });
    });

    it("throws 404 when not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockDepartmentService.findById.mockResolvedValue(null);

      await expect(
        departmentController.getById(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Department not found", 404));
    });
  });

  describe("create", () => {
    it("returns 201 with created department", async () => {
      mockReq.body = { name: "HR", code: "HR" };
      mockDepartmentService.create.mockResolvedValue({ ...fakeDepartment, id: "dept-2", name: "HR" });

      await departmentController.create(mockReq as Request, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ name: "HR" }) })
      );
    });
  });

  describe("update", () => {
    it("returns 200 with updated department", async () => {
      mockReq.params = { id: "dept-1" };
      mockReq.body = { name: "Updated" };
      mockDepartmentService.update.mockResolvedValue({ ...fakeDepartment, name: "Updated" });

      await departmentController.update(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalled();
    });

    it("throws 404 when not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockDepartmentService.update.mockResolvedValue(null);

      await expect(
        departmentController.update(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Department not found", 404));
    });
  });

  describe("delete", () => {
    it("returns 200 with success message", async () => {
      mockReq.params = { id: "dept-1" };
      mockDepartmentService.delete.mockResolvedValue(fakeDepartment);

      await departmentController.delete(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ message: "Department deleted successfully" });
    });

    it("throws 404 when not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockDepartmentService.delete.mockResolvedValue(null);

      await expect(
        departmentController.delete(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Department not found", 404));
    });
  });
});

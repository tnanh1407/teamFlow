import { Request, Response } from "express";
import employeeController from "../../src/employee/employee.controller.js";
import employeeService from "../../src/employee/employee.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";

jest.mock("../../src/employee/employee.service.js");
jest.mock("../../src/utils/upload.js", () => ({
  handleFileUpload: jest.fn(() => "/uploads/avatars/test.jpg"),
  deleteFile: jest.fn(),
}));

const mockEmployeeService = jest.mocked(employeeService);

const fakeEmployee = {
  id: "emp-1",
  departmentId: "dept-1",
  positionId: "pos-1",
  employeeCode: "EMP001",
  name: "John Doe",
  email: "john@example.com",
  phone: "0123456789",
  birthDate: "1990-01-01",
  hireDate: "2024-01-01",
  gender: "male",
  status: "active",
  avatarURL: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  deletedAt: null,
};

describe("EmployeeController", () => {
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
    it("returns 200 with employees", async () => {
      mockEmployeeService.findAll.mockResolvedValue([fakeEmployee]);

      await employeeController.getAll(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ data: [fakeEmployee] });
    });
  });

  describe("getById", () => {
    it("returns 200 when found", async () => {
      mockReq.params = { id: "emp-1" };
      mockEmployeeService.findById.mockResolvedValue(fakeEmployee);

      await employeeController.getById(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ data: fakeEmployee });
    });

    it("throws 404 when not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockEmployeeService.findById.mockResolvedValue(null);

      await expect(
        employeeController.getById(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Employee not found", 404));
    });
  });

  describe("getByDepartment", () => {
    it("returns employees by department", async () => {
      mockReq.params = { departmentId: "dept-1" };
      mockEmployeeService.findByDepartment.mockResolvedValue([fakeEmployee]);

      await employeeController.getByDepartment(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ data: [fakeEmployee] });
    });
  });

  describe("getByPosition", () => {
    it("returns employees by position", async () => {
      mockReq.params = { positionId: "pos-1" };
      mockEmployeeService.findByPosition.mockResolvedValue([fakeEmployee]);

      await employeeController.getByPosition(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ data: [fakeEmployee] });
    });
  });

  describe("create", () => {
    it("returns 201 with created employee", async () => {
      mockReq.body = {
        departmentId: "dept-1",
        positionId: "pos-1",
        employeeCode: "EMP002",
        name: "Jane",
        email: "jane@example.com",
      };
      mockEmployeeService.create.mockResolvedValue({ ...fakeEmployee, id: "emp-2", name: "Jane" });

      await employeeController.create(mockReq as Request, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("returns 200 with updated employee", async () => {
      mockReq.params = { id: "emp-1" };
      mockReq.body = { name: "Updated Name" };
      mockEmployeeService.update.mockResolvedValue({ ...fakeEmployee, name: "Updated Name" });

      await employeeController.update(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalled();
    });

    it("throws 404 when not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockEmployeeService.update.mockResolvedValue(null);

      await expect(
        employeeController.update(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Employee not found", 404));
    });
  });

  describe("delete", () => {
    it("soft deletes and returns success message", async () => {
      mockReq.params = { id: "emp-1" };
      mockEmployeeService.deleteSoft.mockResolvedValue(fakeEmployee);

      await employeeController.delete(mockReq as Request, mockRes as Response);

      expect(mockEmployeeService.deleteSoft).toHaveBeenCalledWith("emp-1");
      expect(jsonSpy).toHaveBeenCalledWith({ message: "Employee deleted successfully" });
    });

    it("throws 404 when not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockEmployeeService.deleteSoft.mockResolvedValue(null);

      await expect(
        employeeController.delete(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Employee not found", 404));
    });
  });

  describe("deleteHard", () => {
    it("hard deletes and returns success message", async () => {
      mockReq.params = { id: "emp-1" };
      mockEmployeeService.deleteHard.mockResolvedValue(fakeEmployee);

      await employeeController.deleteHard(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ message: "Employee permanently deleted" });
    });

    it("throws 404 when not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockEmployeeService.deleteHard.mockResolvedValue(null);

      await expect(
        employeeController.deleteHard(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Employee not found", 404));
    });
  });

  describe("restore", () => {
    it("restores and returns employee data", async () => {
      mockReq.params = { id: "emp-1" };
      mockEmployeeService.restore.mockResolvedValue(fakeEmployee);

      await employeeController.restore(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ data: fakeEmployee });
    });

    it("throws 404 when not found or not deleted", async () => {
      mockReq.params = { id: "nonexistent" };
      mockEmployeeService.restore.mockResolvedValue(null);

      await expect(
        employeeController.restore(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Employee not found or not deleted", 404));
    });
  });
});

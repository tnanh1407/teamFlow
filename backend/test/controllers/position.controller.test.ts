import { Request, Response } from "express";
import positionController from "../../src/position/position.controller.js";
import positionService from "../../src/position/position.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";

jest.mock("../../src/position/position.service.js");

const mockPositionService = jest.mocked(positionService);

const fakePosition = {
  id: "pos-1",
  name: "Software Engineer",
  description: "Develops software",
  level: "Middle",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

describe("PositionController", () => {
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
    it("returns 200 with positions", async () => {
      mockPositionService.findAll.mockResolvedValue([fakePosition]);

      await positionController.getAll(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ data: [fakePosition] });
    });
  });

  describe("getById", () => {
    it("returns 200 when found", async () => {
      mockReq.params = { id: "pos-1" };
      mockPositionService.findById.mockResolvedValue(fakePosition);

      await positionController.getById(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ data: fakePosition });
    });

    it("throws 404 when not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockPositionService.findById.mockResolvedValue(null);

      await expect(
        positionController.getById(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Position not found", 404));
    });
  });

  describe("create", () => {
    it("returns 201 with created position", async () => {
      mockReq.body = { name: "Designer", level: "Junior" };
      mockPositionService.create.mockResolvedValue({ ...fakePosition, id: "pos-2", name: "Designer" });

      await positionController.create(mockReq as Request, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("returns 200 with updated position", async () => {
      mockReq.params = { id: "pos-1" };
      mockReq.body = { name: "Senior Engineer" };
      mockPositionService.update.mockResolvedValue({ ...fakePosition, name: "Senior Engineer" });

      await positionController.update(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalled();
    });

    it("throws 404 when not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockPositionService.update.mockResolvedValue(null);

      await expect(
        positionController.update(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Position not found", 404));
    });
  });

  describe("delete", () => {
    it("returns 200 with success message", async () => {
      mockReq.params = { id: "pos-1" };
      mockPositionService.delete.mockResolvedValue(fakePosition);

      await positionController.delete(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ message: "Position deleted successfully" });
    });

    it("throws 404 when not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockPositionService.delete.mockResolvedValue(null);

      await expect(
        positionController.delete(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Position not found", 404));
    });
  });
});

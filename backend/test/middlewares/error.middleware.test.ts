import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../src/middlewares/error.middleware.js";
import { AppError } from "../../src/utils/errors/app-error.js";

describe("errorHandler middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let statusSpy: jest.Mock;
  let jsonSpy: jest.Mock;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn();
    mockReq = {};
    mockRes = { status: statusSpy, json: jsonSpy } as unknown as Response;
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("returns AppError status code and message", () => {
    const error = new AppError("Resource not found", 404);

    errorHandler(error, mockReq as Request, mockRes as Response, {} as NextFunction);

    expect(statusSpy).toHaveBeenCalledWith(404);
    expect(jsonSpy).toHaveBeenCalledWith({ message: "Resource not found" });
  });

  it("returns 400 for bad request AppError", () => {
    const error = new AppError("Validation failed", 400);

    errorHandler(error, mockReq as Request, mockRes as Response, {} as NextFunction);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({ message: "Validation failed" });
  });

  it("returns 401 for unauthorized AppError", () => {
    const error = new AppError("Invalid credentials", 401);

    errorHandler(error, mockReq as Request, mockRes as Response, {} as NextFunction);

    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  it("returns 500 for unknown errors", () => {
    const error = new Error("Something unexpected happened");

    errorHandler(error, mockReq as Request, mockRes as Response, {} as NextFunction);

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({ message: "Internal server error" });
  });

  it("logs unknown errors to console", () => {
    const error = new Error("Unexpected bug");

    errorHandler(error, mockReq as Request, mockRes as Response, {} as NextFunction);

    expect(consoleSpy).toHaveBeenCalledWith("Unhandled error:", error);
  });

  it("does not log AppErrors", () => {
    const error = new AppError("Not found", 404);

    errorHandler(error, mockReq as Request, mockRes as Response, {} as NextFunction);

    expect(consoleSpy).not.toHaveBeenCalled();
  });
});

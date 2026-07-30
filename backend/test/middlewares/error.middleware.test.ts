import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../src/middlewares/error.middleware.js";
import { AppError } from "../../src/utils/errors/app-error.js";

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe("errorHandler middleware", () => {
  it("should respond with AppError statusCode and message", () => {
    const req = {} as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    const appError = new AppError("Not found", 404);
    errorHandler(appError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Not found" });
  });

  it("should respond with 500 for unknown errors", () => {
    const req = {} as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    const error = new Error("Something went wrong");
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });

  it("should handle AppError with 400 status", () => {
    const req = {} as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    const appError = new AppError("Bad request", 400);
    errorHandler(appError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Bad request" });
  });

  it("should handle AppError with 403 status", () => {
    const req = {} as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    const appError = new AppError("Forbidden", 403);
    errorHandler(appError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
  });

  it("should handle AppError with 409 status", () => {
    const req = {} as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    const appError = new AppError("Conflict", 409);
    errorHandler(appError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Conflict" });
  });
});

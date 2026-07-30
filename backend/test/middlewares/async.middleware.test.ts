import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../src/middlewares/async.middleware.js";

describe("asyncHandler middleware", () => {
  it("should call next with resolved value on success", async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const handler = asyncHandler(async (_req, _res, _next) => {
      return "success";
    });

    await handler(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });

  it("should catch error and pass to next", async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const error = new Error("Async error");
    const handler = asyncHandler(async (_req, _res, _next) => {
      throw error;
    });

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("should catch AppError and pass to next", async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const { AppError } = await import("../../src/utils/errors/app-error.js");
    const appError = new AppError("Custom error", 400);
    const handler = asyncHandler(async (_req, _res, _next) => {
      throw appError;
    });

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(appError);
  });

  it("should catch rejected promise and pass to next", async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const handler = asyncHandler((_req, _res, _next) => {
      return Promise.reject(new Error("Rejected promise"));
    });

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

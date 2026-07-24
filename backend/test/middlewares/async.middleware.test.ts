import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../src/middlewares/async.middleware.js";

describe("asyncHandler middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it("calls next with error when async function rejects", async () => {
    const error = new Error("Async error");
    const asyncFn = async (_req: Request, _res: Response, _next: NextFunction) => {
      throw error;
    };

    const wrapped = asyncHandler(asyncFn);
    await wrapped(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it("does not call next when async function resolves", async () => {
    const asyncFn = async (_req: Request, _res: Response, _next: NextFunction) => {
      return "success";
    };

    const wrapped = asyncHandler(asyncFn);
    await wrapped(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
  });

  it("passes AppError to next", async () => {
    const { AppError } = await import("../../src/utils/errors/app-error.js");
    const appError = new AppError("Custom error", 400);
    const asyncFn = async (_req: Request, _res: Response, _next: NextFunction) => {
      throw appError;
    };

    const wrapped = asyncHandler(asyncFn);
    await wrapped(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(appError);
  });

  it("preserves req and res arguments", async () => {
    const asyncFn = jest.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(asyncFn);

    await wrapped(mockReq as Request, mockRes as Response, mockNext);

    expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
  });
});

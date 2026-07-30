import { describe, it, expect, vi } from "vitest";
import type { Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../../src/middlewares/validation.middleware.js";

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe("validate middleware", () => {
  const testSchema = z.object({
    name: z.string().min(1, "Name is required"),
    age: z.number().min(18, "Must be at least 18"),
  });

  it("should pass valid data and call next", () => {
    const middleware = validate(testSchema);
    const req = { body: { name: "John", age: 25 } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: "John", age: 25 });
  });

  it("should return 400 for missing required field", () => {
    const middleware = validate(testSchema);
    const req = { body: { age: 25 } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: expect.arrayContaining([
        expect.objectContaining({ field: "name" }),
      ]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid type", () => {
    const middleware = validate(testSchema);
    const req = { body: { name: "John", age: "not-a-number" } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: expect.arrayContaining([
        expect.objectContaining({ field: "age" }),
      ]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 for value below minimum", () => {
    const middleware = validate(testSchema);
    const req = { body: { name: "John", age: 15 } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Validation error",
      errors: expect.arrayContaining([
        expect.objectContaining({ field: "age", message: "Must be at least 18" }),
      ]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should strip unknown fields from body", () => {
    const schema = z.object({ email: z.string().email() });
    const middleware = validate(schema);
    const req = { body: { email: "test@example.com", extra: "should-be-removed" } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ email: "test@example.com" });
    expect(req.body).not.toHaveProperty("extra");
  });

  it("should return multiple validation errors", () => {
    const middleware = validate(testSchema);
    const req = { body: {} } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    const jsonArg = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonArg.errors.length).toBeGreaterThanOrEqual(2);
    expect(next).not.toHaveBeenCalled();
  });
});

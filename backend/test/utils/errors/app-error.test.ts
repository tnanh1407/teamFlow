import { describe, it, expect } from "vitest";

describe("AppError", () => {
  it("should create error with message and statusCode", async () => {
    const { AppError } = await import("../../../src/utils/errors/app-error.js");
    const error = new AppError("Not found", 404);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Not found");
    expect(error.statusCode).toBe(404);
  });

  it("should create error with 400 status", async () => {
    const { AppError } = await import("../../../src/utils/errors/app-error.js");
    const error = new AppError("Bad request", 400);
    expect(error.statusCode).toBe(400);
  });

  it("should create error with 401 status", async () => {
    const { AppError } = await import("../../../src/utils/errors/app-error.js");
    const error = new AppError("Unauthorized", 401);
    expect(error.statusCode).toBe(401);
  });

  it("should create error with 403 status", async () => {
    const { AppError } = await import("../../../src/utils/errors/app-error.js");
    const error = new AppError("Forbidden", 403);
    expect(error.statusCode).toBe(403);
  });

  it("should create error with 409 status", async () => {
    const { AppError } = await import("../../../src/utils/errors/app-error.js");
    const error = new AppError("Conflict", 409);
    expect(error.statusCode).toBe(409);
  });

  it("should create error with 500 status", async () => {
    const { AppError } = await import("../../../src/utils/errors/app-error.js");
    const error = new AppError("Internal server error", 500);
    expect(error.statusCode).toBe(500);
  });

  it("should be instanceof Error", async () => {
    const { AppError } = await import("../../../src/utils/errors/app-error.js");
    const error = new AppError("Test", 400);
    expect(error instanceof Error).toBe(true);
  });

  it("should have stack trace", async () => {
    const { AppError } = await import("../../../src/utils/errors/app-error.js");
    const error = new AppError("Test", 400);
    expect(error.stack).toBeDefined();
  });

  it("should preserve message in super call", async () => {
    const { AppError } = await import("../../../src/utils/errors/app-error.js");
    const error = new AppError("Custom error message", 422);
    expect(error.message).toBe("Custom error message");
  });
});

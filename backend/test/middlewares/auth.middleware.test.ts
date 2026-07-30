import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { EAccountRole, EAccountPosition } from "../../src/enums/account-role.enum.js";

vi.mock("jsonwebtoken");

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe("authenticate middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if no token provided", async () => {
    const { authenticate } = await import("../../src/middlewares/auth.middleware.js");
    const req = { cookies: {}, headers: {} } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied. No token provided." });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 for invalid token", async () => {
    vi.mocked(jwt.verify).mockImplementation(() => { throw new Error("jwt error"); });

    const { authenticate } = await import("../../src/middlewares/auth.middleware.js");
    const req = { cookies: {}, headers: { authorization: "Bearer invalid-token" } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should set req.user and call next for valid token from Authorization header", async () => {
    const decoded = { id: "user-1", role: EAccountRole.USER, position: EAccountPosition.MEMBER };
    vi.mocked(jwt.verify).mockReturnValue(decoded as any);

    const { authenticate } = await import("../../src/middlewares/auth.middleware.js");
    const req = { cookies: {}, headers: { authorization: "Bearer valid-token" } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret");
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });

  it("should set req.user and call next for valid token from cookie", async () => {
    const decoded = { id: "user-1", role: EAccountRole.ADMIN, position: EAccountPosition.MANAGER };
    vi.mocked(jwt.verify).mockReturnValue(decoded as any);

    const { authenticate } = await import("../../src/middlewares/auth.middleware.js");
    const req = { cookies: { token: "cookie-token" }, headers: {} } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("cookie-token", "test-secret");
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });

  it("should prefer cookie token over Authorization header", async () => {
    const decoded = { id: "user-1", role: EAccountRole.USER, position: EAccountPosition.MEMBER };
    vi.mocked(jwt.verify).mockReturnValue(decoded as any);

    const { authenticate } = await import("../../src/middlewares/auth.middleware.js");
    const req = { cookies: { token: "cookie-token" }, headers: { authorization: "Bearer header-token" } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("cookie-token", "test-secret");
    expect(next).toHaveBeenCalled();
  });
});

describe("authorize middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call next if user has required role", async () => {
    const { authorize } = await import("../../src/middlewares/auth.middleware.js");
    const middleware = authorize(EAccountRole.ADMIN);
    const req = { user: { id: "user-1", role: EAccountRole.ADMIN, position: EAccountPosition.MANAGER } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should return 403 if user does not have required role", async () => {
    const { authorize } = await import("../../src/middlewares/auth.middleware.js");
    const middleware = authorize(EAccountRole.ADMIN);
    const req = { user: { id: "user-1", role: EAccountRole.USER, position: EAccountPosition.MEMBER } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Insufficient permissions" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if no user on request", async () => {
    const { authorize } = await import("../../src/middlewares/auth.middleware.js");
    const middleware = authorize(EAccountRole.ADMIN);
    const req = {} as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow user with matching role among multiple roles", async () => {
    const { authorize } = await import("../../src/middlewares/auth.middleware.js");
    const middleware = authorize(EAccountRole.ADMIN, EAccountRole.USER);
    const req = { user: { id: "user-1", role: EAccountRole.USER, position: EAccountPosition.MEMBER } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe("authorizePosition middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call next if user has required position", async () => {
    const { authorizePosition } = await import("../../src/middlewares/auth.middleware.js");
    const middleware = authorizePosition(EAccountPosition.MANAGER);
    const req = { user: { id: "user-1", role: EAccountRole.USER, position: EAccountPosition.MANAGER } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should return 403 if user does not have required position", async () => {
    const { authorizePosition } = await import("../../src/middlewares/auth.middleware.js");
    const middleware = authorizePosition(EAccountPosition.MANAGER);
    const req = { user: { id: "user-1", role: EAccountRole.USER, position: EAccountPosition.MEMBER } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Insufficient position permissions" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should bypass position check for ADMIN role", async () => {
    const { authorizePosition } = await import("../../src/middlewares/auth.middleware.js");
    const middleware = authorizePosition(EAccountPosition.MANAGER);
    const req = { user: { id: "user-1", role: EAccountRole.ADMIN, position: EAccountPosition.MEMBER } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if no user on request", async () => {
    const { authorizePosition } = await import("../../src/middlewares/auth.middleware.js");
    const middleware = authorizePosition(EAccountPosition.MANAGER);
    const req = {} as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow user with position among multiple positions", async () => {
    const { authorizePosition } = await import("../../src/middlewares/auth.middleware.js");
    const middleware = authorizePosition(EAccountPosition.MANAGER, EAccountPosition.MEMBER);
    const req = { user: { id: "user-1", role: EAccountRole.USER, position: EAccountPosition.MEMBER } } as any;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

import { authenticate, authorize } from "../../src/middlewares/auth.middleware.js";
import { EUserRole } from "../../src/enums/user-role.enum.js";

const mockJwtVerify = jwt.verify as jest.Mock;

describe("authenticate", () => {
  let req: any, res: any, next: jest.Mock;

  beforeEach(() => {
    req = { cookies: {}, headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("returns 401 when no token provided", () => {
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied. No token provided." });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", () => {
    req.cookies = { token: "invalid-token" };
    mockJwtVerify.mockImplementation(() => { throw new Error("jwt error"); });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("sets req.user and calls next when token is valid from cookie", () => {
    req.cookies = { token: "valid-token" };
    mockJwtVerify.mockReturnValue({ id: "user-1", role: EUserRole.ADMIN });

    authenticate(req, res, next);

    expect(req.user).toEqual({ id: "user-1", role: EUserRole.ADMIN });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("reads token from Authorization header when no cookie", () => {
    req.headers = { authorization: "Bearer bearer-token" };
    mockJwtVerify.mockReturnValue({ id: "user-2", role: EUserRole.USER });

    authenticate(req, res, next);

    expect(mockJwtVerify).toHaveBeenCalledWith("bearer-token", expect.any(String));
    expect(req.user).toEqual({ id: "user-2", role: EUserRole.USER });
    expect(next).toHaveBeenCalled();
  });

  it("prefers cookie token over header token", () => {
    req.cookies = { token: "cookie-token" };
    req.headers = { authorization: "Bearer header-token" };
    mockJwtVerify.mockReturnValue({ id: "user-3", role: EUserRole.ADMIN });

    authenticate(req, res, next);

    expect(mockJwtVerify).toHaveBeenCalledWith("cookie-token", expect.any(String));
    expect(req.user).toEqual({ id: "user-3", role: EUserRole.ADMIN });
  });
});

describe("authorize", () => {
  let req: any, res: any, next: jest.Mock;

  beforeEach(() => {
    req = { user: { id: "user-1", role: EUserRole.ADMIN } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("calls next when user has required role", () => {
    const middleware = authorize(EUserRole.ADMIN);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 403 when user lacks required role", () => {
    const middleware = authorize(EUserRole.ADMIN);
    req.user.role = EUserRole.USER;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Insufficient permissions" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when no user in request", () => {
    const middleware = authorize(EUserRole.ADMIN);
    req.user = undefined;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied" });
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts user with any of the allowed roles", () => {
    const middleware = authorize(EUserRole.ADMIN, EUserRole.USER);
    req.user.role = EUserRole.USER;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

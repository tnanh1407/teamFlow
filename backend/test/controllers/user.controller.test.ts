import { Request, Response } from "express";
import userController from "../../src/user/user.controller.js";
import userService from "../../src/user/user.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";
import { EUserRole } from "../../src/enums/user-role.enum.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("../../src/user/user.service.js");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const mockUserService = jest.mocked(userService);
const mockBcrypt = jest.mocked(bcrypt);
const mockJwt = jest.mocked(jwt);

const fakeUser = {
  id: "user-1",
  employeeId: "emp-1",
  username: "testuser",
  password: "hashedpwd",
  role: EUserRole.USER,
  status: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

describe("UserController", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let statusSpy: jest.Mock;
  let jsonSpy: jest.Mock;
  let cookieSpy: jest.Mock;
  let clearCookieSpy: jest.Mock;

  beforeEach(() => {
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn();
    cookieSpy = jest.fn();
    clearCookieSpy = jest.fn();
    mockReq = { params: {}, body: {} };
    mockRes = {
      status: statusSpy,
      json: jsonSpy,
      cookie: cookieSpy,
      clearCookie: clearCookieSpy,
    } as unknown as Response;
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("returns 200 with users", async () => {
      mockUserService.findAll.mockResolvedValue([fakeUser]);

      await userController.getAll(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ data: [fakeUser] });
    });
  });

  describe("getById", () => {
    it("returns 200 with user when found", async () => {
      mockReq.params = { id: "user-1" };
      mockUserService.findById.mockResolvedValue(fakeUser);

      await userController.getById(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ data: fakeUser });
    });

    it("throws 404 when user not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockUserService.findById.mockResolvedValue(null);

      await expect(
        userController.getById(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("User not found", 404));
    });
  });

  describe("create", () => {
    it("returns 201 with created user", async () => {
      mockReq.body = {
        employeeId: "emp-2",
        username: "newuser",
        password: "password123",
      };
      mockUserService.create.mockResolvedValue({ ...fakeUser, id: "user-2", username: "newuser" });

      await userController.create(mockReq as Request, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ username: "newuser" }) })
      );
    });
  });

  describe("update", () => {
    it("returns 200 with updated user", async () => {
      mockReq.params = { id: "user-1" };
      mockReq.body = { username: "updateduser" };
      mockUserService.update.mockResolvedValue({ ...fakeUser, username: "updateduser" });

      await userController.update(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalled();
    });

    it("throws 404 when user not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockUserService.update.mockResolvedValue(null);

      await expect(
        userController.update(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("User not found", 404));
    });
  });

  describe("delete", () => {
    it("returns 200 with success message", async () => {
      mockReq.params = { id: "user-1" };
      mockUserService.delete.mockResolvedValue(fakeUser);

      await userController.delete(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ message: "User deleted successfully" });
    });

    it("throws 404 when user not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockUserService.delete.mockResolvedValue(null);

      await expect(
        userController.delete(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("User not found", 404));
    });
  });

  describe("login", () => {
    const loginBody = { username: "testuser", password: "password123" };

    it("returns 200 with token and sets cookie on success", async () => {
      mockReq.body = loginBody;
      mockUserService.findByUsername.mockResolvedValue(fakeUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValue("fake-token" as never);

      await userController.login(mockReq as Request, mockRes as Response);

      expect(cookieSpy).toHaveBeenCalledWith(
        "token",
        "fake-token",
        expect.objectContaining({ httpOnly: true })
      );
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            token: "fake-token",
            user: expect.not.objectContaining({ password: expect.anything() }),
          }),
        })
      );
    });

    it("throws 401 when credentials are invalid", async () => {
      mockReq.body = loginBody;
      mockUserService.findByUsername.mockResolvedValue(null);

      await expect(
        userController.login(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Invalid credentials", 401));
    });

    it("throws 403 when account is disabled", async () => {
      mockReq.body = loginBody;
      mockUserService.findByUsername.mockResolvedValue({ ...fakeUser, status: false });

      await expect(
        userController.login(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Account is disabled", 403));
    });

    it("throws 401 when password does not match", async () => {
      mockReq.body = loginBody;
      mockUserService.findByUsername.mockResolvedValue(fakeUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        userController.login(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Invalid credentials", 401));
    });
  });

  describe("logout", () => {
    it("clears cookie and returns success message", async () => {
      await userController.logout(mockReq as Request, mockRes as Response);

      expect(clearCookieSpy).toHaveBeenCalledWith("token");
      expect(jsonSpy).toHaveBeenCalledWith({ message: "Logged out successfully" });
    });
  });
});

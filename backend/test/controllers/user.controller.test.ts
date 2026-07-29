import { Request, Response } from "express";
import accountController from "../../src/account/account.controller.js";
import accountService from "../../src/account/account.service.js";
import { AppError } from "../../src/utils/errors/app-error.js";
import { EAccountRole } from "../../src/enums/account-role.enum.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("../../src/account/account.service.js");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const mockAccountService = jest.mocked(accountService);
const mockBcrypt = jest.mocked(bcrypt);
const mockJwt = jest.mocked(jwt);

const fakeAccount = {
  id: "account-1",
  employeeId: "emp-1",
  username: "testuser",
  password: "hashedpwd",
  role: EAccountRole.USER,
  status: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

describe("AccountController", () => {
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
    it("returns 200 with accounts", async () => {
      mockAccountService.findAll.mockResolvedValue([fakeAccount]);

      await accountController.getAll(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ data: [fakeAccount] });
    });
  });

  describe("getById", () => {
    it("returns 200 with account when found", async () => {
      mockReq.params = { id: "account-1" };
      mockAccountService.findById.mockResolvedValue(fakeAccount);

      await accountController.getById(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ data: fakeAccount });
    });

    it("throws 404 when account not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockAccountService.findById.mockResolvedValue(null);

      await expect(
        accountController.getById(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Account not found", 404));
    });
  });

  describe("create", () => {
    it("returns 201 with created account", async () => {
      mockReq.body = {
        employeeId: "emp-2",
        username: "newuser",
        password: "password123",
      };
      mockAccountService.create.mockResolvedValue({ ...fakeAccount, id: "account-2", username: "newuser" });

      await accountController.create(mockReq as Request, mockRes as Response);

      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ username: "newuser" }) })
      );
    });
  });

  describe("update", () => {
    it("returns 200 with updated account", async () => {
      mockReq.params = { id: "account-1" };
      mockReq.body = { username: "updateduser" };
      mockAccountService.update.mockResolvedValue({ ...fakeAccount, username: "updateduser" });

      await accountController.update(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalled();
    });

    it("throws 404 when account not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockAccountService.update.mockResolvedValue(null);

      await expect(
        accountController.update(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Account not found", 404));
    });
  });

  describe("delete", () => {
    it("returns 200 with success message", async () => {
      mockReq.params = { id: "account-1" };
      mockAccountService.delete.mockResolvedValue(fakeAccount);

      await accountController.delete(mockReq as Request, mockRes as Response);

      expect(jsonSpy).toHaveBeenCalledWith({ message: "Account deleted successfully" });
    });

    it("throws 404 when account not found", async () => {
      mockReq.params = { id: "nonexistent" };
      mockAccountService.delete.mockResolvedValue(null);

      await expect(
        accountController.delete(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Account not found", 404));
    });
  });

  describe("login", () => {
    const loginBody = { username: "testuser", password: "password123" };

    it("returns 200 with token and sets cookie on success", async () => {
      mockReq.body = loginBody;
      mockAccountService.findByUsername.mockResolvedValue(fakeAccount);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValue("fake-token" as never);

      await accountController.login(mockReq as Request, mockRes as Response);

      expect(cookieSpy).toHaveBeenCalledWith(
        "token",
        "fake-token",
        expect.objectContaining({ httpOnly: true })
      );
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            token: "fake-token",
            account: expect.not.objectContaining({ password: expect.anything() }),
          }),
        })
      );
    });

    it("throws 401 when credentials are invalid", async () => {
      mockReq.body = loginBody;
      mockAccountService.findByUsername.mockResolvedValue(null);

      await expect(
        accountController.login(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Invalid credentials", 401));
    });

    it("throws 403 when account is disabled", async () => {
      mockReq.body = loginBody;
      mockAccountService.findByUsername.mockResolvedValue({ ...fakeAccount, status: false });

      await expect(
        accountController.login(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Account is disabled", 403));
    });

    it("throws 401 when password does not match", async () => {
      mockReq.body = loginBody;
      mockAccountService.findByUsername.mockResolvedValue(fakeAccount);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        accountController.login(mockReq as Request, mockRes as Response)
      ).rejects.toThrow(new AppError("Invalid credentials", 401));
    });
  });

  describe("logout", () => {
    it("clears cookie and returns success message", async () => {
      await accountController.logout(mockReq as Request, mockRes as Response);

      expect(clearCookieSpy).toHaveBeenCalledWith("token");
      expect(jsonSpy).toHaveBeenCalledWith({ message: "Logged out successfully" });
    });
  });
});

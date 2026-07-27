import express from "express";
import request from "supertest";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");
jest.mock("../../src/user/user.controller.js");

import userRouter from "../../src/user/user.router.js";
import userController from "../../src/user/user.controller.js";
import { errorHandler } from "../../src/middlewares/error.middleware.js";
import { EUserRole } from "../../src/enums/user-role.enum.js";

const mockJwtVerify = jwt.verify as jest.Mock;
const mockUserController = jest.mocked(userController);

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/users", userRouter);
  app.use(errorHandler);
  return app;
}

function validTokenCookie() {
  mockJwtVerify.mockReturnValue({ id: "admin-id", role: EUserRole.ADMIN });
}

describe("User Routes (integration)", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  describe("POST /api/users/login", () => {
    it("returns 200 with token on valid credentials", async () => {
      const fakeUser = {
        id: "user-1",
        employeeId: "emp-1",
        username: "testuser",
        password: "hashed",
        role: EUserRole.USER,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserController.login.mockImplementation(async (req, res) => {
        const token = "fake-jwt-token";
        res.cookie("token", token, { httpOnly: true });
        const { password: _, ...userWithoutPassword } = fakeUser;
        res.json({ data: { user: userWithoutPassword, token } });
      });

      const res = await request(app)
        .post("/api/users/login")
        .send({ username: "testuser", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.token).toBe("fake-jwt-token");
      expect(res.body.data.user).not.toHaveProperty("password");
    });

    it("returns 400 when body is invalid", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation error");
    });

    it("returns 400 when username is missing", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({ password: "test123" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/users/logout", () => {
    it("returns 200 even without token (just clears cookie)", async () => {
      mockUserController.logout.mockImplementation(async (_req, res) => {
        res.clearCookie("token");
        res.json({ message: "Logged out successfully" });
      });
      validTokenCookie();

      const res = await request(app)
        .post("/api/users/logout")
        .set("Cookie", ["token=valid-token"]);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out successfully");
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).post("/api/users/logout");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/users", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).get("/api/users");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Access denied. No token provided.");
    });

    it("returns 200 with users list when authenticated", async () => {
      const fakeUsers = [{ id: "1", username: "user1" }];
      mockUserController.getAll.mockImplementation(async (_req, res) => {
        res.json({ data: fakeUsers });
      });
      validTokenCookie();

      const res = await request(app)
        .get("/api/users")
        .set("Cookie", ["token=valid-token"]);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(fakeUsers);
    });
  });

  describe("GET /api/users/:id", () => {
    it("returns 200 when user found", async () => {
      const fakeUser = { id: "user-1", username: "testuser" };
      mockUserController.getById.mockImplementation(async (req, res) => {
        res.json({ data: fakeUser });
      });
      validTokenCookie();

      const res = await request(app)
        .get("/api/users/user-1")
        .set("Cookie", ["token=valid-token"]);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe("user-1");
    });
  });

  describe("POST /api/users", () => {
    it("returns 201 when admin creates user", async () => {
      const newUser = { id: "new-1", username: "newuser", role: EUserRole.USER };
      mockUserController.create.mockImplementation(async (req, res) => {
        res.status(201).json({ data: newUser });
      });
      validTokenCookie();

      const res = await request(app)
        .post("/api/users")
        .set("Cookie", ["token=valid-token"])
        .send({
          employeeId: "emp-2",
          username: "newuser",
          password: "password123",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.username).toBe("newuser");
    });

    it("returns 400 on validation error", async () => {
      validTokenCookie();

      const res = await request(app)
        .post("/api/users")
        .set("Cookie", ["token=valid-token"])
        .send({ username: "only-username" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation error");
    });
  });

  describe("PATCH /api/users/:id", () => {
    it("returns 200 when admin updates user", async () => {
      mockUserController.update.mockImplementation(async (req, res) => {
        res.json({ data: { id: req.params.id, username: "updated" } });
      });
      validTokenCookie();

      const res = await request(app)
        .patch("/api/users/user-1")
        .set("Cookie", ["token=valid-token"])
        .send({ username: "updated" });

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe("updated");
    });

    it("returns 400 with invalid update data", async () => {
      validTokenCookie();

      const res = await request(app)
        .patch("/api/users/user-1")
        .set("Cookie", ["token=valid-token"])
        .send({ username: "" });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("returns 200 when admin deletes user", async () => {
      mockUserController.delete.mockImplementation(async (req, res) => {
        res.json({ message: "User deleted successfully" });
      });
      validTokenCookie();

      const res = await request(app)
        .delete("/api/users/user-1")
        .set("Cookie", ["token=valid-token"]);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User deleted successfully");
    });
  });

  describe("401 Unauthorized scenarios", () => {
    it("blocks POST without auth", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({ username: "test", employeeId: "e1", password: "pass123" });

      expect(res.status).toBe(401);
    });

    it("blocks PATCH without auth", async () => {
      const res = await request(app)
        .patch("/api/users/user-1")
        .send({ username: "hacker" });

      expect(res.status).toBe(401);
    });

    it("blocks DELETE without auth", async () => {
      const res = await request(app).delete("/api/users/user-1");

      expect(res.status).toBe(401);
    });
  });

  describe("403 Forbidden scenarios", () => {
    it("blocks POST when user is not admin", async () => {
      mockJwtVerify.mockReturnValue({ id: "user-1", role: EUserRole.USER });

      const res = await request(app)
        .post("/api/users")
        .set("Cookie", ["token=user-token"])
        .send({ username: "test", employeeId: "e1", password: "pass123" });

      expect(res.status).toBe(403);
    });
  });

  describe("Token from Authorization header", () => {
    it("authenticates via Bearer token", async () => {
      mockUserController.getAll.mockImplementation(async (_req, res) => {
        res.json({ data: [] });
      });
      mockJwtVerify.mockReturnValue({ id: "user-1", role: EUserRole.ADMIN });

      const res = await request(app)
        .get("/api/users")
        .set("Authorization", "Bearer my-token");

      expect(res.status).toBe(200);
      expect(mockJwtVerify).toHaveBeenCalledWith("my-token", expect.any(String));
    });
  });
});

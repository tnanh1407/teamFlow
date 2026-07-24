import express from "express";
import request from "supertest";
import { errorHandler } from "../../src/middlewares/error.middleware.js";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.get("/", (_req, res) => res.json({ message: "TeamFlow API is running" }));
  app.use(errorHandler);
  return app;
}

describe("App Routes", () => {
  let app: express.Express;

  beforeEach(() => {
    app = createTestApp();
  });

  describe("GET /", () => {
    it("returns 200 with status message", async () => {
      const res = await request(app).get("/");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "TeamFlow API is running" });
    });
  });
});

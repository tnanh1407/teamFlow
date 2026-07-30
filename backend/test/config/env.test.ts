import { describe, it, expect, beforeAll } from "vitest";

const ORIG_ENV = { ...process.env };

describe("env config", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "test";
    process.env.PORT = "5000";
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_ACCESS_SECRET = "test-access-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
  });

  it("should export parsed env variables", async () => {
    const { default: env } = await import("../../src/config/env.js");
    expect(env.NODE_ENV).toBe("test");
    expect(env.PORT).toBe(5000);
    expect(env.JWT_SECRET).toBe("test-secret");
    expect(env.JWT_ACCESS_SECRET).toBe("test-access-secret");
    expect(env.JWT_REFRESH_SECRET).toBe("test-refresh-secret");
  });

  it("should use default PORT when not set", async () => {
    delete process.env.PORT;
    const { default: env } = await import("../../src/config/env.js?update=1");
    expect(env.PORT).toBe(5000);
  });

  it("should throw if JWT_SECRET is missing", async () => {
    delete process.env.JWT_SECRET;
    await expect(import("../../src/config/env.js?update=2")).rejects.toThrow();
  });

  it("should throw if JWT_ACCESS_SECRET is missing", async () => {
    process.env.JWT_SECRET = "test-secret";
    delete process.env.JWT_ACCESS_SECRET;
    await expect(import("../../src/config/env.js?update=3")).rejects.toThrow();
  });
});

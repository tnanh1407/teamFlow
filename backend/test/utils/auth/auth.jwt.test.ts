import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock("../../../src/config/env.js", () => ({
  default: { JWT_ACCESS_SECRET: "test-access-secret", JWT_SECRET: "test-secret" },
}));

describe("generateAccessToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call jwt.sign with payload and access secret", async () => {
    vi.mocked(jwt.sign).mockReturnValue("mock-access-token" as never);

    const { generateAccessToken } = await import("../../../src/utils/auth/auth.jwt.js");
    const payload = { id: "user-1", role: "admin" };
    const token = generateAccessToken(payload);

    expect(jwt.sign).toHaveBeenCalledWith(payload, "test-access-secret");
    expect(token).toBe("mock-access-token");
  });

  it("should generate token for user payload", async () => {
    vi.mocked(jwt.sign).mockReturnValue("user-token" as never);

    const { generateAccessToken } = await import("../../../src/utils/auth/auth.jwt.js");
    const payload = { id: "user-1", role: "user", position: "member" };
    const token = generateAccessToken(payload);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: "user-1", role: "user", position: "member" },
      "test-access-secret"
    );
    expect(token).toBe("user-token");
  });

  it("should generate token for admin payload", async () => {
    vi.mocked(jwt.sign).mockReturnValue("admin-token" as never);

    const { generateAccessToken } = await import("../../../src/utils/auth/auth.jwt.js");
    const payload = { id: "admin-1", role: "admin" };
    const token = generateAccessToken(payload);

    expect(token).toBe("admin-token");
  });

  it("should return a string token", async () => {
    vi.mocked(jwt.sign).mockReturnValue("string-token" as never);

    const { generateAccessToken } = await import("../../../src/utils/auth/auth.jwt.js");
    const token = generateAccessToken({ id: "1" });

    expect(typeof token).toBe("string");
  });
});

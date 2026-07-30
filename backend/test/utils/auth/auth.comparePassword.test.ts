import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe("comparePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should compare plaintext passwords when stored password is not bcrypt hash", async () => {
    const { comparePassword } = await import("../../../src/utils/auth/auth.comparePassword.js");
    const result = await comparePassword("plainpass", "plainpass");
    expect(result).toBe(true);
  });

  it("should return false when plaintext does not match", async () => {
    const { comparePassword } = await import("../../../src/utils/auth/auth.comparePassword.js");
    const result = await comparePassword("wrongpass", "plainpass");
    expect(result).toBe(false);
  });

  it("should use bcrypt.compare when stored password starts with $2", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const { comparePassword } = await import("../../../src/utils/auth/auth.comparePassword.js");
    const result = await comparePassword("mypassword", "$2a$10$hashedpassword");

    expect(bcrypt.compare).toHaveBeenCalledWith("mypassword", "$2a$10$hashedpassword");
    expect(result).toBe(true);
  });

  it("should return false when bcrypt.compare returns false", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const { comparePassword } = await import("../../../src/utils/auth/auth.comparePassword.js");
    const result = await comparePassword("wrong", "$2a$10$hashedpassword");

    expect(result).toBe(false);
  });

  it("should handle empty string passwords", async () => {
    const { comparePassword } = await import("../../../src/utils/auth/auth.comparePassword.js");
    const result = await comparePassword("", "");
    expect(result).toBe(true);
  });

  it("should handle bcrypt hash starting with $2b variant", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const { comparePassword } = await import("../../../src/utils/auth/auth.comparePassword.js");
    const result = await comparePassword("pass", "$2b$10$anotherhash");

    expect(bcrypt.compare).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("should handle bcrypt hash starting with $2y variant", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const { comparePassword } = await import("../../../src/utils/auth/auth.comparePassword.js");
    const result = await comparePassword("wrong", "$2y$10$yhash");

    expect(bcrypt.compare).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});

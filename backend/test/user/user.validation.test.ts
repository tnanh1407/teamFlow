import { describe, it, expect } from "vitest";

describe("createUserSchema", () => {
  it("should accept valid input", async () => {
    const { createUserSchema } = await import("../../src/user/user.validation.js");
    const result = createUserSchema.safeParse({
      departmentId: "dept-1",
      positionId: "pos-1",
      employeeCode: "EMP001",
      name: "John Doe",
      email: "john@example.com",
      username: "johndoe",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should fail if email is invalid", async () => {
    const { createUserSchema } = await import("../../src/user/user.validation.js");
    const result = createUserSchema.safeParse({
      departmentId: "dept-1",
      positionId: "pos-1",
      employeeCode: "EMP001",
      name: "John Doe",
      email: "not-an-email",
      username: "johndoe",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should fail if password is less than 6 characters", async () => {
    const { createUserSchema } = await import("../../src/user/user.validation.js");
    const result = createUserSchema.safeParse({
      departmentId: "dept-1",
      positionId: "pos-1",
      employeeCode: "EMP001",
      name: "John Doe",
      email: "john@example.com",
      username: "johndoe",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("should default position to member", async () => {
    const { createUserSchema } = await import("../../src/user/user.validation.js");
    const result = createUserSchema.safeParse({
      departmentId: "dept-1",
      positionId: "pos-1",
      employeeCode: "EMP001",
      name: "John Doe",
      email: "john@example.com",
      username: "johndoe",
      password: "password123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.position).toBe("member");
    }
  });

  it("should default gender to other", async () => {
    const { createUserSchema } = await import("../../src/user/user.validation.js");
    const result = createUserSchema.safeParse({
      departmentId: "dept-1",
      positionId: "pos-1",
      employeeCode: "EMP001",
      name: "John Doe",
      email: "john@example.com",
      username: "johndoe",
      password: "password123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gender).toBe("other");
    }
  });

  it("should accept manager position", async () => {
    const { createUserSchema } = await import("../../src/user/user.validation.js");
    const result = createUserSchema.safeParse({
      departmentId: "dept-1",
      positionId: "pos-1",
      employeeCode: "EMP001",
      name: "John Doe",
      email: "john@example.com",
      username: "johndoe",
      password: "password123",
      position: "manager",
    });
    expect(result.success).toBe(true);
  });

  it("should accept optional fields", async () => {
    const { createUserSchema } = await import("../../src/user/user.validation.js");
    const result = createUserSchema.safeParse({
      departmentId: "dept-1",
      positionId: "pos-1",
      employeeCode: "EMP001",
      name: "John Doe",
      email: "john@example.com",
      phone: "+84123456789",
      birthDate: "1990-01-01",
      hireDate: "2024-01-01",
      gender: "male",
      username: "johndoe",
      password: "password123",
      position: "manager",
      avatarURL: "uploads/avatars/test.png",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+84123456789");
      expect(result.data.gender).toBe("male");
    }
  });

  it("should reject invalid gender", async () => {
    const { createUserSchema } = await import("../../src/user/user.validation.js");
    const result = createUserSchema.safeParse({
      departmentId: "dept-1",
      positionId: "pos-1",
      employeeCode: "EMP001",
      name: "John Doe",
      email: "john@example.com",
      username: "johndoe",
      password: "password123",
      gender: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid position", async () => {
    const { createUserSchema } = await import("../../src/user/user.validation.js");
    const result = createUserSchema.safeParse({
      departmentId: "dept-1",
      positionId: "pos-1",
      employeeCode: "EMP001",
      name: "John Doe",
      email: "john@example.com",
      username: "johndoe",
      password: "password123",
      position: "ceo",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("should accept valid login input", async () => {
    const { loginSchema } = await import("../../src/user/user.validation.js");
    const result = loginSchema.safeParse({
      username: "johndoe",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should fail if username is empty", async () => {
    const { loginSchema } = await import("../../src/user/user.validation.js");
    const result = loginSchema.safeParse({ username: "", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("should fail if password is empty", async () => {
    const { loginSchema } = await import("../../src/user/user.validation.js");
    const result = loginSchema.safeParse({ username: "johndoe", password: "" });
    expect(result.success).toBe(false);
  });

  it("should fail if body is empty", async () => {
    const { loginSchema } = await import("../../src/user/user.validation.js");
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updatePassword", () => {
  it("should accept valid password change", async () => {
    const { updatePassword } = await import("../../src/user/user.validation.js");
    const result = updatePassword.safeParse({
      currentPassword: "oldpass",
      newPassword: "newpass123",
    });
    expect(result.success).toBe(true);
  });

  it("should fail if currentPassword is empty", async () => {
    const { updatePassword } = await import("../../src/user/user.validation.js");
    const result = updatePassword.safeParse({
      currentPassword: "",
      newPassword: "newpass123",
    });
    expect(result.success).toBe(false);
  });

  it("should fail if newPassword is less than 6 characters", async () => {
    const { updatePassword } = await import("../../src/user/user.validation.js");
    const result = updatePassword.safeParse({
      currentPassword: "oldpass",
      newPassword: "12345",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateUserSchema", () => {
  it("should accept empty object (all fields optional)", async () => {
    const { updateUserSchema } = await import("../../src/user/user.validation.js");
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept partial update", async () => {
    const { updateUserSchema } = await import("../../src/user/user.validation.js");
    const result = updateUserSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("should validate email if provided", async () => {
    const { updateUserSchema } = await import("../../src/user/user.validation.js");
    const result = updateUserSchema.safeParse({ email: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should accept status boolean", async () => {
    const { updateUserSchema } = await import("../../src/user/user.validation.js");
    const result = updateUserSchema.safeParse({ status: false });
    expect(result.success).toBe(true);
  });
});

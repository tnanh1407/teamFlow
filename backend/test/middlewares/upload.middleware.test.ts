import { describe, it, expect } from "vitest";

describe("upload middleware", () => {
  it("should export uploadAvatar and uploadAttachment", async () => {
    const mod = await import("../../src/middlewares/upload.middleware.js");
    expect(mod.uploadAvatar).toBeDefined();
    expect(mod.uploadAttachment).toBeDefined();
  });

  it("uploadAvatar should be a multer instance with methods", async () => {
    const { uploadAvatar } = await import("../../src/middlewares/upload.middleware.js");
    expect(typeof uploadAvatar.single).toBe("function");
    expect(typeof uploadAvatar.array).toBe("function");
    expect(typeof uploadAvatar.fields).toBe("function");
  });

  it("uploadAttachment should be a multer instance with methods", async () => {
    const { uploadAttachment } = await import("../../src/middlewares/upload.middleware.js");
    expect(typeof uploadAttachment.single).toBe("function");
    expect(typeof uploadAttachment.array).toBe("function");
    expect(typeof uploadAttachment.fields).toBe("function");
  });
});

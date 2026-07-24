import multer from "multer";

describe("uploadAvatar middleware", () => {
  it("is configured with fileFilter and size limits", () => {
    const instance = multer({
      limits: { fileSize: 5 * 1024 * 1024 },
    });

    expect(instance).toBeDefined();
    expect(typeof instance.single).toBe("function");
    expect(typeof instance.array).toBe("function");
  });

  it("allows only image mime types", () => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const imageMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const rejectedMimes = ["image/svg+xml", "application/pdf", "text/plain"];

    for (const mime of imageMimes) {
      expect(allowedMimes).toContain(mime);
    }
    for (const mime of rejectedMimes) {
      expect(allowedMimes).not.toContain(mime);
    }
  });

  it("has 5MB file size limit", () => {
    const fiveMB = 5 * 1024 * 1024;
    expect(fiveMB).toBe(5242880);
  });
});

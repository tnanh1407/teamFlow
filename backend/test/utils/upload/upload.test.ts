import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs/promises";

vi.mock("fs/promises", () => ({
  default: {
    unlink: vi.fn(),
  },
}));

describe("handleFileUpload", () => {
  it("should return upload path when file is provided", async () => {
    const { handleFileUpload } = await import("../../../src/utils/upload/upload.js");
    const file = { filename: "avatar-123.png" } as Express.Multer.File;
    const result = handleFileUpload(file, "avatars");
    expect(result).toBe("uploads/avatars/avatar-123.png");
  });

  it("should return undefined when file is not provided", async () => {
    const { handleFileUpload } = await import("../../../src/utils/upload/upload.js");
    const result = handleFileUpload(undefined, "avatars");
    expect(result).toBeUndefined();
  });

  it("should handle attachments folder", async () => {
    const { handleFileUpload } = await import("../../../src/utils/upload/upload.js");
    const file = { filename: "doc-456.pdf" } as Express.Multer.File;
    const result = handleFileUpload(file, "attachments");
    expect(result).toBe("uploads/attachments/doc-456.pdf");
  });

  it("should preserve file extension in path", async () => {
    const { handleFileUpload } = await import("../../../src/utils/upload/upload.js");
    const file = { filename: "photo-123.jpg" } as Express.Multer.File;
    const result = handleFileUpload(file, "avatars");
    expect(result).toContain(".jpg");
  });
});

describe("deleteFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call fs.unlink with correct path", async () => {
    vi.mocked(fs.unlink).mockResolvedValue(undefined);

    const { deleteFile } = await import("../../../src/utils/upload/upload.js");
    await deleteFile("uploads/avatars/old-avatar.png");

    expect(fs.unlink).toHaveBeenCalledWith(
      expect.stringContaining("uploads\\avatars\\old-avatar.png")
    );
  });

  it("should not call fs.unlink when fileUrl is null", async () => {
    const { deleteFile } = await import("../../../src/utils/upload/upload.js");
    await deleteFile(null);

    expect(fs.unlink).not.toHaveBeenCalled();
  });

  it("should not call fs.unlink when fileUrl is undefined", async () => {
    const { deleteFile } = await import("../../../src/utils/upload/upload.js");
    await deleteFile(undefined);

    expect(fs.unlink).not.toHaveBeenCalled();
  });

  it("should not call fs.unlink when fileUrl is empty string", async () => {
    const { deleteFile } = await import("../../../src/utils/upload/upload.js");
    await deleteFile("");

    expect(fs.unlink).not.toHaveBeenCalled();
  });

  it("should not throw when fs.unlink fails", async () => {
    vi.mocked(fs.unlink).mockRejectedValue(new Error("File not found"));

    const { deleteFile } = await import("../../../src/utils/upload/upload.js");
    await expect(deleteFile("uploads/avatars/missing.png")).resolves.not.toThrow();
  });

  it("should handle attachment file deletion", async () => {
    vi.mocked(fs.unlink).mockResolvedValue(undefined);

    const { deleteFile } = await import("../../../src/utils/upload/upload.js");
    await deleteFile("uploads/attachments/doc.pdf");

    expect(fs.unlink).toHaveBeenCalledWith(
      expect.stringContaining("uploads\\attachments\\doc.pdf")
    );
  });
});

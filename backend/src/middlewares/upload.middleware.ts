import multer from "multer";

const memoryStorage = multer.memoryStorage();

const imageFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, png, gif, webp are allowed"));
  }
};

const attachmentFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/zip",
    "application/x-rar-compressed",
  ];
  const isAllowed =
    allowed.includes(file.mimetype) ||
    file.mimetype.startsWith("text/") ||
    file.mimetype.startsWith("application/vnd.ms-") ||
    file.mimetype.includes("officedocument") ||
    file.mimetype === "application/octet-stream";
  if (isAllowed) cb(null, true);
  else cb(new Error("Only images, documents, PDFs, and archives are allowed"));
};

export const uploadAvatar = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadAttachment = multer({
  storage: memoryStorage,
  fileFilter: attachmentFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const uploadProjectAvatar = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

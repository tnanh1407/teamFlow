import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, "../../../uploads");


export const handleFileUpload = (
  file : Express.Multer.File | undefined,
  subFolder : string
) : string | undefined => {
  if(!file) return undefined ;
  return `uploads/${subFolder}/${file.filename}`;
}

export const deleteFile = async (fileUrl: string | null | undefined): Promise<void> => {
  if (!fileUrl) return;
  const absolutePath = path.join(uploadsRoot, fileUrl.replace("/uploads/", ""));
  try {
    await fs.unlink(absolutePath);
  } catch {
    // file not found or error
  }
};



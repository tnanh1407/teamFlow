import { v2 as cloudinary } from "cloudinary";
import env from "../../config/env.js";
import { AppError } from "../errors/app-error.js";

const hasConfig = !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

if (hasConfig) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export const uploadToCloudinary = async (
  file: Express.Multer.File | undefined,
  folder: string
): Promise<string | undefined> => {
  if (!file) return undefined;

  if (!hasConfig) {
    throw new AppError("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET", 503);
  }

  const result = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    {
      folder,
      resource_type: "auto",
    }
  );

  return result.secure_url;
};

export const extractPublicIdFromUrl = (url: string): { publicId: string; resourceType: string } | undefined => {
  const match = url.match(/\/(image|raw|video)\/upload\/v\d+\/(.+)$/);
  if (!match) return undefined;
  const [, resourceType, publicId] = match;
  const cleaned = resourceType === "image" ? publicId.replace(/\.[a-zA-Z0-9]+$/, "") : publicId;
  return { publicId: cleaned, resourceType };
};

export const deleteCloudinaryFile = async (url: string | null | undefined): Promise<void> => {
  if (!url) return;
  if (!hasConfig) return;

  const extracted = extractPublicIdFromUrl(url);
  if (!extracted) return;

  try {
    await cloudinary.uploader.destroy(extracted.publicId, { resource_type: extracted.resourceType });
  } catch {
    // file not found on cloudinary or error
  }
};

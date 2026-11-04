import { createHash } from "node:crypto";

export const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? "";
export const CLOUDINARY_KEY = process.env.CLOUDINARY_API_KEY ?? "";
const CLOUDINARY_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

export const CLOUDINARY_READY = Boolean(CLOUDINARY_CLOUD && CLOUDINARY_KEY && CLOUDINARY_SECRET);

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

/**
 * Cloudinary signed-upload parameters. The API secret only ever exists here,
 * on the server; the browser receives a short-lived signature scoped to a folder.
 */
export function createUploadSignature(folder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "untouch"): UploadSignature {
  if (!CLOUDINARY_READY) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    );
  }
  const timestamp = Math.round(Date.now() / 1000);
  const params = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(`${params}${CLOUDINARY_SECRET}`).digest("hex");
  return {
    cloudName: CLOUDINARY_CLOUD,
    apiKey: CLOUDINARY_KEY,
    timestamp,
    folder,
    signature,
  };
}

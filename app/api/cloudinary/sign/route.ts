import type { NextRequest } from "next/server";
import { assertSameOrigin, HttpError, jsonError, rateLimit, requireUser } from "@/lib/server/auth";
import { createUploadSignature, CLOUDINARY_CLOUD, CLOUDINARY_READY } from "@/lib/server/cloudinary";

export const runtime = "nodejs";

const ADMIN_SCOPES = new Set(["product", "category", "banner", "branding"]);

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const token = await requireUser(request);
    rateLimit(`cloudinary:${token.uid}`, 30, 60_000);

    if (!CLOUDINARY_READY) {
      throw new HttpError(
        503,
        "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on the server.",
      );
    }

    const body = (await request.json().catch(() => ({}))) as { scope?: string };
    const scope = body.scope ?? "product";

    if (ADMIN_SCOPES.has(scope) && token.admin !== true) {
      throw new HttpError(403, "Only administrators can upload restaurant media.");
    }

    const baseFolder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "untouch";
    const folder =
      scope === "avatar" ? `${baseFolder}/avatars/${token.uid}` : `${baseFolder}/${scope}`;

    const signed = createUploadSignature(folder);
    return Response.json({
      ...signed,
      cloudName: CLOUDINARY_CLOUD,
      uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
      maxBytes: 8 * 1024 * 1024,
    });
  } catch (error) {
    return jsonError(error);
  }
}

"use client";

import { authedFetch } from "@/lib/api";

export type UploadScope = "product" | "category" | "banner" | "branding" | "avatar";

/**
 * Browser → Cloudinary direct upload using a server-issued signature.
 * The API secret never reaches the client.
 */
export async function uploadToCloudinary(file: File, scope: UploadScope = "product"): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are supported.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Images must be smaller than 8 MB.");
  }

  const signResponse = await authedFetch("/api/cloudinary/sign", {
    method: "POST",
    body: JSON.stringify({ scope }),
  });
  const signature = (await signResponse.json()) as {
    apiKey?: string;
    timestamp?: number;
    folder?: string;
    signature?: string;
    uploadUrl?: string;
    error?: string;
  };
  if (!signResponse.ok || !signature.uploadUrl) {
    throw new Error(signature.error ?? "Could not sign the upload.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signature.apiKey ?? "");
  form.append("timestamp", String(signature.timestamp ?? ""));
  form.append("folder", signature.folder ?? "");
  form.append("signature", signature.signature ?? "");

  const upload = await fetch(signature.uploadUrl, { method: "POST", body: form });
  const payload = (await upload.json()) as { secure_url?: string; error?: { message?: string } };
  if (!upload.ok || !payload.secure_url) {
    throw new Error(payload.error?.message ?? "Cloudinary rejected the upload.");
  }
  return payload.secure_url;
}

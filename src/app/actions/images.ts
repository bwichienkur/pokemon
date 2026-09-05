"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { ValidationError } from "@/lib/auth/errors";
import { replaceCardImages } from "@/lib/data/repository";
import { env } from "@/lib/env";
import type { ImageType } from "@/types/database";

const maxImageSize = 15 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const imageTypes = ["FRONT", "BACK", "LABEL", "DETAIL"] as const;

const cardImagesSchema = z.array(z.object({
  imageUrl: z.string().trim().min(1).max(2_000),
  storagePath: z.string().trim().max(1_000).nullable().optional(),
  imageType: z.enum(imageTypes),
  altText: z.string().trim().max(250).nullable().optional(),
  sortOrder: z.number().int().min(0).max(100),
  width: z.number().int().positive().max(12_000).nullable().optional(),
  height: z.number().int().positive().max(12_000).nullable().optional(),
}).strict()).max(20);

function extensionFor(contentType: string): string {
  return contentType === "image/jpeg" ? "jpg" : contentType === "image/png" ? "png" : "webp";
}

/**
 * Stores a raster card image. SVG is deliberately excluded because locally
 * serving user-supplied SVG can introduce active-content risks.
 */
export async function uploadCardImageAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new ValidationError("Choose an image to upload.");
  if (!acceptedImageTypes.has(file.type)) {
    throw new ValidationError("Use a JPEG, PNG, or WebP image.");
  }
  if (!file.size || file.size > maxImageSize) {
    throw new ValidationError("Images must be between 1 byte and 15 MB.");
  }

  const fileName = `${crypto.randomUUID()}.${extensionFor(file.type)}`;
  const storagePath = `cards/${fileName}`;
  if (env.isSupabaseConfigured) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const storage = createAdminClient().storage.from("card-images");
    const { error } = await storage.upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new ValidationError(`Image upload failed: ${error.message}`);
    const { data } = storage.getPublicUrl(storagePath);
    return { imageUrl: data.publicUrl, storagePath };
  }

  const directory = path.join(process.cwd(), "public", "uploads", "cards");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, fileName), Buffer.from(await file.arrayBuffer()));
  return { imageUrl: `/uploads/cards/${fileName}`, storagePath: null };
}

export async function saveCardImagesAction(cardId: string, input: unknown) {
  const admin = await requireAdmin();
  if (!z.string().uuid().safeParse(cardId).success) throw new ValidationError("Invalid card.");
  const parsed = cardImagesSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message);
  const images = await replaceCardImages(cardId, parsed.data as Array<{
    imageUrl: string;
    storagePath: string | null;
    imageType: ImageType;
    altText: string | null;
    sortOrder: number;
    width: number | null;
    height: number | null;
  }>, admin.id);
  revalidatePath(`/admin/cards/${cardId}/edit`);
  revalidatePath("/admin/cards");
  return images;
}

"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { uploadSchema } from "@/schemas/ocr";

/**
 * Upload scoresheet and return base64 data URL for OCR.
 * Bypasses Supabase Storage to avoid RLS issues on dedicated Alem.Plus instance.
 */
export async function uploadScoresheet(formData: FormData): Promise<{ fileUrl: string; filePath: string } | { error: string }> {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };

  const parsed = uploadSchema.safeParse({ file });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid file" };
  }

  // Auth check
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Convert file to base64 data URL for direct OCR API consumption
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = file.type || "image/jpeg";
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return { fileUrl: dataUrl, filePath: `${user.id}/${file.name}` };
}

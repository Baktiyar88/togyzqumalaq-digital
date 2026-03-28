"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { uploadSchema } from "@/schemas/ocr";

export async function uploadScoresheet(formData: FormData): Promise<{ fileUrl: string; filePath: string } | { error: string }> {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };

  const parsed = uploadSchema.safeParse({ file });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid file" };
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const ext = file.name.split(".").pop() ?? "jpg";
  const filePath = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("blanks")
    .upload(filePath, file, { contentType: file.type });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const { data: urlData } = await supabase.storage
    .from("blanks")
    .createSignedUrl(filePath, 3600);

  if (!urlData?.signedUrl) return { error: "Failed to generate URL" };

  return { fileUrl: urlData.signedUrl, filePath };
}

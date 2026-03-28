"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export async function uploadScoresheet(formData: FormData): Promise<{ fileUrl: string; filePath: string } | { error: string }> {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };

  if (file.size > 20 * 1024 * 1024) return { error: "File must be under 20MB" };

  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowed.includes(file.type)) return { error: "Only JPEG, PNG, PDF accepted" };

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

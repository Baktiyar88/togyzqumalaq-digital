"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { recognizeScoresheet } from "@/lib/ocr/ocr-client";
import { ocrRequestSchema } from "@/schemas/ocr";
import type { ParsedMove } from "@/lib/ocr/types";

const OCR_RATE_LIMIT = 60; // per hour per user
const OCR_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function triggerOCR(fileUrl: string): Promise<{ jobId: string; moves: ParsedMove[]; confidence: number } | { error: string }> {
  const parsed = ocrRequestSchema.safeParse({ fileUrl });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid file URL" };
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Rate limit check: count OCR jobs in last hour
  const oneHourAgo = new Date(Date.now() - OCR_RATE_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("ocr_jobs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneHourAgo);

  if (count !== null && count >= OCR_RATE_LIMIT) {
    return { error: `Rate limit exceeded. Maximum ${OCR_RATE_LIMIT} OCR requests per hour.` };
  }

  // Create OCR job
  const { data: job, error: jobError } = await supabase
    .from("ocr_jobs")
    .insert({
      user_id: user.id,
      file_path: fileUrl,
      model: "deepseek-ocr",
      status: "processing",
      progress: 10,
    })
    .select()
    .single();

  if (jobError || !job) return { error: `Failed to create OCR job: ${jobError?.message}` };

  try {
    // Update progress
    await supabase.from("ocr_jobs").update({ progress: 30 }).eq("id", job.id);

    // Call OCR
    const result = await recognizeScoresheet(fileUrl);

    // Update job with results
    await supabase
      .from("ocr_jobs")
      .update({
        status: "completed",
        progress: 100,
        raw_result: result,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return { jobId: job.id, moves: result.moves, confidence: result.confidence };
  } catch (err) {
    const message = err instanceof Error ? err.message : "OCR failed";
    await supabase
      .from("ocr_jobs")
      .update({ status: "failed", error_message: message, progress: 0 })
      .eq("id", job.id);

    return { error: message };
  }
}

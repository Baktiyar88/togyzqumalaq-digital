"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { recognizeScoresheet } from "@/lib/ocr/ocr-client";
import type { ParsedMove } from "@/lib/ocr/types";

export async function triggerOCR(fileUrl: string): Promise<{ jobId: string; moves: ParsedMove[]; confidence: number } | { error: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

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

"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { recognizeScoresheet } from "@/lib/ocr/ocr-client";
import { ocrRequestSchema } from "@/schemas/ocr";
import type { ParsedMove } from "@/lib/ocr/types";

export async function triggerOCR(fileUrl: string): Promise<{ jobId: string; moves: ParsedMove[]; confidence: number } | { error: string }> {
  const parsed = ocrRequestSchema.safeParse({ fileUrl });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid file URL" };
  }

  // Auth check
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    // Call OCR directly (skip job tracking if DB has RLS issues)
    const result = await recognizeScoresheet(fileUrl);

    return {
      jobId: crypto.randomUUID(),
      moves: result.moves,
      confidence: result.confidence,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "OCR failed";
    return { error: message };
  }
}

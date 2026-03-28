// Supabase Edge Function for OCR processing
// Processes scoresheet images via DeepSeek OCR with JWT auth and progress updates

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OCR_URL = Deno.env.get("DEEPSEEK_OCR_URL") ?? "https://llm.alem.ai/v1/chat/completions";
const OCR_KEY = Deno.env.get("DEEPSEEK_OCR_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const ALLOWED_URL_PREFIX = `${SUPABASE_URL}/storage/v1`;

if (!OCR_KEY) {
  throw new Error("DEEPSEEK_OCR_API_KEY is required");
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // Authenticate via JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonError("Unauthorized", 401);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return jsonError("Unauthorized", 401);
  }

  // Parse and validate input
  let body: { fileUrl?: string; jobId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const { fileUrl, jobId } = body;
  if (!fileUrl || !jobId) {
    return jsonError("fileUrl and jobId required", 400);
  }

  // SSRF protection: only allow Supabase storage URLs
  if (!fileUrl.startsWith(ALLOWED_URL_PREFIX)) {
    return jsonError("Invalid fileUrl: must be a Supabase storage URL", 400);
  }

  try {
    // Update job status to processing
    await supabase.from("ocr_jobs").update({
      status: "processing",
      progress: 10,
    }).eq("id", jobId).eq("user_id", user.id);

    // Call OCR API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    const response = await fetch(OCR_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${OCR_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-ocr",
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: fileUrl } },
              {
                type: "text",
                text: "Extract all moves from this togyzqumalaq scoresheet. Return JSON: { moves: [{moveNumber, side, fromPit}] }",
              },
            ],
          },
        ],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OCR API returned ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content ?? "";

    // Update job as completed
    await supabase.from("ocr_jobs").update({
      status: "completed",
      progress: 100,
      raw_result: { rawText },
      completed_at: new Date().toISOString(),
    }).eq("id", jobId).eq("user_id", user.id);

    return new Response(JSON.stringify({ success: true, rawText }), {
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OCR failed";

    // Update job as failed
    await supabase.from("ocr_jobs").update({
      status: "failed",
      error_message: message,
    }).eq("id", jobId).eq("user_id", user.id);

    return jsonError(message, 500);
  }
});

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

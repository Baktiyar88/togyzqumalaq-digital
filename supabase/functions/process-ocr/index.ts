// Supabase Edge Function for OCR processing
// Used for async/background OCR with Realtime progress updates
// Currently OCR runs via Server Actions — this is for future batch processing

const OCR_URL = Deno.env.get("DEEPSEEK_OCR_URL") ?? "https://llm.alem.ai/v1/chat/completions";
const OCR_KEY = Deno.env.get("DEEPSEEK_OCR_API_KEY") ?? "";

Deno.serve(async (req) => {
  const { fileUrl, jobId } = await req.json();

  if (!fileUrl || !jobId) {
    return new Response(JSON.stringify({ error: "fileUrl and jobId required" }), { status: 400 });
  }

  try {
    const response = await fetch(OCR_URL, {
      method: "POST",
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
              { type: "text", text: "Extract all moves from this togyzqumalaq scoresheet. Return JSON: { moves: [{moveNumber, side, fromPit}] }" },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ success: true, rawText }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OCR failed";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});

import type { OcrResult } from "./types";
import { parseMoves } from "./move-parser";

const OCR_URL = process.env.DEEPSEEK_OCR_URL ?? "https://llm.alem.ai/v1/chat/completions";
const OCR_KEY = process.env.DEEPSEEK_OCR_API_KEY ?? "";

const SYSTEM_PROMPT = `You are an OCR system specialized in reading togyzqumalaq tournament scoresheets.
Extract all moves from the scoresheet image.
Return ONLY valid JSON with this exact format:
{
  "moves": [
    { "moveNumber": 1, "side": "white", "fromPit": 5 },
    { "moveNumber": 1, "side": "black", "fromPit": 3 },
    { "moveNumber": 2, "side": "white", "fromPit": 7 }
  ]
}
Rules:
- moveNumber starts at 1 and increments
- side alternates: "white" first, then "black"
- fromPit is a number 1-9 (the pit the player moves from)
- If you cannot read a move clearly, skip it
- Return empty moves array if nothing is readable`;

export async function recognizeScoresheet(imageUrl: string): Promise<OcrResult> {
  const startTime = Date.now();

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
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl } },
            { type: "text", text: "Extract all moves from this togyzqumalaq tournament scoresheet. Return JSON only." },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OCR API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content ?? "";
  const moves = parseMoves(rawText);
  const processingTimeMs = Date.now() - startTime;

  return {
    moves,
    confidence: moves.length > 0 ? 0.85 : 0,
    rawText,
    processingTimeMs,
  };
}

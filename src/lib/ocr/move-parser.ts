import type { ParsedMove } from "./types";

/**
 * Parse OCR raw text (JSON) into structured moves.
 * Handles both clean JSON and JSON embedded in markdown code blocks.
 */
export function parseMoves(rawText: string): ParsedMove[] {
  const jsonStr = extractJson(rawText);
  if (!jsonStr) return [];

  try {
    const parsed = JSON.parse(jsonStr);
    const rawMoves = parsed.moves ?? parsed;

    if (!Array.isArray(rawMoves)) return [];

    return rawMoves
      .filter(isValidRawMove)
      .map((m): ParsedMove => ({
        moveNumber: Number(m.moveNumber),
        side: m.side === "black" ? "black" : "white",
        fromPit: Number(m.fromPit),
        notation: m.notation,
      }));
  } catch {
    return [];
  }
}

function extractJson(text: string): string | null {
  // Try direct parse first
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;

  // Extract from markdown code block
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  // Find first { to last }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last > first) return trimmed.slice(first, last + 1);

  return null;
}

function isValidRawMove(m: unknown): boolean {
  if (typeof m !== "object" || m === null) return false;
  const obj = m as Record<string, unknown>;
  const pit = Number(obj.fromPit);
  return (
    typeof obj.moveNumber === "number" &&
    obj.moveNumber >= 1 &&
    typeof obj.side === "string" &&
    ["white", "black"].includes(obj.side) &&
    pit >= 1 &&
    pit <= 9
  );
}

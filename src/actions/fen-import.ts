"use server";

import { parseFen, validateFen } from "@/lib/game-engine/fen";
import { createInitialState, executeMoveByPit } from "@/lib/game-engine/engine";
import { toFen } from "@/lib/game-engine/fen";

export interface ImportedGame {
  fenSequence: string[];
  moveCount: number;
  valid: boolean;
  error?: string;
}

export async function importFenFile(content: string): Promise<ImportedGame> {
  const lines = content.trim().split("\n").map((l) => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    return { fenSequence: [], moveCount: 0, valid: false, error: "Empty file" };
  }

  const fenSequence: string[] = [];
  let errorMsg: string | undefined;

  for (const line of lines) {
    // Handle lines like "1w: 9,9,..." or just FEN directly
    const fenPart = line.includes(":") ? line.split(":").slice(1).join(":").trim() : line;

    const validation = validateFen(fenPart);
    if (!validation.valid) {
      errorMsg = `Invalid FEN at line: ${validation.error}`;
      continue;
    }
    fenSequence.push(fenPart);
  }

  return {
    fenSequence,
    moveCount: fenSequence.length,
    valid: fenSequence.length > 0,
    error: errorMsg,
  };
}

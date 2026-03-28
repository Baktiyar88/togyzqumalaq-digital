import { z } from "zod";
import { TOTAL_STONES } from "@/lib/game-engine/types";

export const createGameSchema = z.object({
  tournamentId: z.string().uuid().optional(),
  whitePlayerId: z.string().uuid(),
  blackPlayerId: z.string().uuid(),
  sourceType: z.enum(["ocr", "manual"]),
});

export const addMoveSchema = z.object({
  gameId: z.string().uuid(),
  moveNumber: z.number().int().min(1),
  side: z.enum(["white", "black"]),
  fromPit: z.number().int().min(1).max(9),
});

export const fenSchema = z
  .string()
  .refine(
    (fen) => {
      const parts = fen.trim().split(/\s+/);
      if (parts.length !== 5) return false;
      const [board, s1, s2, side, move] = parts;
      const ranks = board.split("/");
      if (ranks.length !== 2) return false;
      if (!["S", "N"].includes(side)) return false;
      const moveNum = parseInt(move);
      if (isNaN(moveNum) || moveNum < 1) return false;
      // Validate stone sum = 162
      const pits = ranks
        .flatMap((r) => r.split(","))
        .map((t) => parseInt(t.replace(/[a-zA-Z]/g, "")));
      if (pits.some((v) => isNaN(v) || v < 0)) return false;
      const total = pits.reduce((a, b) => a + b, 0) + parseInt(s1) + parseInt(s2);
      return total === TOTAL_STONES;
    },
    { message: `FEN must have total stones = ${TOTAL_STONES}` }
  );

export const searchGamesSchema = z.object({
  opponent: z.string().optional(),
  tournament: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  result: z.enum(["white", "black", "draw", "ongoing"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type AddMoveInput = z.infer<typeof addMoveSchema>;
export type SearchGamesInput = z.infer<typeof searchGamesSchema>;

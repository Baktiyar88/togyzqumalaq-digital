"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { createInitialState, executeMoveByPit } from "@/lib/game-engine/engine";
import { toFen } from "@/lib/game-engine/fen";
import type { ParsedMove } from "@/lib/ocr/types";

export async function createGame(input: {
  tournamentId?: string;
  whitePlayerId: string;
  blackPlayerId: string;
  sourceType: "ocr" | "manual";
}): Promise<{ gameId: string } | { error: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("games")
    .insert({
      tournament_id: input.tournamentId ?? null,
      white_player_id: input.whitePlayerId,
      black_player_id: input.blackPlayerId,
      source_type: input.sourceType,
      result: "ongoing",
      created_by: user.id,
      date_played: new Date().toISOString().split("T")[0],
    })
    .select("id")
    .single();

  if (error || !data) return { error: `Failed to create game: ${error?.message}` };
  return { gameId: data.id };
}

export async function saveMoves(
  gameId: string,
  moves: ParsedMove[]
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createServerSupabase();

  // Validate moves by replaying through engine
  let state = createInitialState();
  const moveRows = [];

  for (const move of moves) {
    const side = move.side === "white" ? "south" : "north";
    if (state.currentSide !== side) continue; // skip out-of-order

    const result = executeMoveByPit(state, move.fromPit);
    if (result.error) continue; // skip invalid moves

    state = result.state;
    moveRows.push({
      game_id: gameId,
      move_number: move.moveNumber,
      side: move.side,
      from_pit: move.fromPit,
      fen_after: toFen(state),
    });
  }

  if (moveRows.length === 0) return { error: "No valid moves to save" };

  const { error } = await supabase.from("moves").insert(moveRows);
  if (error) return { error: `Failed to save moves: ${error.message}` };

  // Update game result if game ended
  if (state.isGameOver && state.winner) {
    const result = state.winner === "south" ? "white" : state.winner === "north" ? "black" : "draw";
    await supabase.from("games").update({ result }).eq("id", gameId);
  }

  return { success: true };
}

export async function getGame(gameId: string) {
  const supabase = await createServerSupabase();

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (gameError || !game) return { error: "Game not found" };

  const { data: moves } = await supabase
    .from("moves")
    .select("*")
    .eq("game_id", gameId)
    .order("move_number", { ascending: true })
    .order("side", { ascending: true });

  return { game, moves: moves ?? [] };
}

export async function searchGames(query: {
  opponent?: string;
  tournament?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { games: [], total: 0 };

  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const from = (page - 1) * limit;

  let q = supabase
    .from("games")
    .select("*", { count: "exact" })
    .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id},created_by.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (query.tournament) {
    q = q.ilike("notes", `%${query.tournament}%`);
  }

  const { data, count, error } = await q;
  if (error) return { games: [], total: 0 };

  return { games: data ?? [], total: count ?? 0 };
}

export async function exportGameFen(gameId: string): Promise<{ fen: string } | { error: string }> {
  const result = await getGame(gameId);
  if ("error" in result) return { error: result.error as string };

  const fenLines = result.moves.map(
    (m) => `${m.move_number}${m.side === "white" ? "w" : "b"}: ${m.fen_after}`
  );

  return { fen: fenLines.join("\n") };
}

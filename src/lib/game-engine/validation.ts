import type { GameState, Side } from "./types";
import { stonesAt } from "./board";
import { positionSide, sidePositions, pitIndex } from "./pos";

/** Check if a move is valid */
export function isValidMove(
  state: GameState,
  fromIndex: number
): { valid: boolean; error?: string } {
  if (state.isGameOver) {
    return { valid: false, error: "Game is over" };
  }

  if (positionSide(fromIndex) !== state.currentSide) {
    return { valid: false, error: "Cannot move from opponent's pit" };
  }

  if (stonesAt(state.board, fromIndex) === 0) {
    return { valid: false, error: "Pit is empty" };
  }

  return { valid: true };
}

/** Check if a pit number (1-9) is valid for current side */
export function isValidPitMove(
  state: GameState,
  pit: number
): { valid: boolean; error?: string } {
  if (pit < 1 || pit > 9) {
    return { valid: false, error: "Pit must be between 1 and 9" };
  }
  const index = pitIndex(state.currentSide, pit);
  return isValidMove(state, index);
}

/** Get all valid pit numbers (1-9) for current side */
export function validPitNumbers(state: GameState): readonly number[] {
  if (state.isGameOver) return [];
  const positions = sidePositions(state.currentSide);
  return positions
    .filter((i) => stonesAt(state.board, i) > 0)
    .map((i) => {
      if (state.currentSide === "south") return i + 1;
      return 18 - i; // reverse for north
    });
}

/** Check if game is in a terminal state */
export function isTerminal(state: GameState): boolean {
  return state.isGameOver;
}

/** Get game result description */
export function gameResult(state: GameState): string | null {
  if (!state.isGameOver) return null;
  if (state.winner === "draw") return "Draw (81-81)";
  if (state.winner === "south")
    return `South wins (${state.score.south}-${state.score.north})`;
  if (state.winner === "north")
    return `North wins (${state.score.north}-${state.score.south})`;
  return null;
}

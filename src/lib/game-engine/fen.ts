import {
  BOARD_WIDTH,
  BOARD_SIZE,
  TOTAL_STONES,
  type FenComponents,
  type GameState,
  type Side,
} from "./types";
import { stonesAt } from "./board";
import { positionSide } from "./pos";

/**
 * FEN format for togyzkumalak:
 * [pits_south comma-sep]/[pits_north comma-sep] [score_south] [score_north] [side] [move_number]
 *
 * Example initial: 9S,9S,9S,9S,9S,9S,9S,9S,9S/9S,9S,9S,9S,9S,9S,9S,9S,9S 0 0 S 1
 * Simplified:      9,9,9,9,9,9,9,9,9/9,9,9,9,9,9,9,9,9 0 0 S 1
 */

/** Initial FEN string */
export const INITIAL_FEN =
  "9,9,9,9,9,9,9,9,9/9,9,9,9,9,9,9,9,9 0 0 S 1";

/** Convert game state to FEN string */
export function toFen(state: GameState): string {
  // South pits: indices 0-8 (A1 to I1)
  const southPits: string[] = [];
  for (let i = 0; i < BOARD_WIDTH; i++) {
    const count = stonesAt(state.board, i);
    const isTuzdik = state.tuzdikNorth === i; // north's tuzdik is on south's side
    southPits.push(isTuzdik ? `${count}t` : `${count}`);
  }

  // North pits: indices 9-17 (I2 to A2, stored reversed)
  const northPits: string[] = [];
  for (let i = BOARD_WIDTH; i < BOARD_SIZE; i++) {
    const count = stonesAt(state.board, i);
    const isTuzdik = state.tuzdikSouth === i; // south's tuzdik is on north's side
    northPits.push(isTuzdik ? `${count}t` : `${count}`);
  }

  const sideChar = state.currentSide === "south" ? "S" : "N";
  return `${southPits.join(",")
  }/${northPits.join(",")
  } ${state.score.south} ${state.score.north} ${sideChar} ${state.moveNumber}`;
}

/** Parse FEN string to components */
export function parseFen(fen: string): FenComponents | null {
  const parts = fen.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const [boardStr, scoreSouthStr, scoreNorthStr, sideStr, moveStr] = parts;
  const ranks = boardStr.split("/");
  if (ranks.length !== 2) return null;

  const pitsSouth = parsePits(ranks[0]);
  const pitsNorth = parsePits(ranks[1]);
  if (!pitsSouth || !pitsNorth) return null;
  if (pitsSouth.length !== BOARD_WIDTH || pitsNorth.length !== BOARD_WIDTH) return null;

  const scoreSouth = parseInt(scoreSouthStr, 10);
  const scoreNorth = parseInt(scoreNorthStr, 10);
  if (isNaN(scoreSouth) || isNaN(scoreNorth)) return null;
  if (scoreSouth < 0 || scoreNorth < 0) return null;

  if (sideStr !== "S" && sideStr !== "N") return null;
  const side: Side = sideStr === "S" ? "south" : "north";

  const moveNumber = parseInt(moveStr, 10);
  if (isNaN(moveNumber) || moveNumber < 1) return null;

  // Detect tuzdyk markers
  let tuzdikSouth: number | null = null; // south's tuzdik on north's side
  let tuzdikNorth: number | null = null; // north's tuzdik on south's side

  const southTokens = ranks[0].split(",");
  const northTokens = ranks[1].split(",");

  southTokens.forEach((token, i) => {
    if (token.includes("t")) tuzdikNorth = i; // north has tuzdik on south's pit i
  });
  northTokens.forEach((token, i) => {
    if (token.includes("t")) tuzdikSouth = BOARD_WIDTH + i; // south has tuzdik on north's pit
  });

  return {
    pitsSouth,
    pitsNorth,
    scoreSouth,
    scoreNorth,
    side,
    moveNumber,
    tuzdikSouth,
    tuzdikNorth,
  };
}

/** Parse a rank's pit values (e.g., "9,9,0t,9,9,9,9,9,9") */
function parsePits(rankStr: string): readonly number[] | null {
  const tokens = rankStr.split(",");
  const values: number[] = [];

  for (const token of tokens) {
    const num = parseInt(token.replace(/[a-zA-Z]/g, ""), 10);
    if (isNaN(num) || num < 0) return null;
    values.push(num);
  }

  return values;
}

/** Validate a FEN string */
export function validateFen(fen: string): { valid: boolean; error?: string } {
  const components = parseFen(fen);
  if (!components) return { valid: false, error: "Invalid FEN format" };

  const { pitsSouth, pitsNorth, scoreSouth, scoreNorth } = components;

  // Check all values non-negative
  if (pitsSouth.some((v) => v < 0) || pitsNorth.some((v) => v < 0)) {
    return { valid: false, error: "Pit values must be >= 0" };
  }
  if (scoreSouth < 0 || scoreNorth < 0) {
    return { valid: false, error: "Scores must be >= 0" };
  }

  // Check total stones = 162
  const totalPits =
    pitsSouth.reduce((a, b) => a + b, 0) +
    pitsNorth.reduce((a, b) => a + b, 0);
  const total = totalPits + scoreSouth + scoreNorth;
  if (total !== TOTAL_STONES) {
    return {
      valid: false,
      error: `Total stones must be ${TOTAL_STONES}, got ${total}`,
    };
  }

  return { valid: true };
}

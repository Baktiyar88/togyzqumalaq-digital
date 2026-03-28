import { BOARD_WIDTH, BOARD_SIZE, type Side } from "./types";

/**
 * Position mapping for togyzkumalak board.
 * South (P1): indices 0-8 (A1-I1, left to right)
 * North (P2): indices 9-17 (I2-A2, right to left from south's perspective)
 *
 * Physical layout (south's view):
 *   North: [17] [16] [15] [14] [13] [12] [11] [10] [9]
 *            A2   B2   C2   D2   E2   F2   G2   H2  I2
 *   South: [0]  [1]  [2]  [3]  [4]  [5]  [6]  [7]  [8]
 *            A1   B1   C1   D1   E1   F1   G1   H1  I1
 */

/** Get the side that owns a position */
export function positionSide(index: number): Side {
  return index < BOARD_WIDTH ? "south" : "north";
}

/** Check if position is pit 9 (kazan-adjacent) — cannot become tuzdik */
export function isLastPit(index: number): boolean {
  // South pit 9 = index 8, North pit 9 = index 9
  // pitNumber: south = index+1, north = BOARD_SIZE-index
  const pit = index < BOARD_WIDTH ? index + 1 : BOARD_SIZE - index;
  return pit === BOARD_WIDTH;
}

/** Get the opposite position (directly across the board) */
export function oppositeIndex(index: number): number {
  if (index < BOARD_WIDTH) return index + BOARD_WIDTH;
  return index - BOARD_WIDTH;
}

/**
 * Get the next position in sowing order (counter-clockwise).
 * South: 0→1→2→...→8→9→10→...→17→0
 */
export function nextPosition(index: number): number {
  return (index + 1) % BOARD_SIZE;
}

/**
 * Calculate destination position after sowing `count` stones from `origin`.
 * If count == 1: move to next position
 * If count > 1: first stone stays, remaining sow forward (count-1 steps from origin)
 */
export function destinationIndex(origin: number, count: number): number {
  if (count === 1) return nextPosition(origin);
  // First stone stays in origin, remaining (count-1) sow forward
  let pos = origin;
  for (let i = 0; i < count - 1; i++) {
    pos = nextPosition(pos);
  }
  return pos;
}

/** Get pit number (1-9) from index */
export function pitNumber(index: number): number {
  if (index < BOARD_WIDTH) return index + 1;
  return BOARD_SIZE - index; // reverse for north side
}

/** Get index from side and pit number (1-9) */
export function pitIndex(side: Side, pit: number): number {
  if (side === "south") return pit - 1;
  return BOARD_SIZE - pit; // reverse for north
}

/** All position indices for a side */
export function sidePositions(side: Side): readonly number[] {
  if (side === "south") return [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return [9, 10, 11, 12, 13, 14, 15, 16, 17];
}

/** Human-readable position label (A1, B1, ... I1, I2, H2, ... A2) */
export function positionLabel(index: number): string {
  const files = "ABCDEFGHI";
  if (index < BOARD_WIDTH) return `${files[index]}1`;
  return `${files[BOARD_SIZE - 1 - index]}2`;
}

import {
  BOARD_SIZE,
  BOARD_WIDTH,
  INITIAL_STONES_PER_PIT,
  type PieceMap,
  type PitState,
  type Side,
} from "./types";
import { createStone } from "./piece";
import { positionSide, sidePositions } from "./pos";

/** Create the initial board state (9 stones in each of 18 pits) */
export function initialBoard(): PieceMap {
  const map = new Map<number, PitState>();
  for (let i = 0; i < BOARD_SIZE; i++) {
    map.set(i, {
      piece: createStone(positionSide(i)),
      count: INITIAL_STONES_PER_PIT,
    });
  }
  return map;
}

/** Get stone count at a position */
export function stonesAt(board: PieceMap, index: number): number {
  return board.get(index)?.count ?? 0;
}

/** Create a new board with an updated pit */
export function setPit(
  board: PieceMap,
  index: number,
  state: PitState
): PieceMap {
  const next = new Map(board);
  next.set(index, state);
  return next;
}

/** Create a new board with a pit emptied */
export function emptyPit(board: PieceMap, index: number): PieceMap {
  const next = new Map(board);
  next.set(index, { piece: createStone(positionSide(index)), count: 0 });
  return next;
}

/** Add stones to a pit */
export function addStones(
  board: PieceMap,
  index: number,
  amount: number
): PieceMap {
  const current = stonesAt(board, index);
  const side = positionSide(index);
  const role = board.get(index)?.piece.role ?? "stone";
  const next = new Map(board);
  next.set(index, {
    piece: { side, role },
    count: current + amount,
  });
  return next;
}

/** Calculate total stones on board (excluding kazans/scores) */
export function totalStonesOnBoard(board: PieceMap): number {
  let total = 0;
  for (const [, pit] of board) {
    total += pit.count;
  }
  return total;
}

/** Get all non-empty positions for a side */
export function nonEmptyPositions(
  board: PieceMap,
  side: Side
): readonly number[] {
  return sidePositions(side).filter((i) => stonesAt(board, i) > 0);
}
